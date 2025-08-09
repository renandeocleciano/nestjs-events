import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RedisEventBusService } from '../../../messaging/redis-event-bus.service';
import { EventStoreService } from '../../../events/event-store.service';
import { AccountEntity } from '../account.entity';

interface DomainEnvelope {
  eventName: string;
  payload: Record<string, unknown>;
  metadata: Record<string, unknown>;
  occurredAt: string;
}

@Injectable()
export class CardCreatedSubscriber implements OnModuleInit {
  private readonly logger = new Logger(CardCreatedSubscriber.name);

  public constructor(
    private readonly eventBus: RedisEventBusService,
    private readonly eventStore: EventStoreService,
    @InjectRepository(AccountEntity, 'postgres') private readonly accountRepo: Repository<AccountEntity>,
  ) {}

  public async onModuleInit(): Promise<void> {
    await this.eventBus.subscribe(async (_channel, message) => {
      try {
        const envelope: DomainEnvelope = JSON.parse(message);
        if (envelope.eventName !== 'CardCreated') {
          return;
        }
        const cardId = String(envelope.payload?.id || '');
        if (!cardId) {
          this.logger.warn('CardCreated without id');
          return;
        }
        
        const existing = await this.accountRepo.findOne({ where: { cardId } });
        if (existing) {
          return;
        }
        const account = this.accountRepo.create({ cardId, amount: 100 });
        const saved = await this.accountRepo.save(account);

        await this.eventStore.append({
          aggregateId: saved.id,
          aggregateType: 'Account',
          type: 'AccountCreated',
          payload: { id: saved.id, cardId, amount: 100 },
          metadata: { ...envelope.metadata, cardId },
          correlationId: String((envelope as any)?.correlationId || envelope.metadata?.correlationId || ''),
        });
        await this.eventBus.publish('AccountCreated', { id: saved.id, cardId, amount: 100 }, { ...envelope.metadata, cardId });
        this.logger.log(`Account created for card ${cardId}: ${saved.id}`);
      } catch (err) {
        this.logger.error(`CardCreated handling failed: ${(err as Error).message}`);
      }
    });
  }
}

