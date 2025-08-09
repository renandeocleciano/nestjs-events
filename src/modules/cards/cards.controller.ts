import { Body, Controller, Get, Headers, Param, Patch, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { CreateCardCommand } from './commands/create-card.command';
import { UpdateCardCommand } from './commands/update-card.command';
import { GetCardByIdQuery } from './queries/get-card-by-id.query';
import { ListCardsQuery } from './queries/list-cards.query';

@Controller('cards')
export class CardsController {
  public constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @Post()
  public async create(@Body() dto: CreateCardDto, @Headers('x-correlation-id') correlationId?: string): Promise<unknown> {
    return await this.commandBus.execute(new CreateCardCommand(dto.document, { correlationId }));
  }

  @Patch(':id')
  public async update(
    @Param('id') id: string,
    @Body() dto: UpdateCardDto,
    @Headers('x-correlation-id') correlationId?: string,
  ): Promise<unknown> {
    return await this.commandBus.execute(new UpdateCardCommand(id, dto.document, { correlationId }));
  }

  @Get(':id')
  public async getById(@Param('id') id: string): Promise<unknown> {
    return await this.queryBus.execute(new GetCardByIdQuery(id));
  }

  @Get()
  public async list(@Query('page') page?: number, @Query('pageSize') pageSize?: number): Promise<unknown> {
    const currentPage: number = page ? Number(page) : 1;
    const currentPageSize: number = pageSize ? Number(pageSize) : 20;
    return await this.queryBus.execute(new ListCardsQuery(currentPage, currentPageSize));
  }

  @Get('admin/test')
  public test(): { ok: boolean } {
    return { ok: true };
  }
}

