import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@ApiTags('vendors')
@Controller('vendors')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrganizationsController {
  constructor(private readonly orgService: OrganizationsService) {}

  @Get()
  @ApiOperation({ summary: 'List all collection bases' })
  async getVendors() {
    return this.orgService.findAll();
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Nearest collection bases' })
  @ApiQuery({ name: 'lat', required: true })
  @ApiQuery({ name: 'lng', required: true })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'group', required: false })
  async getNearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('limit') limit?: string,
    @Query('group') group?: string,
  ) {
    return this.orgService.findNearby(
      parseFloat(lat),
      parseFloat(lng),
      limit ? parseInt(limit, 10) : 10,
      group,
    );
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Lookup a collection base by id or slug (QR payload)' })
  async getByCode(@Param('code') code: string) {
    return this.orgService.findByCode(decodeURIComponent(code));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get collection base details' })
  async getVendor(@Param('id') id: string) {
    return this.orgService.findOne(id);
  }
}
