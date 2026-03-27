import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CommunityService } from './community.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getGlobalStats() {
    return this.communityService.getGlobalStats();
  }

  @Get('leaderboard')
  @UseGuards(JwtAuthGuard)
  async getLeaderboard(@Query('limit') limit?: number) {
    return this.communityService.getLeaderboard(limit || 10);
  }
}
