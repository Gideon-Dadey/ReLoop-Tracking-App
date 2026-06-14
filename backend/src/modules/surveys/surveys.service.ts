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

    if (version.startsWith('pulse-')) {
      const avg = questionResults[0]?.avgScore ?? 0;
      return {
        totalRespondents,
        questions: questionResults,
        avgScore: avg,
      };
    }

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

  /** Daily pulse — one question per calendar day (version key: pulse-YYYY-MM-DD). */
  async getPulseStatus(userId: string, dateKey?: string) {
    const todayKey = dateKey ?? new Date().toISOString().slice(0, 10);
    const todayVersion = `pulse-${todayKey}`;
    const existing = await this.surveyModel.findOne({
      userId: new Types.ObjectId(userId),
      surveyVersion: todayVersion,
    });

    const pulses = await this.surveyModel
      .find({
        userId: new Types.ObjectId(userId),
        surveyVersion: { $regex: /^pulse-/ },
      })
      .select('surveyVersion')
      .lean();

    const completedDates = new Set(
      pulses.map((p) => p.surveyVersion.replace('pulse-', '')),
    );

    const completedToday = completedDates.has(todayKey);

    let streak = 0;
    const cursor = new Date(`${todayKey}T12:00:00.000Z`);

    if (!completedToday) {
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }

    while (completedDates.has(cursor.toISOString().slice(0, 10))) {
      streak++;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }

    return {
      completedToday: !!existing,
      todayVersion,
      streak,
      totalCompleted: pulses.length,
      completedAt: existing?.completedAt ?? null,
      todayKey,
    };
  }
}
