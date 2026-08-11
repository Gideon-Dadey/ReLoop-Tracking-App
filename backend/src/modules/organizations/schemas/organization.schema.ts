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

  /** Partner network — nearest alternatives stay in the same group. */
  @Prop({ index: true })
  group?: string;

  /** Printed QR target: reloop://collection/{slug} */
  @Prop({ unique: true, sparse: true, lowercase: true, trim: true })
  slug?: string;

  /** Visitor hours, e.g. Mon–Sat 8am–4pm */
  @Prop()
  hours?: string;

  @Prop({ type: Object, default: { totalContainersIssued: 0, totalReturns: 0 } })
  analytics: {
    totalContainersIssued: number;
    totalReturns: number;
  };
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
