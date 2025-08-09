import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HolderRepository } from '../holder.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateHolderCommand } from '../commands/create-holder.command';
import { HolderEntity } from '../holder.entity';
import { CardEntity } from '../../cards/card.entity';
import { EventStoreService } from '../../../events/event-store.service';
import { RedisEventBusService } from '../../../messaging/redis-event-bus.service';

@Injectable()
@CommandHandler(CreateHolderCommand)
export class CreateHolderHandler implements ICommandHandler<CreateHolderCommand, HolderEntity> {
  public constructor(
    private readonly holderRepo: HolderRepository,
    @InjectRepository(CardEntity, 'postgres') private readonly cardRepo: Repository<CardEntity>,
    private readonly eventStore: EventStoreService,
    private readonly eventBus: RedisEventBusService,
  ) {}

  public async execute(command: CreateHolderCommand): Promise<HolderEntity> {
    const existing: HolderEntity | null = await this.holderRepo.findByDocument(command.document);
    if (existing) {
      throw new ConflictException('Document must be unique');
    }
    const card: CardEntity | null = await this.cardRepo.findOne({ where: { id: command.cardId } });
    if (!card) {
      throw new NotFoundException('Card not found');
    }
    const toSave: HolderEntity = { id: undefined as unknown as string, document: command.document, cardId: command.cardId, createdAt: undefined as unknown as Date, updatedAt: undefined as unknown as Date } as unknown as HolderEntity;
    const saved: HolderEntity = await this.holderRepo.save(toSave);
    const eventType: string = 'HolderCreated';
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

