import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ContainersModule } from './modules/containers/containers.module';
import { AICoachModule } from './modules/ai/ai.module';
import { BlockchainModule } from './modules/blockchain/blockchain.module';
import { SyncModule } from './modules/sync/sync.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { CommunityModule } from './modules/community/community.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    EventEmitterModule.forRoot(),
    OrganizationsModule,
    UsersModule,
    AuthModule,
    ContainersModule,
    AICoachModule,
    BlockchainModule,
    SyncModule,
    NotificationsModule,
    CommunityModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
