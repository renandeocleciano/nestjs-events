import { Body, Controller, Get, Headers, Param, Patch, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { CreateHolderDto } from './dto/create-holder.dto';
import { UpdateHolderDto } from './dto/update-holder.dto';
import { CreateHolderCommand } from './commands/create-holder.command';
import { UpdateHolderCommand } from './commands/update-holder.command';
import { GetHolderByIdQuery } from './queries/get-holder-by-id.query';
import { ListHoldersQuery } from './queries/list-holders.query';

@Controller('holders')
export class HoldersController {
  public constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @Post()
  public async create(@Body() dto: CreateHolderDto, @Headers('x-correlation-id') correlationId?: string): Promise<unknown> {
    return await this.commandBus.execute(new CreateHolderCommand(dto.document, dto.cardId, { correlationId }));
  }

  @Patch(':id')
  public async update(
    @Param('id') id: string,
    @Body() dto: UpdateHolderDto,
    @Headers('x-correlation-id') correlationId?: string,
  ): Promise<unknown> {
    return await this.commandBus.execute(new UpdateHolderCommand(id, dto.document, dto.cardId, { correlationId }));
  }

  @Get(':id')
  public async getById(@Param('id') id: string): Promise<unknown> {
    return await this.queryBus.execute(new GetHolderByIdQuery(id));
  }

  @Get()
  public async list(@Query('page') page?: number, @Query('pageSize') pageSize?: number): Promise<unknown> {
    const currentPage: number = page ? Number(page) : 1;
    const currentPageSize: number = pageSize ? Number(pageSize) : 20;
    return await this.queryBus.execute(new ListHoldersQuery(currentPage, currentPageSize));
  }

  @Get('admin/test')
  public test(): { ok: boolean } {
    return { ok: true };
  }
}

