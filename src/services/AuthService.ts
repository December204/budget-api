import crypto from 'crypto';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Service } from 'typedi';

import { env } from '@Libs/env';

import { RegisterDto, LoginDto } from '@Rests/validations/AuthValidation';

import { prisma } from '../lib/prisma';

const BCRYPT_ROUNDS = 10;

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

@Service()
export class AuthService {
  private signAccessToken(userId: string, email: string): string {
    return jwt.sign({ userId, email }, env.jwt.secret, {
      expiresIn: env.jwt.accessExpiresIn as any,
    });
  }

  private async createRefreshToken(userId: string): Promise<string> {
    const token = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date(Date.now() + env.jwt.refreshExpiresInMs);
    await prisma.refreshToken.create({ data: { token, userId, expiresAt } });
    return token;
  }

  async register(dto: RegisterDto): Promise<{ user: AuthUser; tokens: TokenPair }> {
    const existing = await prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      const err: any = new Error('Email already in use');
      err.httpCode = 409;
      err.code = 'EMAIL_TAKEN';
      throw err;
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await prisma.user.create({
      data: { email: dto.email, passwordHash, name: dto.name },
      select: { id: true, email: true, name: true },
    });

    const accessToken = this.signAccessToken(user.id, user.email);
    const refreshToken = await this.createRefreshToken(user.id);

    return { user, tokens: { accessToken, refreshToken } };
  }

  async login(dto: LoginDto): Promise<{ user: AuthUser; tokens: TokenPair }> {
    const user = await prisma.user.findUnique({
      where: { email: dto.email, deletedAt: null },
      select: { id: true, email: true, name: true, passwordHash: true },
    });
    if (!user) {
      const err: any = new Error('Invalid email or password');
      err.httpCode = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      const err: any = new Error('Invalid email or password');
      err.httpCode = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });

    const accessToken = this.signAccessToken(user.id, user.email);
    const refreshToken = await this.createRefreshToken(user.id);

    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, tokens: { accessToken, refreshToken } };
  }

  async refresh(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    const stored = await prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.expiresAt < new Date()) {
      const err: any = new Error('Invalid or expired refresh token');
      err.httpCode = 401;
      err.code = 'INVALID_REFRESH_TOKEN';
      throw err;
    }

    await prisma.refreshToken.delete({ where: { id: stored.id } });

    const user = await prisma.user.findUnique({
      where: { id: stored.userId, deletedAt: null },
      select: { id: true, email: true },
    });
    if (!user) {
      const err: any = new Error('User not found');
      err.httpCode = 401;
      err.code = 'USER_NOT_FOUND';
      throw err;
    }

    const accessToken = this.signAccessToken(user.id, user.email);
    const refreshToken = await this.createRefreshToken(user.id);

    return { accessToken, refreshToken };
  }

  async logout(token: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { token } });
  }

  verifyAccessToken(token: string): { userId: string; email: string } {
    try {
      return jwt.verify(token, env.jwt.secret) as { userId: string; email: string };
    } catch {
      const err: any = new Error('Invalid or expired token');
      err.httpCode = 401;
      err.code = 'INVALID_TOKEN';
      throw err;
    }
  }
}
