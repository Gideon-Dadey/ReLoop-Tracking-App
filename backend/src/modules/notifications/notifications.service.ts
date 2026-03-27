import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification } from './schemas/notification.schema';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<Notification>,
  ) {}

  @OnEvent('container.issued')
  async handleContainerIssued(event: { userId: string; serialNumber: string }) {
    await this.createNotification({
      userId: event.userId,
      title: 'Container Borrowed ✅',
      message: `You successfully borrowed container ${event.serialNumber}.`,
      type: 'SUCCESS',
      data: { action: 'issue', serialNumber: event.serialNumber },
    });
  }

  @OnEvent('container.returned')
  async handleContainerReturned(event: { userId: string; serialNumber: string; points: number }) {
    await this.createNotification({
      userId: event.userId,
      title: 'Container Returned! ♻️',
      message: `You earned ${event.points} points for returning container ${event.serialNumber}.`,
      type: 'SUCCESS',
      data: { action: 'return', serialNumber: event.serialNumber, points: event.points },
    });
  }

  async createNotification(dto: { userId: string; title: string, message: string, type?: string, data?: any }) {
    const notification = new this.notificationModel({
      userId: new Types.ObjectId(dto.userId),
      title: dto.title,
      message: dto.message,
      type: dto.type || 'INFO',
      data: dto.data || {},
    });
    
    await notification.save();
    
    // In a production app, here you would also trigger a real push notification via Firebase (FCM) or Expo Push SDK
    this.logger.log(`Notification created for user ${dto.userId}: ${dto.title}`);
    
    return notification;
  }

  async findForUser(userId: string) {
    return this.notificationModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();
  }

  async markAsRead(notificationId: string) {
    return this.notificationModel.findByIdAndUpdate(notificationId, { isRead: true }, { new: true }).exec();
  }
}
