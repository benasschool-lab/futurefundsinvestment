import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'futurefunds_secret';

export interface AuthRequest extends Request {
  userId?: number;
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Missing token' });
  }

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    req.userId = (payload as any).userId;
    next();
  });
}

export function signToken(userId: number) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '12h' });
}
