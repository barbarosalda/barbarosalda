import type { Request, RequestHandler, Response } from 'express';

import { NotFoundError } from '../errors/HttpError.ts';

/**
 * Catch-all 404 handler. Must be registered after all routes so it only
 * fires when no route matched.
 */
export const notFoundMiddleware: RequestHandler = (_req: Request, _res: Response, next) => {
  next(new NotFoundError());
};
