import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';

import { HolderEntity } from './holder.entity';

export interface ListParams {
  page: number;
  pageSize: number;
}

@Injectable()
export class HolderRepository {
  public constructor(@InjectRepository(HolderEntity, 'postgres') private readonly repo: Repository<HolderEntity>) {}

  public async findById(id: string): Promise<HolderEntity | null> {
    return await this.repo.findOne({ where: { id } });
  }

  public async findByDocument(document: string): Promise<HolderEntity | null> {
    return await this.repo.findOne({ where: { document } });
  }

  public async save(entity: HolderEntity): Promise<HolderEntity> {
    try {
      return await this.repo.save(entity);
    } catch (err) {
      if (err instanceof QueryFailedError && (err as any).code === '23505') {
        throw new ConflictException('Document must be unique');
      }
      throw err;
    }
  }

  public async listAll(params: ListParams): Promise<{ items: HolderEntity[]; total: number }> {
    const skip: number = (params.page - 1) * params.pageSize;
    const [items, total] = await this.repo.findAndCount({ order: { createdAt: 'DESC' }, skip, take: params.pageSize });
    return { items, total };
  }
}

