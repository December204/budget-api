import { Authorized, Body, CurrentUser, Delete, Get, JsonController, Param, Patch, Post, Req } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { Request } from 'express';
import { Service } from 'typedi';

import { ValidationError } from '@Errors/ValidationError';

import { TransactionService } from '@Services/TransactionService';

import { TransactionQuerySchema } from '@Rests/validations/TransactionValidation';
import { CreateTransactionDto, UpdateTransactionDto } from '@Rests/types/TransactionDto';
import { buildPagedResponse, buildResponse } from '@Rests/types/Response';
import { ICurrentUser } from '@Rests/types/CurrentUser';

@Service()
@JsonController('/transactions')
@Authorized()
@OpenAPI({ security: [{ BearerToken: [] }], tags: ['Transactions'] })
export class TransactionController {
  constructor(private txService: TransactionService) {}

  @Get('/')
  async list(@CurrentUser() cu: ICurrentUser, @Req() req: Request) {
    const result = TransactionQuerySchema.safeParse(req.query);
    if (!result.success) throw new ValidationError(result.error.issues);
    const { items, total } = await this.txService.list(cu.id, result.data);
    return buildPagedResponse(items, { total, page: result.data.page, limit: result.data.limit });
  }

  @Get('/:id')
  async getOne(@CurrentUser() cu: ICurrentUser, @Param('id') id: number) {
    const tx = await this.txService.getOne(cu.id, id);
    return buildResponse(tx);
  }

  @Post('/')
  async create(@CurrentUser() cu: ICurrentUser, @Body() body: CreateTransactionDto) {
    const tx = await this.txService.create(cu.id, body);
    return buildResponse(tx);
  }

  @Patch('/:id')
  async update(@CurrentUser() cu: ICurrentUser, @Param('id') id: number, @Body() body: UpdateTransactionDto) {
    const tx = await this.txService.update(cu.id, id, body);
    return buildResponse(tx);
  }

  @Delete('/:id')
  async delete(@CurrentUser() cu: ICurrentUser, @Param('id') id: number) {
    await this.txService.delete(cu.id, id);
    return buildResponse(null);
  }
}
