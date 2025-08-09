import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CardEntity } from './card.entity';
import { CardsController } from './cards.controller';
import { CreateCardHandler } from './handlers/create-card.handler';
import { UpdateCardHandler } from './handlers/update-card.handler';
import { GetCardByIdHandler } from './handlers/get-card-by-id.handler';
import { ListCardsHandler } from './handlers/list-cards.handler';
import { EventStoreService } from '../../events/event-store.service';
import { EventStoreRepository } from '../../events/event-store.repository';
import { CardRepository } from './card.repository';
import { RedisEventBusModule } from '../../messaging/redis-event-bus.module';

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([CardEntity], 'postgres'), RedisEventBusModule],
  controllers: [CardsController],
  providers: [CardRepository, CreateCardHandler, UpdateCardHandler, GetCardByIdHandler, ListCardsHandler, EventStoreService, EventStoreRepository],
})
export class CardsModule {}

