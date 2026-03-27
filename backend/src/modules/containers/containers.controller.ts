import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ContainersService } from './containers.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@ApiTags('containers')
@ApiBearerAuth()
@Controller('containers')
export class ContainersController {
  constructor(private readonly containersService: ContainersService) {}

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user transaction history' })
  async getHistory(@Request() req: any) {
    return this.containersService.getHistory(req.user.id);
  }

  @Get('active')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user active borrows' })
  async getActiveBorrows(@Request() req: any) {
    return this.containersService.getActiveBorrows(req.user.id);
  }

  @Post('issue')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Issue a container to a user' })
  async issue(@Body() body: { serialNumber: string; userEmail: string }, @Request() req: any) {
    return this.containersService.issueByEmail(body.serialNumber, body.userEmail, req.user.id);
  }

  @Post('return')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Return a container' })
  async return(@Body() body: { serialNumber: string; userEmail: string }, @Request() req: any) {
    return this.containersService.returnByEmail(body.serialNumber, body.userEmail, req.user.id);
  }

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Verify container cleanliness via AI' })
  async verify(@Body() body: { serialNumber: string; image: string }, @Request() req: any) {
    return this.containersService.verifyCleanliness(body.serialNumber, body.image);
  }

  @Post('seed-demo')
  @ApiOperation({ summary: 'Seed a test container for demo' })
  async seed(@Body() body: { serialNumber: string; type: string }) {
    return this.containersService.seed(body.serialNumber, body.type);
  }
}
