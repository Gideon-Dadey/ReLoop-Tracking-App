import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SurveyResponse, SurveyResponseSchema } from './schemas/survey-response.schema';
import { SurveysService } from './surveys.service';
import { SurveysController } from './surveys.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SurveyResponse.name, schema: SurveyResponseSchema }]),
  ],
  controllers: [SurveysController],
  providers: [SurveysService],
  exports: [SurveysService],
})
export class SurveysModule {}
