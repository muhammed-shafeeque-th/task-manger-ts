import type { ErrorRequestHandler, RequestHandler } from 'express';
import { AppError } from './errors';
import { env } from '../config/env';

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message, details: err.details });
  }
  // Mongo duplicate key
  if (err?.code === 11000) {
    return res.status(409).json({ message: 'Resource already exists' });
  }
  // Malformed JSON body
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Malformed JSON body' });
  }
  console.error(err);
  res.status(500).json({
    message: 'Internal server error',
    ...(env.isProduction ? {} : { details: String(err?.message ?? err) }),
  });
};
