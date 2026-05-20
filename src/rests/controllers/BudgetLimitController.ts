import { Authorized, Body, CurrentUser, Get, JsonController, Post, Req } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { Request } from 'express';
import { Service } from 'typedi';

import { ValidationError } from '@Errors/ValidationError';

import { BudgetLimitService } from '@Services/BudgetLimitService';

import { BudgetLimitQuerySchema } from '@Rests/validations/BudgetLimitValidation';
import { UpsertBudgetLimitDto } from '@Rests/types/BudgetLimitDto';
import { buildResponse } from '@Rests/types/Response';
import { ICurrentUser } from '@Rests/types/CurrentUser';

@Service()
@JsonController('/budget-limits')
@Authorized()
@OpenAPI({ security: [{ BearerToken: [] }], tags: ['BudgetLimits'] })
export class BudgetLimitController {
  constructor(private budgetLimitService: BudgetLimitService) {}

  @Get('/')
  async list(@CurrentUser() cu: ICurrentUser, @Req() req: Request) {
    const result = BudgetLimitQuerySchema.safeParse(req.query);
    if (!result.success) throw new ValidationError(result.error.issues);
    const items = await this.budgetLimitService.listByMonth(cu.id, result.data.month, result.data.year);
    return buildResponse(items);
  }

  @Post('/upsert')
  async upsert(@CurrentUser() cu: ICurrentUser, @Body() body: UpsertBudgetLimitDto) {
    const limit = await this.budgetLimitService.upsert(cu.id, body);
    return buildResponse(limit);
  }
}
