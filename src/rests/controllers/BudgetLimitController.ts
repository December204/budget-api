import { Authorized, Body, CurrentUser, Get, JsonController, Post, QueryParams } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { Service } from 'typedi';

import { BudgetLimitService } from '@Services/BudgetLimitService';

import { BudgetLimitQuerySchema, UpsertBudgetLimitSchema } from '@Rests/validations/BudgetLimitValidation';
import { buildResponse } from '@Rests/types/Response';
import { ICurrentUser } from '@Rests/types/CurrentUser';

import { ValidationError } from '@Errors/ValidationError';

@Service()
@JsonController('/budget-limits')
@Authorized()
@OpenAPI({ security: [{ BearerToken: [] }], tags: ['BudgetLimits'] })
export class BudgetLimitController {
  constructor(private budgetLimitService: BudgetLimitService) {}

  @Get('/')
  async list(@CurrentUser() cu: ICurrentUser, @QueryParams() query: unknown) {
    const result = BudgetLimitQuerySchema.safeParse(query);
    if (!result.success) throw new ValidationError(result.error.issues);
    const items = await this.budgetLimitService.listByMonth(cu.id, result.data.month, result.data.year);
    return buildResponse(items);
  }

  @Post('/upsert')
  async upsert(@CurrentUser() cu: ICurrentUser, @Body() body: unknown) {
    const result = UpsertBudgetLimitSchema.safeParse(body);
    if (!result.success) throw new ValidationError(result.error.issues);
    const limit = await this.budgetLimitService.upsert(cu.id, result.data);
    return buildResponse(limit);
  }
}
