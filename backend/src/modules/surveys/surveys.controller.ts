import {
  Controller, Post, Get, Body, Query,
  UseGuards, Req, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SurveysService } from './surveys.service';
import { SubmitSurveyDto } from './dto/survey.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@ApiTags('surveys')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('surveys')
export class SurveysController {
  constructor(private readonly surveysService: SurveysService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit survey responses' })
  @ApiResponse({ status: 201, description: 'Survey submitted successfully' })
  @ApiResponse({ status: 409, description: 'Survey already completed' })
  async submit(@Req() req, @Body() dto: SubmitSurveyDto) {
    return this.surveysService.submit(req.user.id, dto);
  }

  @Get('status')
  @ApiOperation({ summary: 'Check if user has completed the survey' })
  @ApiQuery({ name: 'version', required: false, type: String })
  async getStatus(@Req() req, @Query('version') version?: string) {
    return this.surveysService.getStatus(req.user.id, version || '1.0');
  }

  @Get('results')
  @ApiOperation({ summary: 'Get aggregated survey results' })
  @ApiQuery({ name: 'version', required: false, type: String })
  async getResults(@Query('version') version?: string) {
    return this.surveysService.getResults(version || '1.0');
  }

  @Get('pulse/status')
  @ApiOperation({ summary: 'Daily pulse completion status and streak' })
  @ApiQuery({ name: 'date', required: false, type: String, description: 'Local calendar date YYYY-MM-DD' })
  async getPulseStatus(@Req() req, @Query('date') date?: string) {
    return this.surveysService.getPulseStatus(req.user.id, date);
  }
}
