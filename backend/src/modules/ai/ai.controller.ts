import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AICoachService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AIController {
  constructor(private readonly aiCoachService: AICoachService) {}

  @Get('recommendations')
  async getRecommendations(@Req() req: any) {
    // req.user is the full user document from Mongoose, so use .id (vritual) or ._id
    return this.aiCoachService.getRecommendations(req.user.id);
  }
}
