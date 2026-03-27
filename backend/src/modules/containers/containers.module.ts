import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Container, ContainerSchema } from './schemas/container.schema';
import { Transaction, TransactionSchema } from '../transactions/schemas/transaction.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Organization, OrganizationSchema } from '../organizations/schemas/organization.schema';
import { ContainersService } from './containers.service';
import { ContainersController } from './containers.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Container.name, schema: ContainerSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: User.name, schema: UserSchema },
      { name: Organization.name, schema: OrganizationSchema },
    ]),
  ],
  controllers: [ContainersController],
  providers: [ContainersService],
  exports: [ContainersService],
})
export class ContainersModule {}
