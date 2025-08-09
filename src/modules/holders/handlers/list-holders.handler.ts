import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { HolderRepository } from '../holder.repository';

import { HolderEntity } from '../holder.entity';
import { ListHoldersQuery } from '../queries/list-holders.query';

@Injectable()
@QueryHandler(ListHoldersQuery)
export class ListHoldersHandler implements IQueryHandler<ListHoldersQuery, { items: HolderEntity[]; total: number }> {
  public constructor(private readonly holderRepo: HolderRepository) {}

  public async execute(query: ListHoldersQuery): Promise<{ items: HolderEntity[]; total: number }> {
    return await this.holderRepo.listAll({ page: query.page, pageSize: query.pageSize });
  }
}

