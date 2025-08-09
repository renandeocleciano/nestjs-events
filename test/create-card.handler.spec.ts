import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateCardHandler } from '../src/modules/cards/handlers/create-card.handler';
import { CardEntity } from '../src/modules/cards/card.entity';
import { EventStoreService } from '../src/events/event-store.service';
import { RedisEventBusService } from '../src/messaging/redis-event-bus.service';
import { CreateCardCommand } from '../src/modules/cards/commands/create-card.command';

describe('CreateCardHandler', () => {
  let handler: CreateCardHandler;
  let repo: jest.Mocked<Repository<CardEntity>>;
  let eventStore: jest.Mocked<EventStoreService>;
  let eventBus: jest.Mocked<RedisEventBusService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CreateCardHandler,
        { provide: getRepositoryToken(CardEntity, 'postgres'), useValue: { findOne: jest.fn(), create: jest.fn(), save: jest.fn() } },
        { provide: EventStoreService, useValue: { append: jest.fn() } },
        { provide: RedisEventBusService, useValue: { publish: jest.fn() } },
      ],
    }).compile();

    handler = moduleRef.get(CreateCardHandler);
    repo = moduleRef.get(getRepositoryToken(CardEntity, 'postgres')) as any;
    eventStore = moduleRef.get(EventStoreService) as any;
    eventBus = moduleRef.get(RedisEventBusService) as any;
  });

  it('should create card and publish event', async () => {
    repo.findOne.mockResolvedValue(null);
    const saved: CardEntity = { id: 'uuid', document: '12345', createdAt: new Date(), updatedAt: new Date() } as CardEntity;
    repo.create.mockReturnValue(saved);
    repo.save.mockResolvedValue(saved);

    const actual = await handler.execute(new CreateCardCommand('12345'));
    expect(actual).toEqual(saved);
    expect(eventStore.append).toHaveBeenCalled();
    expect(eventBus.publish).toHaveBeenCalled();
  });
});

