import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CardRepository } from '../card.repository';

import { CardEntity } from '../card.entity';
import { ListCardsQuery } from '../queries/list-cards.query';

@Injectable()
@QueryHandler(ListCardsQuery)
export class ListCardsHandler implements IQueryHandler<ListCardsQuery, { items: CardEntity[]; total: number }> {
  public constructor(private readonly cardRepository: CardRepository) {}

  public async execute(query: ListCardsQuery): Promise<{ items: CardEntity[]; total: number }> {
    return await this.cardRepository.listAll({ page: query.page, pageSize: query.pageSize });
  }
}

