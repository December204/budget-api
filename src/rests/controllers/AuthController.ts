import { Request, Response } from 'express';
import { JsonController, Post, Req, Res, UseBefore } from 'routing-controllers';
import { Service } from 'typedi';
import rateLimit from 'express-rate-limit';

import { AuthService } from '@Services/AuthService';
import {
  RegisterSchema,
  LoginSchema,
  RefreshSchema,
  LogoutSchema,
} from '@Rests/validations/AuthValidation';

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({ error: { message: 'Too many requests, please try again later.', code: 'RATE_LIMITED' } });
  },
});

function parseBody(schema: any, body: unknown, res: Response): any | null {
  const result = schema.safeParse(body);
  if (!result.success) {
    const firstIssue = result.error.issues[0];
    res.status(400).json({
      error: {
        message: firstIssue?.message || 'Validation error',
        code: 'VALIDATION_ERROR',
        details: result.error.issues,
      },
    });
    return null;
  }
  return result.data;
}

@Service()
@JsonController('/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/register')
  @UseBefore(authRateLimiter)
  async register(@Req() req: Request, @Res() res: Response) {
    const dto = parseBody(RegisterSchema, req.body, res);
    if (!dto) return res;

    try {
      const { user, tokens } = await this.authService.register(dto);
      return res.status(201).json({ data: { user, ...tokens } });
    } catch (err: any) {
      const status = err.httpCode || 500;
      return res.status(status).json({ error: { message: err.message, code: err.code || 'INTERNAL_ERROR' } });
    }
  }

  @Post('/login')
  @UseBefore(authRateLimiter)
  async login(@Req() req: Request, @Res() res: Response) {
    const dto = parseBody(LoginSchema, req.body, res);
    if (!dto) return res;

    try {
      const { user, tokens } = await this.authService.login(dto);
      return res.status(200).json({ data: { user, ...tokens } });
    } catch (err: any) {
      const status = err.httpCode || 500;
      return res.status(status).json({ error: { message: err.message, code: err.code || 'INTERNAL_ERROR' } });
    }
  }

  @Post('/refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const dto = parseBody(RefreshSchema, req.body, res);
    if (!dto) return res;

    try {
      const tokens = await this.authService.refresh(dto.refreshToken);
      return res.status(200).json({ data: tokens });
    } catch (err: any) {
      const status = err.httpCode || 500;
      return res.status(status).json({ error: { message: err.message, code: err.code || 'INTERNAL_ERROR' } });
    }
  }

  @Post('/logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const dto = parseBody(LogoutSchema, req.body, res);
    if (!dto) return res;

    try {
      await this.authService.logout(dto.refreshToken);
      return res.status(200).json({ data: { message: 'Logged out successfully' } });
    } catch (err: any) {
      const status = err.httpCode || 500;
      return res.status(status).json({ error: { message: err.message, code: err.code || 'INTERNAL_ERROR' } });
    }
  }
}
