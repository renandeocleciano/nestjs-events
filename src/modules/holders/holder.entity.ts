import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { CardEntity } from '../cards/card.entity';

@Entity({ name: 'holders' })
export class HolderEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  @Index()
  public document!: string;

  @Column({ type: 'uuid', nullable: false })
  public cardId!: string;

  @ManyToOne(() => CardEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cardId', referencedColumnName: 'id' })
  public card!: CardEntity;

  @CreateDateColumn({ type: 'timestamptz' })
  public createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  public updatedAt!: Date;
}

