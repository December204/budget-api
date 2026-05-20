import { Authorized, Body, CurrentUser, Get, JsonController, Patch } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { Service } from 'typedi';

import { UserService } from '@Services/UserService';

import { UpdateUserDto } from '@Rests/types/UserDto';
import { buildResponse } from '@Rests/types/Response';
import { ICurrentUser } from '@Rests/types/CurrentUser';

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
  async updateMe(@CurrentUser() cu: ICurrentUser, @Body() body: UpdateUserDto) {
    const user = await this.userService.updateMe(cu.id, body);
    return buildResponse(user);
  }
}
