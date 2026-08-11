import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Container, ContainerStatus } from './schemas/container.schema';
import { Transaction, TransactionType } from '../transactions/schemas/transaction.schema';
import { User } from '../users/schemas/user.schema';
import { Organization } from '../organizations/schemas/organization.schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ContainersService {
  constructor(
    @InjectModel(Container.name) private containerModel: Model<Container>,
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Organization.name) private orgModel: Model<Organization>,
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
  ) {}

  private async getOrCreateContainer(serialNumber: string, status: ContainerStatus, userId?: string) {
    let container = await this.containerModel.findOne({ serialNumber });
    if (!container) {
      try {
        container = new this.containerModel({
          serialNumber,
          type: 'Generic Container',
          status,
          currentUserId: userId ? new Types.ObjectId(userId) : undefined,
        });
        await container.save();
      } catch (e) {
        // If someone else created it in the meantime, fetch that one
        container = await this.containerModel.findOne({ serialNumber });
        if (!container) throw new BadRequestException('Failed to process container');
      }
    }
    return container;
  }

  async issue(serialNumber: string, userId: string, vendorId: string) {
    const container = await this.getOrCreateContainer(serialNumber, ContainerStatus.AVAILABLE);

    if (container.status !== ContainerStatus.AVAILABLE && container.status !== ContainerStatus.RETURNED) {
      // If it's already issued to the SAME user, don't error, just return successful. 
      // This helps with idempotent syncs.
      if (container.currentUserId?.toString() === userId) {
        return { message: 'Container already issued to you', container };
      }
      throw new BadRequestException('Container is already issued to someone else');
    }

    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    // Update container state
    container.status = ContainerStatus.ISSUED;
    container.currentUserId = user._id as Types.ObjectId;
    container.lastVendorId = new Types.ObjectId(vendorId);
    await container.save();

    // Log transaction
    const transaction = new this.transactionModel({
      userId: user._id,
      vendorId: new Types.ObjectId(vendorId),
      containerId: container._id,
      type: TransactionType.ISSUE,
      pointsAwarded: 0,
      plasticSaved: 0,
      co2Saved: 0,
      organizationId: container.organizationId || null,
      signature: `SIG_${Date.now()}_${serialNumber}`,
    });
    await transaction.save();

    this.eventEmitter.emit('container.issued', { userId: user._id.toString(), serialNumber });

    return { 
      message: 'Container issued successfully',
      container,
      transaction 
    };
  }

  async return(serialNumber: string, userId: string, vendorId: string, collectionPointId?: string) {
    let container = await this.containerModel.findOne({ serialNumber });

    if (!container) {
      container = await this.getOrCreateContainer(serialNumber, ContainerStatus.ISSUED, userId);
      container.lastVendorId = new Types.ObjectId(vendorId);
      await container.save();
    } else if (
      container.status === ContainerStatus.AVAILABLE ||
      container.status === ContainerStatus.RETURNED
    ) {
      // Self-service flow: assign an available/returned container to this user, then complete return.
      container.status = ContainerStatus.ISSUED;
      container.currentUserId = new Types.ObjectId(userId);
      container.lastVendorId = new Types.ObjectId(vendorId);
      await container.save();
    } else if (container.status === ContainerStatus.ISSUED) {
      if (container.currentUserId?.toString() !== userId) {
        throw new BadRequestException('Container is currently issued to another user');
      }
    } else {
      throw new BadRequestException(`Container cannot be returned (status: ${container.status})`);
    }

    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    // Prefer the scanned collection base; fall back to the container's home org.
    let dropOff = collectionPointId
      ? await this.orgModel.findById(collectionPointId)
      : null;
    if (collectionPointId && !dropOff) {
      throw new NotFoundException('Collection base not found');
    }
    if (!dropOff && container.organizationId) {
      dropOff = await this.orgModel.findById(container.organizationId);
    }

    let plasticSaved = dropOff?.settings?.plasticSavedPerUnit ?? 0.05;
    let co2Saved = dropOff?.settings?.co2SavedPerUnit ?? 0.1;
    let points = dropOff?.settings?.pointsPerReturn ?? 10;

    if (dropOff) {
      container.organizationId = dropOff._id as Types.ObjectId;
      dropOff.analytics = {
        totalContainersIssued: dropOff.analytics?.totalContainersIssued ?? 0,
        totalReturns: (dropOff.analytics?.totalReturns ?? 0) + 1,
      };
      dropOff.markModified('analytics');
      await dropOff.save();
    }

    // Update container
    container.status = ContainerStatus.RETURNED;
    container.currentUserId = undefined;
    await container.save();

    // --- Streak & Gamification Logic ---
    const now = new Date();
    let streakBonus = 0;
    
    if (user.lastReturnAt) {
      const hoursSinceLastReturn = (now.getTime() - user.lastReturnAt.getTime()) / (1000 * 60 * 60);
      
      // Streak rule: Return within 48 hours to maintain/increase streak
      if (hoursSinceLastReturn <= 48) {
        user.streakCount += 1;
        // Bonus: 2 points for every streak level, capped at 20 bonus points
        streakBonus = Math.min(user.streakCount * 2, 20);
      } else {
        // Streak broken, reset to 1
        user.streakCount = 1;
      }
    } else {
      // First return ever
      user.streakCount = 1;
    }
    
    user.lastReturnAt = now;
    user.points += points + streakBonus;
    user.impact.plasticSaved += plasticSaved;
    user.impact.co2Saved += co2Saved;
    user.impact.totalReturns = (user.impact.totalReturns || 0) + 1;
    user.markModified('impact');
    await user.save();

    // Log transaction
    const transaction = new this.transactionModel({
      userId: user._id,
      vendorId: new Types.ObjectId(vendorId),
      containerId: container._id,
      type: TransactionType.RETURN,
      pointsAwarded: points + streakBonus,
      streakBonus,
      plasticSaved,
      co2Saved,
      organizationId: dropOff?._id || container.organizationId || null,
      signature: `SIG_RET_${Date.now()}_${serialNumber}`,
    });
    await transaction.save();

    this.eventEmitter.emit('container.returned', { 
      userId: user._id.toString(), 
      serialNumber, 
      points: points + streakBonus,
      streakCount: user.streakCount 
    });

    const weeklyGoal = await this.getWeeklyGoal(userId);
    const activeBorrows = await this.getActiveBorrows(userId);

    return { 
      message: 'Container returned successfully',
      impact: { plasticSaved, co2Saved, points: points + streakBonus, streakBonus, streakCount: user.streakCount },
      container,
      user: {
        id: user._id,
        email: user.email,
        userName: user.userName,
        points: user.points,
        streakCount: user.streakCount,
        impact: user.impact,
        avatar: user.avatar,
        weeklyGoal,
        activeBorrows: activeBorrows.length,
      },
    };
  }

  async issueByEmail(serialNumber: string, userEmail: string, requesterId: string) {
    const user = await this.userModel.findOne({ email: userEmail });
    if (!user) throw new NotFoundException('User not found');
    return this.issue(serialNumber, user._id.toString(), requesterId);
  }

  async returnByEmail(
    serialNumber: string,
    userEmail: string,
    requesterId: string,
    collectionPointId?: string,
  ) {
    const user = await this.userModel.findOne({ email: userEmail });
    if (!user) throw new NotFoundException('User not found');
    return this.return(serialNumber, user._id.toString(), requesterId, collectionPointId);
  }

  async seed(serialNumber: string, type: string) {
    const existing = await this.containerModel.findOne({ serialNumber });
    if (existing) return existing;
    return new this.containerModel({ serialNumber, type, status: ContainerStatus.AVAILABLE }).save();
  }

  async getHistory(userId: string) {
    return this.transactionModel.find({ userId: new Types.ObjectId(userId) })
      .limit(50)
      .sort({ createdAt: -1 })
      .populate('containerId', 'serialNumber type')
      .populate('vendorId', 'userName email')
      .populate('organizationId', 'name group slug location')
      .exec();
  }

  async getActiveBorrows(userId: string) {
    return this.containerModel.find({ 
      currentUserId: new Types.ObjectId(userId),
      status: ContainerStatus.ISSUED
    })
    .populate('lastVendorId', 'userName email')
    .exec();
  }

  async getWeeklyGoal(userId: string) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const count = await this.transactionModel.countDocuments({
      userId: new Types.ObjectId(userId),
      type: TransactionType.RETURN,
      createdAt: { $gte: sevenDaysAgo }
    });

    return {
      current: count,
      target: 5, // Default target
      percent: Math.min(Math.round((count / 5) * 100), 100)
    };
  }

  async verifyCleanliness(serialNumber: string, imageBase64: string) {
    // In a production environment, this is where you'd call Gemini Vision or Google Cloud Vision.
    // E.g. const result = await this.visionService.analyze(imageBase64);
    
    // We'll simulate a 1-second "AI Analysis" and always return success for this demo.
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const isClean = true; // Simulated result
    const confidence = 0.98;

    return {
      success: isClean,
      confidence,
      message: isClean ? 'Container is clean and ready for reuse! ✨' : 'We detected some residue. Please rinse and try again.',
      timestamp: new Date().toISOString()
    };
  }
}
