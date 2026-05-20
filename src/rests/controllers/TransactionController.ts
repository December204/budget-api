import { Authorized, Body, CurrentUser, Delete, Get, JsonController, Param, Patch, Post, QueryParams } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { Service } from 'typedi';

import { TransactionService } from '@Services/TransactionService';

import { CreateTransactionSchema, TransactionQuerySchema, UpdateTransactionSchema } from '@Rests/validations/TransactionValidation';
import { buildPagedResponse, buildResponse } from '@Rests/types/Response';
import { ICurrentUser } from '@Rests/types/CurrentUser';

import { ValidationError } from '@Errors/ValidationError';

@Service()
@JsonController('/transactions')
@Authorized()
@OpenAPI({ security: [{ BearerToken: [] }], tags: ['Transactions'] })
export class TransactionController {
  constructor(private txService: TransactionService) {}

  @Get('/')
  async list(@CurrentUser() cu: ICurrentUser, @QueryParams() query: unknown) {
    const result = TransactionQuerySchema.safeParse(query);
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
  async create(@CurrentUser() cu: ICurrentUser, @Body() body: unknown) {
    const result = CreateTransactionSchema.safeParse(body);
    if (!result.success) throw new ValidationError(result.error.issues);
    const tx = await this.txService.create(cu.id, result.data);
    return buildResponse(tx);
  }

  @Patch('/:id')
  async update(@CurrentUser() cu: ICurrentUser, @Param('id') id: number, @Body() body: unknown) {
    const result = UpdateTransactionSchema.safeParse(body);
    if (!result.success) throw new ValidationError(result.error.issues);
    const tx = await this.txService.update(cu.id, id, result.data);
    return buildResponse(tx);
  }

  @Delete('/:id')
  async delete(@CurrentUser() cu: ICurrentUser, @Param('id') id: number) {
    await this.txService.delete(cu.id, id);
    return buildResponse(null);
  }
}
