import { Inject, Service } from 'typedi';
import { DataSource, DeepPartial } from 'typeorm';
import winston from 'winston';

import { Logger } from '@Decorators/Logger';

import { Transaction } from '@Entities/Transaction';
import { TransactionType } from '@Enums/TransactionType';

import { BaseOrmRepository } from '@Repositories/BaseOrmRepository';

export interface TransactionListOptions {
  userId: number;
  type?: TransactionType;
  categoryId?: number;
  dateFrom?: string;
  dateTo?: string;
  page: number;
  limit: number;
  sortBy?: 'date' | 'amount' | 'createdAt';
  sortDir?: 'ASC' | 'DESC';
}

@Service()
export class TransactionRepository extends BaseOrmRepository<Transaction> {
  constructor(
    @Logger(module) private logger: winston.Logger,
    @Inject('dataSource') private dataSource: DataSource,
  ) {
    super(dataSource, Transaction);
  }

  async findList(opts: TransactionListOptions): Promise<{ items: Transaction[]; total: number }> {
    const { userId, type, categoryId, dateFrom, dateTo, page, limit, sortBy = 'date', sortDir = 'DESC' } = opts;

    const qb = this.repo
      .createQueryBuilder('t')
      .where('t.userId = :userId AND t.deletedAt IS NULL', { userId });

    if (type) qb.andWhere('t.type = :type', { type });
    if (categoryId) qb.andWhere('t.categoryId = :categoryId', { categoryId });
    if (dateFrom) qb.andWhere('t.date >= :dateFrom', { dateFrom });
    if (dateTo) qb.andWhere('t.date <= :dateTo', { dateTo });

    const [items, total] = await qb
      .orderBy(`t.${sortBy}`, sortDir)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items, total };
  }

  async findByIdAndUser(id: number, userId: number): Promise<Transaction | null> {
    return this.repo.findOne({ where: { id, userId, deletedAt: null } });
  }

  async create(data: DeepPartial<Transaction>): Promise<Transaction> {
    const tx = this.repo.create(data);
    return this.repo.save(tx);
  }

  async updateByIdAndUser(id: number, userId: number, data: DeepPartial<Transaction>): Promise<Transaction | null> {
    await this.repo.update({ id, userId }, data);
    return this.findByIdAndUser(id, userId);
  }

  async softDeleteByIdAndUser(id: number, userId: number): Promise<boolean> {
    const result = await this.repo.softDelete({ id, userId });
    return (result.affected ?? 0) > 0;
  }

  async sumByUserAndMonth(userId: number, categoryId: number, month: number, year: number): Promise<number> {
    const result = await this.repo
      .createQueryBuilder('t')
      .select('COALESCE(SUM(CAST(t.amount AS numeric)), 0)', 'total')
      .where(
        't.userId = :userId AND t.categoryId = :categoryId AND t.type = :type AND EXTRACT(MONTH FROM t.date::date) = :month AND EXTRACT(YEAR FROM t.date::date) = :year AND t.deletedAt IS NULL',
        { userId, categoryId, type: TransactionType.EXPENSE, month, year },
      )
      .getRawOne();
    return parseFloat(result?.total ?? '0');
  }
}
