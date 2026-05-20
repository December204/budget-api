import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Service } from 'typedi';
import { v4 as uuidv4 } from 'uuid';
import winston from 'winston';

import { Logger } from '@Decorators/Logger';

import { env } from '@Libs/env';
import { sign } from '@Libs/jwt';

import { RefreshTokenRepository } from '@Repositories/RefreshTokenRepository';
import { UserRepository } from '@Repositories/UserRepository';

const BCRYPT_ROUNDS = 10;

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Service()
export class AuthService {
  constructor(
    @Logger(module) private logger: winston.Logger,
    private userRepo: UserRepository,
    private refreshTokenRepo: RefreshTokenRepository,
  ) {}

  async register(email: string, username: string, password: string, name?: string): Promise<TokenPair> {
    const [existingEmail, existingUsername] = await Promise.all([
      this.userRepo.findByEmail(email),
      this.userRepo.findByUsername(username),
    ]);
    if (existingEmail) {
      throw Object.assign(new Error('Email already registered'), { httpCode: 409, name: 'ConflictError' });
    }
    if (existingUsername) {
      throw Object.assign(new Error('Username already taken'), { httpCode: 409, name: 'ConflictError' });
    }
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await this.userRepo.create({ email, username, name: name || username, passwordHash });
    return this.issueTokenPair(user.id, user.email);
  }

  async login(username: string, password: string): Promise<TokenPair> {
    const user = await this.userRepo.findByUsernameWithPassword(username);
    if (!user) {
      throw Object.assign(new Error('Invalid credentials'), { httpCode: 401, name: 'UnauthorizedError' });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw Object.assign(new Error('Invalid credentials'), { httpCode: 401, name: 'UnauthorizedError' });
    }
    return this.issueTokenPair(user.id, user.email);
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    const stored = await this.refreshTokenRepo.findValid(refreshToken);
    if (!stored) {
      throw Object.assign(new Error('Invalid or expired refresh token'), { httpCode: 401, name: 'UnauthorizedError' });
    }
    let payload: any;
    try {
      payload = jwt.verify(refreshToken, env.jwt.refreshSecret, { algorithms: ['HS256'] });
    } catch {
      throw Object.assign(new Error('Invalid refresh token'), { httpCode: 401, name: 'UnauthorizedError' });
    }
    await this.refreshTokenRepo.revokeByToken(refreshToken);
    return this.issueTokenPair(stored.userId, payload.email);
  }

  async logout(refreshToken: string): Promise<void> {
    await this.refreshTokenRepo.revokeByToken(refreshToken);
  }

  private issueTokenPair(userId: number, email: string): TokenPair {
    const accessToken = this.signAccessToken(userId, email);
    const refreshToken = this.signRefreshToken(userId, email);
    const expiresAt = new Date(Date.now() + env.jwt.refreshExpiresInMs);
    this.refreshTokenRepo.create(userId, refreshToken, expiresAt).catch(err => {
      this.logger.error('AuthService:: failed to store refresh token', err);
    });
    return { accessToken, refreshToken };
  }

  private signAccessToken(userId: number, email: string): string {
    if (env.jwt.privateKey) {
      return sign({ sub: userId.toString(), email }, env.jwt.privateKey, env.jwt.accessExpiresIn, { alg: 'RS256', typ: 'JWT' });
    }
    return jwt.sign({ sub: userId.toString(), email }, env.jwt.secret, { expiresIn: env.jwt.accessExpiresIn as any, algorithm: 'HS256' });
  }

  private signRefreshToken(userId: number, email: string): string {
    return jwt.sign({ sub: userId.toString(), email, jti: uuidv4() }, env.jwt.refreshSecret, {
      expiresIn: '7d',
      algorithm: 'HS256',
    });
  }
}
