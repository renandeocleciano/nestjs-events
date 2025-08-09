import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';

import { CardEntity } from './card.entity';

export interface ListParams {
  page: number;
  pageSize: number;
}

@Injectable()
export class CardRepository {
  public constructor(@InjectRepository(CardEntity, 'postgres') private readonly repo: Repository<CardEntity>) {}

  public async findById(id: string): Promise<CardEntity | null> {
    return await this.repo.findOne({ where: { id } });
  }

  public async findByDocument(document: string): Promise<CardEntity | null> {
    return await this.repo.findOne({ where: { document } });
  }

  public async save(entity: CardEntity): Promise<CardEntity> {
    try {
      return await this.repo.save(entity);
    } catch (err) {
      if (err instanceof QueryFailedError && (err as any).code === '23505') {
        throw new ConflictException('Document must be unique');
      }
      throw err;
    }
  }

  public async listAll(params: ListParams): Promise<{ items: CardEntity[]; total: number }> {
    const skip: number = (params.page - 1) * params.pageSize;
    const [items, total] = await this.repo.findAndCount({ order: { createdAt: 'DESC' }, skip, take: params.pageSize });
    return { items, total };
  }
}

