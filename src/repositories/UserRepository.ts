import { Inject, Service } from 'typedi';
import { DataSource, DeepPartial } from 'typeorm';
import winston from 'winston';

import { Logger } from '@Decorators/Logger';

import { User } from '@Entities/User';

import { BaseOrmRepository } from '@Repositories/BaseOrmRepository';

@Service()
export class UserRepository extends BaseOrmRepository<User> {
  constructor(
    @Logger(module) private logger: winston.Logger,
    @Inject('dataSource') private dataSource: DataSource,
  ) {
    super(dataSource, User);
  }

  async findById(id: number): Promise<User | null> {
    return this.repo.findOne({ where: { id, deletedAt: null } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email, deletedAt: null } });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.repo
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email AND user.deletedAt IS NULL', { email })
      .getOne();
  }

  async create(data: DeepPartial<User>): Promise<User> {
    const user = this.repo.create(data);
    return this.repo.save(user);
  }

  async updateById(id: number, data: DeepPartial<User>): Promise<User | null> {
    await this.repo.update({ id }, data);
    return this.findById(id);
  }
}
