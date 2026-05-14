import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum TransactionType {
  ISSUE = 'ISSUE',
  RETURN = 'RETURN',
}

@Schema({ timestamps: true })
export class Transaction extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  vendorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Container', required: true })
  containerId: Types.ObjectId;

  @Prop({ type: String, enum: TransactionType, required: true, index: true })
  type: TransactionType;

  @Prop({ required: true })
  pointsAwarded: number;

  @Prop({ required: true })
  plasticSaved: number;

  @Prop({ required: true })
  co2Saved: number;

  @Prop({ default: 0 })
  streakBonus: number;

  @Prop()
  signature: string;

  @Prop({ type: Types.ObjectId, ref: 'Organization' })
  organizationId: Types.ObjectId;

  @Prop({ default: Date.now })
  processedAt: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

TransactionSchema.index({ userId: 1, createdAt: -1 });
TransactionSchema.index({ userId: 1, type: 1, createdAt: -1 });
