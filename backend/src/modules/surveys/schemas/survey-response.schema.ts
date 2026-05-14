import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
export class SurveyAnswer {
  @Prop({ required: true })
  questionId: number;

  @Prop({ required: true, min: 1, max: 5 })
  value: number;
}

@Schema({ timestamps: true })
export class SurveyResponse extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: [SurveyAnswer], required: true })
  responses: SurveyAnswer[];

  @Prop({ required: true, default: '1.0' })
  surveyVersion: string;

  @Prop({ type: Date, default: () => new Date() })
  completedAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const SurveyResponseSchema = SchemaFactory.createForClass(SurveyResponse);

SurveyResponseSchema.index({ userId: 1, surveyVersion: 1 }, { unique: true });
