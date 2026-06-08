import { randomUUID } from 'node:crypto';

import type { NextFunction, Request, Response } from 'express';

import type { AuthenticatedActor } from '@shared/domain/auth/AuthenticatedActor';

export interface RequestContext {
  requestId: string;
  correlationId: string;
  actor?: AuthenticatedActor;
}

function getHeaderValue(request: Request, headerName: string): string | undefined {
  const value = request.header(headerName)?.trim();
  return value && value.length > 0 ? value : undefined;
}

/**
 * Creates the request-level context used by HTTP handlers and use cases.
 *
 * Keep identity out of request bodies. Auth middleware adds the authenticated
 * actor after the Cognito JWT has been verified.
 */
export function requestContextMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  const requestId = getHeaderValue(request, 'x-request-id') ?? randomUUID();
  const correlationId = getHeaderValue(request, 'x-correlation-id') ?? requestId;

  request.context = {
    requestId,
    correlationId,
  };

  response.setHeader('x-request-id', requestId);
  response.setHeader('x-correlation-id', correlationId);

  next();
}
