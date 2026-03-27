import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class CommunityService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async getGlobalStats() {
    const aggregate = await this.userModel.aggregate([
      {
        $group: {
          _id: null,
          totalPlasticSaved: { $sum: '$impact.plasticSaved' },
          totalCo2Saved: { $sum: '$impact.co2Saved' },
          totalUsers: { $sum: 1 },
          totalPoints: { $sum: '$points' },
        },
      },
    ]);

    if (aggregate.length === 0) {
      return {
        totalPlasticSaved: 0,
        totalCo2Saved: 0,
        totalUsers: 0,
        totalPoints: 0,
      };
    }

    return aggregate[0];
  }

  async getLeaderboard(limit = 10) {
    return this.userModel
      .find({ role: 'user' })
      .select('userName avatar impact points')
      .sort({ points: -1 })
      .limit(limit)
      .exec();
  }
}
