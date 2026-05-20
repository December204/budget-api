import { Inject, Service } from 'typedi';
import { DataSource, DeepPartial } from 'typeorm';
import winston from 'winston';

import { Logger } from '@Decorators/Logger';

import { Category } from '@Entities/Category';
import { CategoryType } from '@Enums/CategoryType';

import { BaseOrmRepository } from '@Repositories/BaseOrmRepository';

@Service()
export class CategoryRepository extends BaseOrmRepository<Category> {
  constructor(
    @Logger(module) private logger: winston.Logger,
    @Inject('dataSource') private dataSource: DataSource,
  ) {
    super(dataSource, Category);
  }

  async findAllByUser(userId: number, type?: CategoryType): Promise<Category[]> {
    const qb = this.repo
      .createQueryBuilder('c')
      .where('c.userId = :userId AND c.deletedAt IS NULL', { userId });
    if (type) qb.andWhere('c.type = :type', { type });
    return qb.orderBy('c.name', 'ASC').getMany();
  }

  async findByIdAndUser(id: number, userId: number): Promise<Category | null> {
    return this.repo.findOne({ where: { id, userId, deletedAt: null } });
  }

  async create(data: DeepPartial<Category>): Promise<Category> {
    const cat = this.repo.create(data);
    return this.repo.save(cat);
  }

  async updateByIdAndUser(id: number, userId: number, data: DeepPartial<Category>): Promise<Category | null> {
    await this.repo.update({ id, userId }, data);
    return this.findByIdAndUser(id, userId);
  }

  async softDeleteByIdAndUser(id: number, userId: number): Promise<boolean> {
    const result = await this.repo.softDelete({ id, userId });
    return (result.affected ?? 0) > 0;
  }
}
