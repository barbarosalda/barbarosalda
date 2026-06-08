import type { Request } from 'express';

import type { VerifiedAuthIdentity } from '@modules/user/domain/auth/schemas/VerifiedAuthIdentity';
import { UserUnauthorizedHttpError } from '../errors/userHttpErrors.ts';

export function getAuthenticatedUser(request: Request): VerifiedAuthIdentity {
  const actor = request.context?.actor;

  if (!actor) {
    throw new UserUnauthorizedHttpError('Authenticated user context is missing.');
  }

  return actor;
}
