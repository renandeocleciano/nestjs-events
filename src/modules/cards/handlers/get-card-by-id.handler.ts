import { Injectable, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CardRepository } from '../card.repository';

import { CardEntity } from '../card.entity';
import { GetCardByIdQuery } from '../queries/get-card-by-id.query';

@Injectable()
@QueryHandler(GetCardByIdQuery)
export class GetCardByIdHandler implements IQueryHandler<GetCardByIdQuery, CardEntity> {
  public constructor(private readonly cardRepository: CardRepository) {}

  public async execute(query: GetCardByIdQuery): Promise<CardEntity> {
    const found: CardEntity | null = await this.cardRepository.findById(query.id);
    if (!found) {
      throw new NotFoundException('Card not found');
    }
    return found;
  }
}

