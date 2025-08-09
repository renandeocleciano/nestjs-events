import { Injectable } from '@nestjs/common';

import { EventStoreRepository } from './event-store.repository';
import { StoredEvent, StoredEventInput } from './event-store.entity';

@Injectable()
export class EventStoreService {
  public constructor(private readonly repository: EventStoreRepository) {}

  public async append(event: StoredEventInput): Promise<StoredEvent> {
    return await this.repository.append(event);
  }

  public async listByAggregate(aggregateId: string): Promise<StoredEvent[]> {
    return await this.repository.listByAggregate(aggregateId);
  }

  public async listByType(type: string): Promise<StoredEvent[]> {
    return await this.repository.listByType(type);
  }

  public async listByCorrelationId(correlationId: string): Promise<StoredEvent[]> {
    return await (this.repository as any).repository.find({ where: { correlationId }, order: { occurredAt: 'asc' } });
  }
}

