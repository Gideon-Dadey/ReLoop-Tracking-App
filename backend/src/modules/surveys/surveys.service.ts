import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SurveyResponse } from './schemas/survey-response.schema';
import { SubmitSurveyDto } from './dto/survey.dto';

@Injectable()
export class SurveysService {
  constructor(
    @InjectModel(SurveyResponse.name) private surveyModel: Model<SurveyResponse>,
  ) {}

  async submit(userId: string, dto: SubmitSurveyDto): Promise<SurveyResponse> {
    const existing = await this.surveyModel.findOne({
      userId: new Types.ObjectId(userId),
      surveyVersion: dto.surveyVersion,
    });

    if (existing) {
      throw new ConflictException('You have already completed this survey version');
    }

    const response = new this.surveyModel({
      userId: new Types.ObjectId(userId),
      responses: dto.responses,
      surveyVersion: dto.surveyVersion,
      completedAt: new Date(),
    });

    return response.save();
  }

  async getStatus(userId: string, version: string) {
    const existing = await this.surveyModel.findOne({
      userId: new Types.ObjectId(userId),
      surveyVersion: version,
    });
    return { completed: !!existing, completedAt: existing?.completedAt || null };
  }

  async getResults(version: string) {
    const results = await this.surveyModel.aggregate([
      { $match: { surveyVersion: version } },
      { $unwind: '$responses' },
      {
        $group: {
          _id: '$responses.questionId',
          avgScore: { $avg: '$responses.value' },
          totalResponses: { $sum: 1 },
          distribution: {
            $push: '$responses.value',
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const totalRespondents = await this.surveyModel.countDocuments({ surveyVersion: version });

    const questionResults = results.map((r) => {
      const dist = [0, 0, 0, 0, 0];
      r.distribution.forEach((v: number) => {
        dist[v - 1]++;
      });
      return {
        questionId: r._id,
        avgScore: +r.avgScore.toFixed(2),
        totalResponses: r.totalResponses,
        distribution: dist,
      };
    });

    const sectionAAvg = questionResults
      .filter((q) => q.questionId <= 5)
      .reduce((sum, q) => sum + q.avgScore, 0) / 5 || 0;

    const sectionBAvg = questionResults
      .filter((q) => q.questionId > 5)
      .reduce((sum, q) => sum + q.avgScore, 0) / 5 || 0;

    return {
      totalRespondents,
      questions: questionResults,
      sectionAverages: {
        behavioralIntentions: +sectionAAvg.toFixed(2),
        communityResilience: +sectionBAvg.toFixed(2),
      },
    };
  }
}
