import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum CampaignPlatform {
  INSTAGRAM = 'instagram',
  TIKTOK = 'tiktok',
  FACEBOOK = 'facebook',
  PINTEREST = 'pinterest',
}

@Schema({ _id: false })
export class EvaluationScores {
  @Prop({ type: Number, min: 0, max: 5, default: 0 })
  visualDesignQuality: number;

  @Prop({ type: Number, min: 0, max: 5, default: 0 })
  narrativeCoherence: number;

  @Prop({ type: Number, min: 0, max: 5, default: 0 })
  circularEconomyAlignment: number;

  @Prop({ type: Number, min: 0, max: 5, default: 0 })
  behavioralCallToAction: number;

  @Prop({ type: Number, min: 0, max: 5, default: 0 })
  communityOrientation: number;

  @Prop({ type: Number, min: 0, max: 5, default: 0 })
  overallScore: number;
}

@Schema({ timestamps: true })
export class Campaign extends Document {
  @Prop({ required: true, trim: true, maxlength: 200 })
  title: string;

  @Prop({ type: String, enum: CampaignPlatform, required: true, index: true })
  platform: CampaignPlatform;

  @Prop({ required: true, trim: true })
  url: string;

  @Prop({ trim: true, default: null })
  imageUrl: string;

  @Prop({ trim: true, maxlength: 1000, default: '' })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  submittedBy: Types.ObjectId;

  @Prop({ type: EvaluationScores, default: () => ({}) })
  scores: EvaluationScores;

  @Prop({ default: false })
  isEvaluated: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  evaluatedBy: Types.ObjectId;

  @Prop({ trim: true, maxlength: 2000, default: '' })
  evaluatorNotes: string;

  @Prop({ type: Date, default: null })
  evaluatedAt: Date;

  @Prop({ type: Number, default: 0, index: true })
  evaluationCount: number;

  createdAt: Date;
  updatedAt: Date;
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);

CampaignSchema.index({ platform: 1, createdAt: -1 });
CampaignSchema.index({ isEvaluated: 1, 'scores.overallScore': -1 });
