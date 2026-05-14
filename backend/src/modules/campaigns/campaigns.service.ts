import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Campaign, CampaignPlatform } from './schemas/campaign.schema';
import { CreateCampaignDto, EvaluateCampaignDto } from './dto/campaign.dto';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectModel(Campaign.name) private campaignModel: Model<Campaign>,
  ) {}

  async create(userId: string, dto: CreateCampaignDto): Promise<Campaign> {
    const campaign = new this.campaignModel({
      ...dto,
      submittedBy: new Types.ObjectId(userId),
    });
    return campaign.save();
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [campaigns, total] = await Promise.all([
      this.campaignModel
        .find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('submittedBy', 'userName avatar')
        .lean(),
      this.campaignModel.countDocuments(),
    ]);
    return { campaigns, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string): Promise<Campaign> {
    const campaign = await this.campaignModel
      .findById(id)
      .populate('submittedBy', 'userName avatar')
      .populate('evaluatedBy', 'userName');
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  async evaluate(campaignId: string, userId: string, dto: EvaluateCampaignDto) {
    const campaign = await this.campaignModel.findById(campaignId);
    if (!campaign) throw new NotFoundException('Campaign not found');

    const overallScore = +(
      (dto.visualDesignQuality +
        dto.narrativeCoherence +
        dto.circularEconomyAlignment +
        dto.behavioralCallToAction +
        dto.communityOrientation) /
      5
    ).toFixed(2);

    campaign.scores = {
      visualDesignQuality: dto.visualDesignQuality,
      narrativeCoherence: dto.narrativeCoherence,
      circularEconomyAlignment: dto.circularEconomyAlignment,
      behavioralCallToAction: dto.behavioralCallToAction,
      communityOrientation: dto.communityOrientation,
      overallScore,
    };
    campaign.isEvaluated = true;
    campaign.evaluatedBy = new Types.ObjectId(userId);
    campaign.evaluatorNotes = dto.evaluatorNotes || '';
    campaign.evaluatedAt = new Date();
    campaign.evaluationCount += 1;

    await campaign.save();
    return campaign;
  }

  async getStats() {
    const [
      totalCampaigns,
      evaluatedCampaigns,
      platformDistribution,
      avgScores,
      topCampaigns,
    ] = await Promise.all([
      this.campaignModel.countDocuments(),
      this.campaignModel.countDocuments({ isEvaluated: true }),
      this.campaignModel.aggregate([
        { $group: { _id: '$platform', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      this.campaignModel.aggregate([
        { $match: { isEvaluated: true } },
        {
          $group: {
            _id: null,
            avgVisualDesign: { $avg: '$scores.visualDesignQuality' },
            avgNarrative: { $avg: '$scores.narrativeCoherence' },
            avgCircularAlignment: { $avg: '$scores.circularEconomyAlignment' },
            avgBehavioral: { $avg: '$scores.behavioralCallToAction' },
            avgCommunity: { $avg: '$scores.communityOrientation' },
            avgOverall: { $avg: '$scores.overallScore' },
          },
        },
      ]),
      this.campaignModel
        .find({ isEvaluated: true })
        .sort({ 'scores.overallScore': -1 })
        .limit(5)
        .select('title platform scores.overallScore')
        .lean(),
    ]);

    const scores = avgScores[0] || {
      avgVisualDesign: 0,
      avgNarrative: 0,
      avgCircularAlignment: 0,
      avgBehavioral: 0,
      avgCommunity: 0,
      avgOverall: 0,
    };

    return {
      totalCampaigns,
      evaluatedCampaigns,
      platformDistribution: platformDistribution.map((p) => ({
        platform: p._id,
        count: p.count,
      })),
      averageScores: {
        visualDesignQuality: +scores.avgVisualDesign.toFixed(2),
        narrativeCoherence: +scores.avgNarrative.toFixed(2),
        circularEconomyAlignment: +scores.avgCircularAlignment.toFixed(2),
        behavioralCallToAction: +scores.avgBehavioral.toFixed(2),
        communityOrientation: +scores.avgCommunity.toFixed(2),
        overall: +scores.avgOverall.toFixed(2),
      },
      sdg12AlignmentPercent: Math.round((scores.avgOverall / 5) * 100),
      topCampaigns,
    };
  }
}
