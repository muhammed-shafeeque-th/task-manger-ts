import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env';
import { createAuthRouter } from './modules/auth/auth.routes';
import { createTaskRouter } from './modules/tasks/task.routes';
import { errorHandler, notFoundHandler } from './shared/error-handler';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1); 
  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_ORIGINS, credentials: true }));
  app.use(express.json({ limit: '100kb' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/auth', createAuthRouter());
  app.use('/api/tasks', createTaskRouter());

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
