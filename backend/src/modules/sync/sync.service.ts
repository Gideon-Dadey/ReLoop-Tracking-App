import { Injectable } from '@nestjs/common';
import { ContainersService } from '../containers/containers.service';
import { SyncBulkDto } from './dto/sync.dto';
import { TransactionType } from '../transactions/schemas/transaction.schema';

@Injectable()
export class SyncService {
  constructor(private readonly containersService: ContainersService) {}

  async processBulkSync(userId: string, syncDto: SyncBulkDto) {
    const results: any[] = [];

    for (const event of syncDto.events) {
      try {
        let result;
        if (event.type === TransactionType.ISSUE) {
          result = await this.containersService.issueByEmail(event.serialNumber, event.userEmail, userId);
        } else {
          result = await this.containersService.returnByEmail(event.serialNumber, event.userEmail, userId);
        }
        results.push({ serialNumber: event.serialNumber, success: true, result });
      } catch (error) {
        results.push({ serialNumber: event.serialNumber, success: false, error: error.message });
      }
    }

    return { total: syncDto.events.length, results };
  }
}
