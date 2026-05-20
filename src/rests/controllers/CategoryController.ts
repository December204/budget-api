import { Authorized, Body, CurrentUser, Delete, Get, JsonController, Param, Patch, Post, QueryParams } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { Service } from 'typedi';

import { CategoryService } from '@Services/CategoryService';

import { CategoryQuerySchema, CreateCategorySchema, UpdateCategorySchema } from '@Rests/validations/CategoryValidation';
import { buildResponse } from '@Rests/types/Response';
import { ICurrentUser } from '@Rests/types/CurrentUser';

import { ValidationError } from '@Errors/ValidationError';

@Service()
@JsonController('/categories')
@Authorized()
@OpenAPI({ security: [{ BearerToken: [] }], tags: ['Categories'] })
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get('/')
  async list(@CurrentUser() cu: ICurrentUser, @QueryParams() query: unknown) {
    const result = CategoryQuerySchema.safeParse(query);
    if (!result.success) throw new ValidationError(result.error.issues);
    const items = await this.categoryService.list(cu.id, result.data.type);
    return buildResponse(items);
  }

  @Post('/')
  async create(@CurrentUser() cu: ICurrentUser, @Body() body: unknown) {
    const result = CreateCategorySchema.safeParse(body);
    if (!result.success) throw new ValidationError(result.error.issues);
    const category = await this.categoryService.create(cu.id, result.data);
    return buildResponse(category);
  }

  @Patch('/:id')
  async update(@CurrentUser() cu: ICurrentUser, @Param('id') id: number, @Body() body: unknown) {
    const result = UpdateCategorySchema.safeParse(body);
    if (!result.success) throw new ValidationError(result.error.issues);
    const category = await this.categoryService.update(cu.id, id, result.data);
    return buildResponse(category);
  }

  @Delete('/:id')
  async delete(@CurrentUser() cu: ICurrentUser, @Param('id') id: number) {
    await this.categoryService.delete(cu.id, id);
    return buildResponse(null);
  }
}
