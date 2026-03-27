import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@ApiTags('vendors')
@Controller('vendors')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrganizationsController {
  constructor(private readonly orgService: OrganizationsService) {}

  @Get()
  @ApiOperation({ summary: 'List all vendors/organizations' })
  async getVendors() {
    return this.orgService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vendor details' })
  async getVendor(@Param('id') id: string) {
    return this.orgService.findOne(id);
  }
}
