import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { container } from 'tsyringe';
import { validate } from '../../shared/validate';
import { AuthController } from './auth.controller';
import { requireAuth } from './auth.middleware';
import { loginSchema, registerSchema } from './auth.schemas';

export function createAuthRouter(): Router {
  const controller = container.resolve(AuthController);
  const router = Router();

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many attempts, please try again later' },
  });

  router.post('/register', limiter, validate(registerSchema), controller.register);
  router.post('/login', limiter, validate(loginSchema), controller.login);
  router.get('/me', requireAuth, controller.me);

  return router;
}
