import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SyncService } from './sync.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { SyncBulkDto } from './dto/sync.dto';

@ApiTags('sync')
@ApiBearerAuth()
@Controller('sync')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('bulk')
  @Roles(UserRole.USER, UserRole.VENDOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Bulk process offline scans from a vendor device' })
  async syncBulk(@Body() syncDto: SyncBulkDto, @Request() req: any) {
    return this.syncService.processBulkSync(req.user._id, syncDto);
  }
}
