import bcrypt from 'bcrypt';
import { Service } from 'typedi';
import winston from 'winston';

import { Logger } from '@Decorators/Logger';

import { User } from '@Entities/User';

import { UserRepository } from '@Repositories/UserRepository';

export interface UpdateUserInput {
  name?: string;
  password?: string;
}

@Service()
export class UserService {
  constructor(
    @Logger(module) private logger: winston.Logger,
    private userRepo: UserRepository,
  ) {}

  async getMe(userId: number): Promise<User> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw Object.assign(new Error('User not found'), { httpCode: 404, name: 'NotFoundError' });
    }
    return user;
  }

  async updateMe(userId: number, input: UpdateUserInput): Promise<User> {
    const updates: Partial<User> = {};
    if (input.name !== undefined) updates.name = input.name;
    if (input.password !== undefined) {
      (updates as any).passwordHash = await bcrypt.hash(input.password, 10);
    }
    const user = await this.userRepo.updateById(userId, updates);
    if (!user) {
      throw Object.assign(new Error('User not found'), { httpCode: 404, name: 'NotFoundError' });
    }
    return user;
  }
}
