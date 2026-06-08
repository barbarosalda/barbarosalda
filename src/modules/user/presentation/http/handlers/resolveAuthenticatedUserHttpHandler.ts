import { randomUUID } from 'node:crypto';

import type { Request, RequestHandler } from 'express';

import type { IAuthProviderPort } from '../../../application/ports/IAuthProviderPort.ts';
import { ResolveAuthenticatedUserCommand } from '../../../application/contracts/ResolveAuthenticatedUserContract.ts';
import type { ResolveAuthenticatedUserUseCase } from '../../../application/use-cases/ResolveAuthenticatedUserUseCase.ts';
import { AuthTokenInvalidError } from '../../../domain/auth/errors/AuthTokenInvalidError.ts';
import { UserUnauthorizedHttpError } from '../errors/userHttpErrors.ts';

function getRequestCorrelationId(request: Request): string {
  const headerValue = request.header('x-correlation-id')?.trim();
  return headerValue && headerValue.length > 0 ? headerValue : randomUUID();
}

function getRequestId(request: Request): string | undefined {
  const headerValue = request.header('x-request-id')?.trim();
  return headerValue && headerValue.length > 0 ? headerValue : undefined;
}

function extractBearerToken(request: Request): string {
  const authorization = request.header('authorization')?.trim();
  if (!authorization) {
    throw new UserUnauthorizedHttpError('Missing Authorization header.');
  }

  const [scheme, ...tokenParts] = authorization.split(/\s+/);
  const token = tokenParts.join(' ').trim();
  if (scheme !== 'Bearer' || token.length === 0) {
    throw new UserUnauthorizedHttpError('Authorization header must use Bearer token.');
  }

  return token;
}

export function resolveAuthenticatedUserHttpHandler(deps: {
  authProvider: IAuthProviderPort;
  resolveAuthenticatedUserUseCase: ResolveAuthenticatedUserUseCase;
}): RequestHandler {
  return async (request, response) => {
    const token = extractBearerToken(request);

    let identity;
    try {
      identity = await deps.authProvider.verifyToken(token);
    } catch (error) {
      if (error instanceof AuthTokenInvalidError) {
        throw new UserUnauthorizedHttpError(error.message);
      }
      throw error;
    }

    const command = ResolveAuthenticatedUserCommand.parse({
      identity,
      correlationId: getRequestCorrelationId(request),
      requestId: getRequestId(request),
    });
    const result = await deps.resolveAuthenticatedUserUseCase.execute(command);

    response.status(200).json(result);
  };
}
