import { Service } from 'typedi';
import winston from 'winston';

import { Logger } from '@Decorators/Logger';

import { BudgetLimit } from '@Entities/BudgetLimit';

import { BudgetLimitRepository } from '@Repositories/BudgetLimitRepository';
import { TransactionRepository } from '@Repositories/TransactionRepository';

export interface UpsertBudgetLimitInput {
  categoryId: number;
  month: number;
  year: number;
  limitAmount: number;
}

export interface BudgetLimitWithStats extends BudgetLimit {
  spent: number;
  percent: number;
  status: 'ok' | 'warning' | 'exceeded';
}

@Service()
export class BudgetLimitService {
  constructor(
    @Logger(module) private logger: winston.Logger,
    private budgetLimitRepo: BudgetLimitRepository,
    private txRepo: TransactionRepository,
  ) {}

  async listByMonth(userId: number, month: number, year: number): Promise<BudgetLimitWithStats[]> {
    const limits = await this.budgetLimitRepo.findByUserAndMonth(userId, month, year);
    return Promise.all(
      limits.map(async limit => {
        const spent = await this.txRepo.sumByUserAndMonth(userId, limit.categoryId, month, year);
        const percent = limit.limitAmount > 0 ? Math.round((spent / Number(limit.limitAmount)) * 100) : 0;
        const status = percent >= 100 ? 'exceeded' : percent >= 80 ? 'warning' : 'ok';
        return { ...limit, spent, percent, status } as BudgetLimitWithStats;
      }),
    );
  }

  async upsert(userId: number, input: UpsertBudgetLimitInput): Promise<BudgetLimitWithStats> {
    const limit = await this.budgetLimitRepo.upsert({ ...input, userId });
    const spent = await this.txRepo.sumByUserAndMonth(userId, limit.categoryId, limit.month, limit.year);
    const percent = limit.limitAmount > 0 ? Math.round((spent / Number(limit.limitAmount)) * 100) : 0;
    const status = percent >= 100 ? 'exceeded' : percent >= 80 ? 'warning' : 'ok';
    return { ...limit, spent, percent, status } as BudgetLimitWithStats;
  }
}
