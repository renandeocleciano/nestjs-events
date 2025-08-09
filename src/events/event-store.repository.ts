import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, MongoRepository } from 'typeorm';

import { StoredEvent, StoredEventInput } from './event-store.entity';

@Injectable()
export class EventStoreRepository {
  private readonly repository: MongoRepository<StoredEvent>;

  public constructor(@InjectDataSource('mongo') private readonly dataSource: DataSource) {
    this.repository = this.dataSource.getMongoRepository(StoredEvent);
  }

  public async append(input: StoredEventInput): Promise<StoredEvent> {
    const entity: Partial<StoredEvent> = {
      aggregateId: input.aggregateId,
      aggregateType: input.aggregateType,
      type: input.type,
      payload: input.payload,
      metadata: input.metadata,
      occurredAt: new Date(),
      correlationId: input.correlationId,
    } as Partial<StoredEvent>;
    return await this.repository.save(entity as StoredEvent);
  }

  public async listByAggregate(aggregateId: string): Promise<StoredEvent[]> {
    return await this.repository.find({ where: { aggregateId }, order: { occurredAt: 'asc' } });
  }

  public async listByType(type: string): Promise<StoredEvent[]> {
    return await this.repository.find({ where: { type }, order: { occurredAt: 'desc' } });
  }
}

