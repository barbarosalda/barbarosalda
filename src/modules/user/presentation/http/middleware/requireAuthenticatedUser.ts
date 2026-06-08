import type { Request, RequestHandler } from 'express';

import type { IAuthProviderPort } from '../../../application/ports/IAuthProviderPort.ts';
import { AuthTokenInvalidError } from '../../../domain/auth/errors/AuthTokenInvalidError.ts';
import { UserUnauthorizedHttpError } from '../errors/userHttpErrors.ts';

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

/**
 * Verifies the Cognito JWT and attaches the authenticated identity to
 * `request.context.actor`.
 *
 * Downstream code must use `actor.userId`; clients must never send `user_id`.
 */
export function requireAuthenticatedUser(deps: { authProvider: IAuthProviderPort }): RequestHandler {
  return async (request, _response, next) => {
    try {
      const token = extractBearerToken(request);
      request.context.actor = await deps.authProvider.verifyToken(token);
      next();
    } catch (error) {
      if (error instanceof AuthTokenInvalidError) {
        next(new UserUnauthorizedHttpError(error.message));
        return;
      }

      next(error);
    }
  };
}
