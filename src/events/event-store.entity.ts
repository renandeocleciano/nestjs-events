import { ObjectId } from 'mongodb';
import { Column, CreateDateColumn, Entity, Index, ObjectIdColumn } from 'typeorm';

@Entity({ name: 'stored_events' })
@Index(['aggregateId'])
@Index(['aggregateType'])
@Index(['type'])
@Index(['occurredAt'])
@Index(['correlationId'])
export class StoredEvent {
  @ObjectIdColumn()
  public readonly _id!: ObjectId;

  @Column()
  public readonly aggregateId!: string;

  @Column()
  public readonly aggregateType!: 'Card' | 'Holder' | 'Account';

  @Column()
  public readonly type!: string;

  @Column({ type: 'simple-json' })
  public readonly payload!: Record<string, unknown>;

  @Column({ type: 'simple-json' })
  public readonly metadata!: Record<string, unknown>;

  @CreateDateColumn({ type: 'timestamp' })
  public readonly occurredAt!: Date;

  @Column()
  public readonly correlationId!: string;
}

export interface StoredEventInput {
  aggregateId: string;
  aggregateType: 'Card' | 'Holder' | 'Account';
  type: string;
  payload: Record<string, unknown>;
  metadata: Record<string, unknown>;
  correlationId: string;
}

