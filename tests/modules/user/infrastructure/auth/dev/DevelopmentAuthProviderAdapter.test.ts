import { describe, expect, it } from 'vitest';

import { DevelopmentAuthProviderAdapter } from '@modules/user/infrastructure/auth/dev/DevelopmentAuthProviderAdapter.ts';
import { devCognitoAccessTokenClaims } from '@modules/user/infrastructure/auth/dev/dev-auth.identity.ts';

describe('DevelopmentAuthProviderAdapter', () => {
  const adapter = new DevelopmentAuthProviderAdapter();

  it('maps the fake Cognito access token claims into a verified identity', async () => {
    await expect(adapter.verifyToken('ignored-token')).resolves.toEqual({
      provider: 'cognito',
      providerUserId: devCognitoAccessTokenClaims.sub,
      email: devCognitoAccessTokenClaims.email,
      emailVerified: devCognitoAccessTokenClaims.email_verified,
      name: devCognitoAccessTokenClaims.name,
    });
  });
});
