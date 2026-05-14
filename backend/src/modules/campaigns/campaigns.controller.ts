import {
  Controller, Post, Get, Body, Param, Query,
  UseGuards, Req, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto, EvaluateCampaignDto } from './dto/campaign.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@ApiTags('campaigns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a new campaign for evaluation' })
  @ApiResponse({ status: 201, description: 'Campaign submitted successfully' })
  async create(@Req() req, @Body() dto: CreateCampaignDto) {
    return this.campaignsService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all campaigns with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.campaignsService.findAll(
      parseInt(page || '1'),
      parseInt(limit || '20'),
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get aggregated campaign statistics for dashboard' })
  @ApiResponse({ status: 200, description: 'Campaign statistics retrieved' })
  async getStats() {
    return this.campaignsService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get campaign details by ID' })
  @ApiResponse({ status: 200, description: 'Campaign details' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async findById(@Param('id') id: string) {
    return this.campaignsService.findById(id);
  }

  @Post(':id/evaluate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Evaluate a campaign with scoring criteria' })
  @ApiResponse({ status: 200, description: 'Campaign evaluated successfully' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async evaluate(
    @Param('id') id: string,
    @Req() req,
    @Body() dto: EvaluateCampaignDto,
  ) {
    return this.campaignsService.evaluate(id, req.user.id, dto);
  }
}
