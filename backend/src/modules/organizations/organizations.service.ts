import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Organization } from './schemas/organization.schema';

@Injectable()
export class OrganizationsService implements OnModuleInit {
  constructor(
    @InjectModel(Organization.name) private orgModel: Model<Organization>,
  ) {}

  async onModuleInit() {
    // Seed some test vendors if none exist
    const count = await this.orgModel.countDocuments();
    if (count === 0) {
      const testVendors = [
        { 
          name: 'Green Market HQ', 
          location: { lat: 5.6037, lng: -0.1870, address: 'Accra Mall, Spinning' },
          settings: { pointsPerReturn: 15, plasticSavedPerUnit: 0.1, co2SavedPerUnit: 0.2 }
        },
        { 
          name: 'Eco Hub Store', 
          location: { lat: 5.5600, lng: -0.2000, address: 'Independence Ave' },
          settings: { pointsPerReturn: 10, plasticSavedPerUnit: 0.05, co2SavedPerUnit: 0.1 }
        },
        { 
          name: 'Sustainability Corner', 
          location: { lat: 5.6300, lng: -0.1500, address: 'Airport City' },
          settings: { pointsPerReturn: 20, plasticSavedPerUnit: 0.15, co2SavedPerUnit: 0.25 }
        }
      ];
      await this.orgModel.insertMany(testVendors);
    }
  }

  async findAll() {
    return this.orgModel.find().exec();
  }

  async findOne(id: string) {
    return this.orgModel.findById(id).exec();
  }
}
