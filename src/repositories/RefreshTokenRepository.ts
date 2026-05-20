import { Inject, Service } from 'typedi';
import { DataSource } from 'typeorm';
import winston from 'winston';

import { Logger } from '@Decorators/Logger';

import { RefreshToken } from '@Entities/RefreshToken';

import { BaseOrmRepository } from '@Repositories/BaseOrmRepository';

@Service()
export class RefreshTokenRepository extends BaseOrmRepository<RefreshToken> {
  constructor(
    @Logger(module) private logger: winston.Logger,
    @Inject('dataSource') private dataSource: DataSource,
  ) {
    super(dataSource, RefreshToken);
  }

  async create(userId: number, token: string, expiresAt: Date): Promise<RefreshToken> {
    const entity = this.repo.create({ userId, token, expiresAt, revokedAt: null });
    return this.repo.save(entity);
  }

  async findValid(token: string): Promise<RefreshToken | null> {
    return this.repo
      .createQueryBuilder('rt')
      .where('rt.token = :token AND rt.revokedAt IS NULL AND rt.expiresAt > NOW()', { token })
      .getOne();
  }

  async revokeByToken(token: string): Promise<void> {
    await this.repo.update({ token }, { revokedAt: new Date() });
  }

  async revokeAllByUser(userId: number): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .update()
      .set({ revokedAt: new Date() })
      .where('userId = :userId AND revokedAt IS NULL', { userId })
      .execute();
  }
}
