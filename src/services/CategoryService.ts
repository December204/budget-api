import { Service } from 'typedi';
import winston from 'winston';

import { Logger } from '@Decorators/Logger';

import { Category } from '@Entities/Category';
import { CategoryType } from '@Enums/CategoryType';

import { CategoryRepository } from '@Repositories/CategoryRepository';

export interface CreateCategoryInput {
  name: string;
  icon?: string;
  color?: string;
  type: CategoryType;
}

export interface UpdateCategoryInput {
  name?: string;
  icon?: string;
  color?: string;
  type?: CategoryType;
}

@Service()
export class CategoryService {
  constructor(
    @Logger(module) private logger: winston.Logger,
    private categoryRepo: CategoryRepository,
  ) {}

  async list(userId: number, type?: CategoryType): Promise<Category[]> {
    return this.categoryRepo.findAllByUser(userId, type);
  }

  async create(userId: number, input: CreateCategoryInput): Promise<Category> {
    return this.categoryRepo.create({ ...input, userId });
  }

  async update(userId: number, id: number, input: UpdateCategoryInput): Promise<Category> {
    const category = await this.categoryRepo.updateByIdAndUser(id, userId, input);
    if (!category) {
      throw Object.assign(new Error('Category not found'), { httpCode: 404, name: 'NotFoundError' });
    }
    return category;
  }

  async delete(userId: number, id: number): Promise<void> {
    const deleted = await this.categoryRepo.softDeleteByIdAndUser(id, userId);
    if (!deleted) {
      throw Object.assign(new Error('Category not found'), { httpCode: 404, name: 'NotFoundError' });
    }
  }
}
