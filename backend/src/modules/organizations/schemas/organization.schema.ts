import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Organization extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ default: 'active' })
  status: string;

  @Prop({ type: Object, default: { pointsPerReturn: 10, plasticSavedPerUnit: 0.05, co2SavedPerUnit: 0.1 } })
  settings: {
    pointsPerReturn: number;
    plasticSavedPerUnit: number;
    co2SavedPerUnit: number;
  };

  @Prop({ type: [String], default: ['Plastic', 'Glass'] })
  acceptedMaterials: string[];

  @Prop({ type: Object })
  location: {
    lat: number;
    lng: number;
    address: string;
  };

  @Prop({ type: Object, default: { totalContainersIssued: 0, totalReturns: 0 } })
  analytics: {
    totalContainersIssued: number;
    totalReturns: number;
  };
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
