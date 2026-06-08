import type { RequestHandler } from 'express';

/**
 * Wraps async Express handlers so thrown errors reach the registered error
 * middleware consistently in Express 4 and Express 5.
 */
export function asyncHandler(handler: RequestHandler): RequestHandler {
  return (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
}
