import { Body, JsonController, Post } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { Service } from 'typedi';

import { AuthService } from '@Services/AuthService';

import { LoginDto, LogoutDto, RefreshDto, RegisterDto } from '@Rests/types/AuthDto';
import { buildResponse } from '@Rests/types/Response';

@Service()
@JsonController('/auth')
@OpenAPI({ tags: ['Auth'] })
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/register')
  async register(@Body() body: RegisterDto) {
    const tokens = await this.authService.register(body.email, body.username, body.password, body.name);
    return buildResponse(tokens);
  }

  @Post('/login')
  async login(@Body() body: LoginDto) {
    const tokens = await this.authService.login(body.username, body.password);
    return buildResponse(tokens);
  }

  @Post('/refresh')
  async refresh(@Body() body: RefreshDto) {
    const tokens = await this.authService.refresh(body.refreshToken);
    return buildResponse(tokens);
  }

  @Post('/logout')
  async logout(@Body() body: LogoutDto) {
    await this.authService.logout(body.refreshToken);
    return buildResponse(null);
  }
}
