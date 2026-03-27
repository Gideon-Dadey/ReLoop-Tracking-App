import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ContainerStatus {
  AVAILABLE = 'available',
  ISSUED = 'issued',
  PENDING_RETURN = 'pending-return',
  RETURNED = 'returned',
  DAMAGED = 'damaged',
}

@Schema({ timestamps: true })
export class Container extends Document {
  @Prop({ required: true, unique: true })
  serialNumber: string;

  @Prop({ required: true })
  type: string; // e.g. 'Coffee Cup', 'Lunch Box'

  @Prop({ type: String, enum: ContainerStatus, default: ContainerStatus.AVAILABLE })
  status: ContainerStatus;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  currentUserId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Organization' })
  organizationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  lastVendorId?: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;
}

export const ContainerSchema = SchemaFactory.createForClass(Container);
