import { Module } from '@nestjs/common';
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';
import { ContainersModule } from '../containers/containers.module';

@Module({
  imports: [ContainersModule],
  controllers: [SyncController],
  providers: [SyncService],
})
export class SyncModule {}
