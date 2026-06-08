import type { IAuthProviderPort } from '@modules/user/application/ports/IAuthProviderPort';
import { AuthTokenInvalidError } from '@modules/user/domain/auth/errors/AuthTokenInvalidError';
import {
  VerifiedAuthIdentitySchema,
  type VerifiedAuthIdentity,
} from '@modules/user/domain/auth/schemas/VerifiedAuthIdentity';

import { devCognitoAccessTokenClaims } from './dev-auth.identity.ts';

export class DevelopmentAuthProviderAdapter implements IAuthProviderPort {
  async verifyToken(_token: string): Promise<VerifiedAuthIdentity> {
    if (devCognitoAccessTokenClaims.token_use !== 'access') {
      throw new AuthTokenInvalidError('Development auth token must be an access token.');
    }

    return VerifiedAuthIdentitySchema.parse({
      provider: 'cognito',
      providerUserId: devCognitoAccessTokenClaims.sub,
      email: devCognitoAccessTokenClaims.email,
      emailVerified: devCognitoAccessTokenClaims.email_verified ?? false,
      name: devCognitoAccessTokenClaims.name,
    });
  }
}
