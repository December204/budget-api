import { Authorized, Body, CurrentUser, Delete, Get, JsonController, Param, Patch, Post, Req } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { Request } from 'express';
import { Service } from 'typedi';

import { ValidationError } from '@Errors/ValidationError';

import { CategoryService } from '@Services/CategoryService';

import { CategoryQuerySchema } from '@Rests/validations/CategoryValidation';
import { CreateCategoryDto, UpdateCategoryDto } from '@Rests/types/CategoryDto';
import { buildResponse } from '@Rests/types/Response';
import { ICurrentUser } from '@Rests/types/CurrentUser';

@Service()
@JsonController('/categories')
@Authorized()
@OpenAPI({ security: [{ BearerToken: [] }], tags: ['Categories'] })
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get('/')
  async list(@CurrentUser() cu: ICurrentUser, @Req() req: Request) {
    const result = CategoryQuerySchema.safeParse(req.query);
    if (!result.success) throw new ValidationError(result.error.issues);
    const items = await this.categoryService.list(cu.id, result.data.type);
    return buildResponse(items);
  }

  @Post('/')
  async create(@CurrentUser() cu: ICurrentUser, @Body() body: CreateCategoryDto) {
    const category = await this.categoryService.create(cu.id, body);
    return buildResponse(category);
  }

  @Patch('/:id')
  async update(@CurrentUser() cu: ICurrentUser, @Param('id') id: number, @Body() body: UpdateCategoryDto) {
    const category = await this.categoryService.update(cu.id, id, body);
    return buildResponse(category);
  }

  @Delete('/:id')
  async delete(@CurrentUser() cu: ICurrentUser, @Param('id') id: number) {
    await this.categoryService.delete(cu.id, id);
    return buildResponse(null);
  }
}
