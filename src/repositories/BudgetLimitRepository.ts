import { Inject, Service } from 'typedi';
import { DataSource, DeepPartial } from 'typeorm';
import winston from 'winston';

import { Logger } from '@Decorators/Logger';

import { BudgetLimit } from '@Entities/BudgetLimit';

import { BaseOrmRepository } from '@Repositories/BaseOrmRepository';

@Service()
export class BudgetLimitRepository extends BaseOrmRepository<BudgetLimit> {
  constructor(
    @Logger(module) private logger: winston.Logger,
    @Inject('dataSource') private dataSource: DataSource,
  ) {
    super(dataSource, BudgetLimit);
  }

  async findByUserAndMonth(userId: number, month: number, year: number): Promise<BudgetLimit[]> {
    return this.repo
      .createQueryBuilder('bl')
      .where('bl.userId = :userId AND bl.month = :month AND bl.year = :year AND bl.deletedAt IS NULL', { userId, month, year })
      .orderBy('bl.categoryId', 'ASC')
      .getMany();
  }

  async findByUserCategoryMonth(userId: number, categoryId: number, month: number, year: number): Promise<BudgetLimit | null> {
    return this.repo.findOne({ where: { userId, categoryId, month, year, deletedAt: null } });
  }

  async upsert(data: DeepPartial<BudgetLimit>): Promise<BudgetLimit> {
    const existing = await this.findByUserCategoryMonth(
      data.userId as number,
      data.categoryId as number,
      data.month as number,
      data.year as number,
    );
    if (existing) {
      await this.repo.update({ id: existing.id }, { limitAmount: data.limitAmount });
      return { ...existing, limitAmount: data.limitAmount as number };
    }
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async softDeleteById(id: number, userId: number): Promise<boolean> {
    const result = await this.repo.softDelete({ id, userId });
    return (result.affected ?? 0) > 0;
  }
}
