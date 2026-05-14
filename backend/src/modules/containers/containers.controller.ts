import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ContainersService } from './containers.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import {
  IssueContainerDto,
  ReturnContainerDto,
  VerifyContainerDto,
  SeedContainerDto,
} from './dto/container.dto';

@ApiTags('containers')
@ApiBearerAuth()
@Controller('containers')
export class ContainersController {
  constructor(private readonly containersService: ContainersService) {}

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user transaction history' })
  @ApiResponse({ status: 200, description: 'Transaction list' })
  async getHistory(@Request() req: any) {
    return this.containersService.getHistory(req.user.id);
  }

  @Get('active')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user active borrows' })
  @ApiResponse({ status: 200, description: 'Active container list' })
  async getActiveBorrows(@Request() req: any) {
    return this.containersService.getActiveBorrows(req.user.id);
  }

  @Post('issue')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Issue a container to a user (vendor/admin only)' })
  @ApiResponse({ status: 201, description: 'Container issued' })
  @ApiResponse({ status: 400, description: 'Container already issued' })
  async issue(@Body() body: IssueContainerDto, @Request() req: any) {
    return this.containersService.issueByEmail(body.serialNumber, body.userEmail, req.user.id);
  }

  @Post('return')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Return a container' })
  @ApiResponse({ status: 201, description: 'Container returned' })
  @ApiResponse({ status: 400, description: 'Container not issued' })
  async return(@Body() body: ReturnContainerDto, @Request() req: any) {
    return this.containersService.returnByEmail(body.serialNumber, body.userEmail, req.user.id);
  }

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Verify container cleanliness via AI' })
  @ApiResponse({ status: 201, description: 'Verification result' })
  async verify(@Body() body: VerifyContainerDto) {
    return this.containersService.verifyCleanliness(body.serialNumber, body.image);
  }

  @Post('seed-demo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Seed a test container (admin only)' })
  @ApiResponse({ status: 201, description: 'Container created' })
  async seed(@Body() body: SeedContainerDto) {
    return this.containersService.seed(body.serialNumber, body.type);
  }
}
