import type { Request } from 'express';

import type { VerifiedAuthIdentity } from '@src/shared/domain/Auth/schemas/VerifiedAuthIdentity';
import { AuthUnauthorizedHttpError } from '@src/shared/presentation/http/errors/AuthHttpErrors';

export function getAuthenticatedUser(request: Request): VerifiedAuthIdentity {
  const actor = request.context?.actor;

  if (!actor) {
    throw new AuthUnauthorizedHttpError('Authenticated user context is missing.');
  }

  return actor;
}
