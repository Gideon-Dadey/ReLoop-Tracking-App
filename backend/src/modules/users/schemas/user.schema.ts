import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum UserRole {
  USER = 'user',
  VENDOR = 'vendor',
  ADMIN = 'admin',
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true, trim: true })
  userName: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.USER, index: true })
  role: UserRole;

  @Prop({ type: Types.ObjectId, ref: 'Organization', default: null, index: true })
  organizationId: Types.ObjectId;

  @Prop({ default: 0 })
  points: number;

  @Prop({ default: 0 })
  streakCount: number;

  @Prop({ type: Date, default: null })
  lastReturnAt: Date;

  @Prop({ type: Object, default: { plasticSaved: 0, co2Saved: 0, totalReturns: 0 } })
  impact: {
    plasticSaved: number;
    co2Saved: number;
    totalReturns: number;
  };

  @Prop({ default: null, select: false })
  refreshToken: string;

  @Prop({ type: String, default: null })
  avatar: string | null;

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.set('toJSON', {
  transform(_doc, ret: Record<string, any>) {
    delete ret.passwordHash;
    delete ret.refreshToken;
    delete ret.__v;
    return ret;
  },
});
