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

  async return(serialNumber: string, userId: string, vendorId: string) {
    const container = await this.getOrCreateContainer(serialNumber, ContainerStatus.ISSUED, userId);

    if (container.status !== ContainerStatus.ISSUED) {
      // If it's already returned, don't error.
      if (container.status === ContainerStatus.RETURNED || container.status === ContainerStatus.AVAILABLE) {
        return { message: 'Container already returned', container };
      }
      throw new BadRequestException('Container was not issued');
    }

    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    // Default impact values if no org
    let plasticSaved = 0.05;
    let co2Saved = 0.1;
    let points = 10;

    if (container.organizationId) {
      const org = await this.orgModel.findById(container.organizationId);
      if (org) {
        plasticSaved = org.settings?.plasticSavedPerUnit ?? 0.05;
        co2Saved = org.settings?.co2SavedPerUnit ?? 0.1;
        points = org.settings?.pointsPerReturn ?? 10;
      }
    }

    // Update container
    container.status = ContainerStatus.RETURNED;
    container.currentUserId = undefined;
    await container.save();

    // Update User Impact and Points
    user.points += points;
    user.impact.plasticSaved += plasticSaved;
    user.impact.co2Saved += co2Saved;
    user.markModified('impact');
    await user.save();

    // Log transaction
    const transaction = new this.transactionModel({
      userId: user._id,
      vendorId: new Types.ObjectId(vendorId),
      containerId: container._id,
      type: TransactionType.RETURN,
      pointsAwarded: points,
      plasticSaved,
      co2Saved,
      organizationId: container.organizationId || null,
      signature: `SIG_RET_${Date.now()}_${serialNumber}`,
    });
    await transaction.save();

    this.eventEmitter.emit('container.returned', { userId: user._id.toString(), serialNumber, points });

    return { 
      message: 'Container returned successfully',
      impact: { plasticSaved, co2Saved, points },
      container 
    };
  }

  async issueByEmail(serialNumber: string, userEmail: string, requesterId: string) {
    const user = await this.userModel.findOne({ email: userEmail });
    if (!user) throw new NotFoundException('User not found');
    return this.issue(serialNumber, user._id.toString(), requesterId);
  }

  async returnByEmail(serialNumber: string, userEmail: string, requesterId: string) {
    const user = await this.userModel.findOne({ email: userEmail });
    if (!user) throw new NotFoundException('User not found');
    return this.return(serialNumber, user._id.toString(), requesterId);
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
}
