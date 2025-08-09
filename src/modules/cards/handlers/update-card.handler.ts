import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CardRepository } from '../card.repository';

import { UpdateCardCommand } from '../commands/update-card.command';
import { CardEntity } from '../card.entity';
import { EventStoreService } from '../../../events/event-store.service';
import { RedisEventBusService } from '../../../messaging/redis-event-bus.service';

@Injectable()
@CommandHandler(UpdateCardCommand)
export class UpdateCardHandler implements ICommandHandler<UpdateCardCommand, CardEntity> {
  public constructor(
    private readonly cardRepository: CardRepository,
    private readonly eventStore: EventStoreService,
    private readonly eventBus: RedisEventBusService,
  ) {}

  public async execute(command: UpdateCardCommand): Promise<CardEntity> {
    const entity: CardEntity | null = await this.cardRepository.findById(command.id);
    if (!entity) {
      throw new NotFoundException('Card not found');
    }
    if (command.document && command.document !== entity.document) {
      const exists = await this.cardRepository.findByDocument(command.document);
      if (exists) {
        throw new ConflictException('Document must be unique');
      }
    }
    if (command.document !== undefined) {
      entity.document = command.document;
    }
    const saved: CardEntity = await this.cardRepository.save(entity);
    const eventType: string = 'CardUpdated';
    await this.eventStore.append({
      aggregateId: saved.id,
      aggregateType: 'Card',
      type: eventType,
      payload: { id: saved.id, document: saved.document },
      metadata: command.metadata,
      correlationId: String((command.metadata as any)?.correlationId || ''),
    });
    await this.eventBus.publish(eventType, { id: saved.id, document: saved.document }, command.metadata);
    return saved;
  }
}

