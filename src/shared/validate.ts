import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';
import { BadRequestError } from './errors';

type Source = 'body' | 'query' | 'params';

/** Validates and replaces the given request part with the parsed (typed, coerced) result. */
export const validate =
  (schema: ZodTypeAny, source: Source = 'body'): RequestHandler =>
  (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return next(new BadRequestError('Validation failed', result.error.flatten().fieldErrors));
    }
    (req as unknown as Record<Source, unknown>)[source] = result.data;
    next();
  };
