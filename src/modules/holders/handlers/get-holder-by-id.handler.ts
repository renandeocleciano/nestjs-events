import { Injectable, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { HolderRepository } from '../holder.repository';

import { HolderEntity } from '../holder.entity';
import { GetHolderByIdQuery } from '../queries/get-holder-by-id.query';

@Injectable()
@QueryHandler(GetHolderByIdQuery)
export class GetHolderByIdHandler implements IQueryHandler<GetHolderByIdQuery, HolderEntity> {
  public constructor(private readonly holderRepo: HolderRepository) {}

  public async execute(query: GetHolderByIdQuery): Promise<HolderEntity> {
    const found: HolderEntity | null = await this.holderRepo.findById(query.id);
    if (!found) {
      throw new NotFoundException('Holder not found');
    }
    return found;
  }
}

