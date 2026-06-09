import { describe, expect, it } from 'vitest';

import { AuthTokenInvalidError } from '@shared/domain/auth/errors/AuthTokenInvalidError.ts';
import { CognitoAuthProviderAdapter } from '@shared/infrastructure/auth/cognito/CognitoAuthProviderAdapter.ts';

describe('CognitoAuthProviderAdapter', () => {
  const adapter = new CognitoAuthProviderAdapter({
    userPoolId: 'eu-west-1_example',
    clientId: 'example-client-id',
    tokenUse: 'access',
  });

  it('throws AuthTokenInvalidError for an empty token', async () => {
    await expect(adapter.verifyToken('')).rejects.toBeInstanceOf(AuthTokenInvalidError);
    await expect(adapter.verifyToken('   ')).rejects.toBeInstanceOf(AuthTokenInvalidError);
  });

  it('throws AuthTokenInvalidError for an invalid non-empty token', async () => {
    await expect(adapter.verifyToken('some-token')).rejects.toBeInstanceOf(AuthTokenInvalidError);
    await expect(adapter.verifyToken('some-token')).rejects.toThrow('Invalid or expired authentication token.');
  });
});
