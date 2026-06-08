import { describe, expect, it } from 'vitest';

import { AuthTokenInvalidError } from '@modules/user/domain/auth/errors/AuthTokenInvalidError.ts';
import { CognitoAuthProviderAdapter } from '@modules/user/infrastructure/auth/cognito/CognitoAuthProviderAdapter.ts';

describe('CognitoAuthProviderAdapter', () => {
  const adapter = new CognitoAuthProviderAdapter({
    region: 'eu-west-1',
    userPoolId: 'eu-west-1_example',
    clientId: 'example-client-id',
  });

  it('throws AuthTokenInvalidError for an empty token', async () => {
    await expect(adapter.verifyToken('')).rejects.toBeInstanceOf(AuthTokenInvalidError);
    await expect(adapter.verifyToken('   ')).rejects.toBeInstanceOf(AuthTokenInvalidError);
  });

  it('throws not-implemented error for a non-empty token', async () => {
    await expect(adapter.verifyToken('some-token')).rejects.toThrow(
      'Cognito token verification is not implemented yet.',
    );
  });
});
