import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Organization } from './schemas/organization.schema';
import { SEED_COLLECTION_BASES } from './seed-collection-bases';

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (n: number) => (n * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function isObjectId(value: string): boolean {
  return Types.ObjectId.isValid(value) && String(new Types.ObjectId(value)) === value;
}

@Injectable()
export class OrganizationsService implements OnModuleInit {
  constructor(
    @InjectModel(Organization.name) private orgModel: Model<Organization>,
  ) {}

  async onModuleInit() {
    for (const base of SEED_COLLECTION_BASES) {
      const { aliases = [], ...fields } = base;
      const existing = await this.orgModel.findOne({
        $or: [{ slug: fields.slug }, { name: fields.name }, ...aliases.map((name) => ({ name }))],
      });
      if (existing) {
        await this.orgModel.updateOne({ _id: existing._id }, { $set: fields });
      } else {
        await this.orgModel.create(fields);
      }
    }
  }

  async findAll() {
    return this.orgModel.find().sort({ name: 1 }).exec();
  }

  async findOne(id: string) {
    const org = await this.orgModel.findById(id).exec();
    if (!org) throw new NotFoundException('Collection base not found');
    return org;
  }

  async findByCode(code: string) {
    const trimmed = (code || '').trim();
    if (!trimmed) throw new NotFoundException('Collection base not found');

    if (isObjectId(trimmed)) {
      const byId = await this.orgModel.findById(trimmed).exec();
      if (byId) return byId;
    }

    const bySlug = await this.orgModel
      .findOne({ slug: trimmed.toLowerCase() })
      .exec();
    if (!bySlug) throw new NotFoundException('Collection base not found');
    return bySlug;
  }

  async findNearby(lat: number, lng: number, limit = 25, group?: string) {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return this.findAll();
    }
    const query = group ? { group } : {};
    const orgs = await this.orgModel.find(query).exec();
    return orgs
      .filter((org) => org.location?.lat != null && org.location?.lng != null)
      .map((org) => {
        const plain = org.toObject();
        return {
          ...plain,
          distanceKm: haversineKm(lat, lng, org.location.lat, org.location.lng),
        };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, Math.max(1, Math.min(limit, 100)));
  }
}
