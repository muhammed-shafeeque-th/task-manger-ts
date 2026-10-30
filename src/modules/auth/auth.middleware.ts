import type { RequestHandler } from 'express';
import { UnauthorizedError } from '../../shared/errors';
import { verifyToken } from '../../shared/jwt';

/** Requires a valid `Authorization: Bearer <jwt>` header and sets `req.userId`. */
export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Authentication required'));
  }
  try {
    req.userId = verifyToken(header.slice(7)).sub;
    next();
  } catch (err) {
    next(err);
  }
};
