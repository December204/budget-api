import { Body, JsonController, Post } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { Service } from 'typedi';

import { AuthService } from '@Services/AuthService';

import { LoginSchema, LogoutSchema, RefreshSchema, RegisterSchema } from '@Rests/validations/AuthValidation';
import { buildResponse } from '@Rests/types/Response';

import { ValidationError } from '@Errors/ValidationError';

@Service()
@JsonController('/auth')
@OpenAPI({ tags: ['Auth'] })
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/register')
  async register(@Body() body: unknown) {
    const result = RegisterSchema.safeParse(body);
    if (!result.success) throw new ValidationError(result.error.issues);
    const tokens = await this.authService.register(result.data.email, result.data.password, result.data.name);
    return buildResponse(tokens);
  }

  @Post('/login')
  async login(@Body() body: unknown) {
    const result = LoginSchema.safeParse(body);
    if (!result.success) throw new ValidationError(result.error.issues);
    const tokens = await this.authService.login(result.data.email, result.data.password);
    return buildResponse(tokens);
  }

  @Post('/refresh')
  async refresh(@Body() body: unknown) {
    const result = RefreshSchema.safeParse(body);
    if (!result.success) throw new ValidationError(result.error.issues);
    const tokens = await this.authService.refresh(result.data.refreshToken);
    return buildResponse(tokens);
  }

  @Post('/logout')
  async logout(@Body() body: unknown) {
    const result = LogoutSchema.safeParse(body);
    if (!result.success) throw new ValidationError(result.error.issues);
    await this.authService.logout(result.data.refreshToken);
    return buildResponse(null);
  }
}
