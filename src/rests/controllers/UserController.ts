import { Authorized, Body, CurrentUser, Get, JsonController, Patch } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { Service } from 'typedi';

import { UserService } from '@Services/UserService';

import { UpdateUserSchema } from '@Rests/validations/UserValidation';
import { buildResponse } from '@Rests/types/Response';
import { ICurrentUser } from '@Rests/types/CurrentUser';

import { ValidationError } from '@Errors/ValidationError';

@Service()
@JsonController('/users')
@OpenAPI({ security: [{ BearerToken: [] }], tags: ['Users'] })
export class UserController {
  constructor(private userService: UserService) {}

  @Authorized()
  @Get('/me')
  async getMe(@CurrentUser() cu: ICurrentUser) {
    const user = await this.userService.getMe(cu.id);
    return buildResponse(user);
  }

  @Authorized()
  @Patch('/me')
  async updateMe(@CurrentUser() cu: ICurrentUser, @Body() body: unknown) {
    const result = UpdateUserSchema.safeParse(body);
    if (!result.success) throw new ValidationError(result.error.issues);
    const user = await this.userService.updateMe(cu.id, result.data);
    return buildResponse(user);
  }
}
