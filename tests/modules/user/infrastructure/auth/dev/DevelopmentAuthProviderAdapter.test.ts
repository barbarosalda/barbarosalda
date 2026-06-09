import { describe, expect, it } from 'vitest';

import { DevelopmentAuthProviderAdapter } from '@shared/infrastructure/auth/dev/DevelopmentAuthProviderAdapter';
import { devCognitoAccessTokenClaims } from '@shared/infrastructure/auth/dev/dev-auth.identity';

describe('DevelopmentAuthProviderAdapter', () => {
  const adapter = new DevelopmentAuthProviderAdapter();

  it('maps the fake Cognito access token claims into a verified dev identity', async () => {
    await expect(adapter.verifyToken('ignored-token')).resolves.toEqual({
      userId: devCognitoAccessTokenClaims.sub,
      provider: 'dev',
      tokenUse: 'access',
      username: devCognitoAccessTokenClaims.username,
      email: devCognitoAccessTokenClaims.email,
      emailVerified: devCognitoAccessTokenClaims.email_verified,
      name: devCognitoAccessTokenClaims.name,
      groups: [],
      scopes: ['openid', 'email', 'profile'],
    });
  });
});
