import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HolderEntity } from './holder.entity';
import { HoldersController } from './holders.controller';
import { CreateHolderHandler } from './handlers/create-holder.handler';
import { UpdateHolderHandler } from './handlers/update-holder.handler';
import { GetHolderByIdHandler } from './handlers/get-holder-by-id.handler';
import { ListHoldersHandler } from './handlers/list-holders.handler';
import { CardEntity } from '../cards/card.entity';
import { EventStoreService } from '../../events/event-store.service';
import { EventStoreRepository } from '../../events/event-store.repository';
import { HolderRepository } from './holder.repository';
import { RedisEventBusModule } from '../../messaging/redis-event-bus.module';

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([HolderEntity, CardEntity], 'postgres'), RedisEventBusModule],
  controllers: [HoldersController],
  providers: [HolderRepository, CreateHolderHandler, UpdateHolderHandler, GetHolderByIdHandler, ListHoldersHandler, EventStoreService, EventStoreRepository],
})
export class HoldersModule {}

