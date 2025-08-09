import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccountEntity } from './account.entity';
import { CardCreatedSubscriber } from './subscribers/card-created.subscriber';
import { EventStoreService } from '../../events/event-store.service';
import { EventStoreRepository } from '../../events/event-store.repository';
import { RedisEventBusModule } from '../../messaging/redis-event-bus.module';

@Module({
  imports: [TypeOrmModule.forFeature([AccountEntity], 'postgres'), RedisEventBusModule],
  providers: [CardCreatedSubscriber, EventStoreService, EventStoreRepository],
  exports: [TypeOrmModule],
})
export class AccountsModule {}

