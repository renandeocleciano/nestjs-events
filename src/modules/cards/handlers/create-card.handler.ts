import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CardRepository } from '../card.repository';

import { CreateCardCommand } from '../commands/create-card.command';
import { CardEntity } from '../card.entity';
import { EventStoreService } from '../../../events/event-store.service';
import { RedisEventBusService } from '../../../messaging/redis-event-bus.service';

@Injectable()
@CommandHandler(CreateCardCommand)
export class CreateCardHandler implements ICommandHandler<CreateCardCommand, CardEntity> {
  private readonly logger = new Logger(CreateCardHandler.name);

  public constructor(
    private readonly cardRepository: CardRepository,
    private readonly eventStore: EventStoreService,
    private readonly eventBus: RedisEventBusService,
  ) {}

  public async execute(command: CreateCardCommand): Promise<CardEntity> {
    this.logger.log(`Creating card ${command.document}`);
    const existing: CardEntity | null = await this.cardRepository.findByDocument(command.document);
    if (existing) {
      throw new ConflictException('Document must be unique');
    }

    const toSave: CardEntity = { id: undefined as unknown as string, document: command.document, createdAt: undefined as unknown as Date, updatedAt: undefined as unknown as Date } as unknown as CardEntity;
    const saved: CardEntity = await this.cardRepository.save(toSave);
    const now = new Date();
    await this.eventStore.append({
      aggregateId: saved.id,
      aggregateType: 'Card',
      type: 'CardCreated',
      payload: { id: saved.id, document: saved.document },
      metadata: { ...command.metadata, timestamp: now.toISOString() },
      correlationId: String((command.metadata as any)?.correlationId || ''),
    });
    await this.eventBus.publish('CardCreated', { id: saved.id, document: saved.document }, { ...command.metadata });
    this.logger.log(`Card created ${saved.id}`);
    return saved;
  }
}

