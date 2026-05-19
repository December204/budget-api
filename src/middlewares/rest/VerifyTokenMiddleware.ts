import { Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';

import { AuthService } from '@Services/AuthService';

export function verifyToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: { message: 'No token provided', code: 'NO_TOKEN' } });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const authService = Container.get(AuthService);
    const payload = authService.verifyAccessToken(token);
    (req as any).user = payload;
    next();
  } catch (err: any) {
    res.status(401).json({ error: { message: err.message || 'Unauthorized', code: err.code || 'UNAUTHORIZED' } });
  }
}
