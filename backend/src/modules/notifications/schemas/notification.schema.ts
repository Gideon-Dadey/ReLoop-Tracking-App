import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ type: Object })
  data?: any;

  @Prop({ enum: ['INFO', 'SUCCESS', 'WARNING', 'ERROR'], default: 'INFO' })
  type: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
