import type { IAuthProviderPort } from '@src/shared/application/ports/auth/IAuthProviderPort';
import { AuthTokenInvalidError } from '@src/shared/domain/auth/errors/AuthTokenInvalidError';
import {
  VerifiedAuthIdentitySchema,
  type VerifiedAuthIdentity,
} from '@src/shared/domain/auth/schemas/VerifiedAuthIdentity';

import { devCognitoAccessTokenClaims } from './dev-auth.identity.ts';

export class DevelopmentAuthProviderAdapter implements IAuthProviderPort {
  async verifyToken(_token: string): Promise<VerifiedAuthIdentity> {
    if (devCognitoAccessTokenClaims.token_use !== 'access') {
      throw new AuthTokenInvalidError('Development auth token must be an access token.');
    }

    return VerifiedAuthIdentitySchema.parse({
      userId: devCognitoAccessTokenClaims.sub,
      provider: 'dev',
      tokenUse: devCognitoAccessTokenClaims.token_use,
      username: devCognitoAccessTokenClaims.username,
      email: devCognitoAccessTokenClaims.email,
      emailVerified: devCognitoAccessTokenClaims.email_verified ?? false,
      name: devCognitoAccessTokenClaims.name,
      groups: [],
      scopes: devCognitoAccessTokenClaims.scope?.split(' ').filter(Boolean) ?? [],
    });
  }
}
