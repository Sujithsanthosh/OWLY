import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { sendError } from '../utils/responses';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return sendError(res, null, 'Access token required', 401);
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret_key', (err: any, user: any) => {
    if (err) {
      return sendError(res, null, 'Invalid or expired token', 403);
    }
    req.user = user;
    next();
  });
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, null, 'Unauthorized', 401);
    }
    if (!roles.includes(req.user.role)) {
      return sendError(res, null, 'Insufficient permissions', 403);
    }
    next();
  };
};
