import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UpdateHolderCommand } from '../commands/update-holder.command';
import { HolderEntity } from '../holder.entity';
import { CardEntity } from '../../cards/card.entity';
import { EventStoreService } from '../../../events/event-store.service';
import { RedisEventBusService } from '../../../messaging/redis-event-bus.service';
import { HolderRepository } from '../holder.repository';

@Injectable()
@CommandHandler(UpdateHolderCommand)
export class UpdateHolderHandler implements ICommandHandler<UpdateHolderCommand, HolderEntity> {
  public constructor(
    private readonly holderRepo: HolderRepository,
    @InjectRepository(CardEntity, 'postgres') private readonly cardRepo: Repository<CardEntity>,
    private readonly eventStore: EventStoreService,
    private readonly eventBus: RedisEventBusService,
  ) {}

  public async execute(command: UpdateHolderCommand): Promise<HolderEntity> {
    const entity: HolderEntity | null = await this.holderRepo.findById(command.id);
    if (!entity) {
      throw new NotFoundException('Holder not found');
    }
    if (command.document && command.document !== entity.document) {
      const exists = await this.holderRepo.findByDocument(command.document);
      if (exists) {
        throw new ConflictException('Document must be unique');
      }
    }
    if (command.cardId && command.cardId !== entity.cardId) {
      const card: CardEntity | null = await this.cardRepo.findOne({ where: { id: command.cardId } });
      if (!card) {
        throw new NotFoundException('Card not found');
      }
    }
    if (command.document !== undefined) {
      entity.document = command.document;
    }
    if (command.cardId !== undefined) {
      entity.cardId = command.cardId;
    }
    const saved: HolderEntity = await this.holderRepo.save(entity);
    const eventType: string = 'HolderUpdated';
    await this.eventStore.append({
      aggregateId: saved.id,
      aggregateType: 'Holder',
      type: eventType,
      payload: { id: saved.id, document: saved.document, cardId: saved.cardId },
      metadata: command.metadata,
      correlationId: String((command.metadata as any)?.correlationId || ''),
    });
    await this.eventBus.publish(eventType, { id: saved.id, document: saved.document, cardId: saved.cardId }, command.metadata);
    return saved;
  }
}

