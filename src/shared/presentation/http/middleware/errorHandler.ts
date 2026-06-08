import type { NextFunction, Request, Response } from 'express';

import { LOG_MESSAGES } from '@shared/domain/logging/entities/LogMessage';
import { Logger } from '@shared/infrastructure/logging/Logger';
import { HttpError } from '../errors/HttpError.ts';

/**
 * Global Express error handler. Must be registered last, after all routes
 * and other middleware, and must declare all four parameters so Express
 * recognises it as an error handler.
 *
 * - Known `HttpError` subclasses are forwarded as-is with their status code.
 * - Unexpected errors are logged and returned as 500 so internal details
 *   are never leaked to the client.
 */
export function errorHandlerMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  // next must be declared even if unused — Express requires all 4 params
  _next: NextFunction,
): void {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  const message = err instanceof Error ? err.message : 'Internal server error';
  Logger.error(LOG_MESSAGES.APPLICATION.HTTP_UNHANDLED_ERROR, { error: message });
  res.status(500).json({ error: 'Internal server error' });
}
