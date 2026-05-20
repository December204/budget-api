import { Service } from 'typedi';
import winston from 'winston';

import { Logger } from '@Decorators/Logger';

import { TransactionType } from '@Enums/TransactionType';

import { Transaction } from '@Entities/Transaction';

import { TransactionListOptions, TransactionRepository } from '@Repositories/TransactionRepository';

export interface CreateTransactionInput {
  categoryId?: number;
  amount: number;
  type: TransactionType;
  description?: string;
  note?: string;
  date: string;
}

export interface UpdateTransactionInput {
  categoryId?: number;
  amount?: number;
  type?: TransactionType;
  description?: string;
  note?: string;
  date?: string;
}

export interface ListTransactionQuery {
  type?: TransactionType;
  categoryId?: number;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'amount' | 'createdAt';
  sortDir?: 'ASC' | 'DESC';
}

@Service()
export class TransactionService {
  constructor(
    @Logger(module) private logger: winston.Logger,
    private txRepo: TransactionRepository,
  ) {}

  async list(userId: number, query: ListTransactionQuery): Promise<{ items: Transaction[]; total: number }> {
    const opts: TransactionListOptions = {
      userId,
      type: query.type,
      categoryId: query.categoryId,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      sortBy: query.sortBy ?? 'date',
      sortDir: query.sortDir ?? 'DESC',
    };
    return this.txRepo.findList(opts);
  }

  async getOne(userId: number, id: number): Promise<Transaction> {
    const tx = await this.txRepo.findByIdAndUser(id, userId);
    if (!tx) {
      throw Object.assign(new Error('Transaction not found'), { httpCode: 404, name: 'NotFoundError' });
    }
    return tx;
  }

  async create(userId: number, input: CreateTransactionInput): Promise<Transaction> {
    return this.txRepo.create({ ...input, userId });
  }

  async update(userId: number, id: number, input: UpdateTransactionInput): Promise<Transaction> {
    const tx = await this.txRepo.updateByIdAndUser(id, userId, input);
    if (!tx) {
      throw Object.assign(new Error('Transaction not found'), { httpCode: 404, name: 'NotFoundError' });
    }
    return tx;
  }

  async delete(userId: number, id: number): Promise<void> {
    const deleted = await this.txRepo.softDeleteByIdAndUser(id, userId);
    if (!deleted) {
      throw Object.assign(new Error('Transaction not found'), { httpCode: 404, name: 'NotFoundError' });
    }
  }
}
