import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { CardEntity } from '../cards/card.entity';

@Entity({ name: 'accounts' })
export class AccountEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Index()
  @Column({ name: 'card_id', type: 'uuid' })
  public cardId!: string;

  @ManyToOne(() => CardEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'card_id', referencedColumnName: 'id' })
  public card!: CardEntity;

  @Column('integer', { default: 0 })
  public amount!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  public createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  public updatedAt!: Date;
}

