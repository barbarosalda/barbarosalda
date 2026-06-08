import { describe, expect, it } from 'vitest';

import { VerifiedAuthIdentitySchema } from '@modules/user/domain/auth/schemas/VerifiedAuthIdentity.ts';

describe('VerifiedAuthIdentitySchema', () => {
  it('validates a correct verified identity', () => {
    const parsed = VerifiedAuthIdentitySchema.parse({
      provider: 'test',
      providerUserId: 'test-provider-user-1',
      email: 'test@example.com',
      emailVerified: true,
      name: 'Test User',
    });

    expect(parsed).toEqual({
      provider: 'test',
      providerUserId: 'test-provider-user-1',
      email: 'test@example.com',
      emailVerified: true,
      name: 'Test User',
    });
  });

  it('rejects an invalid email', () => {
    expect(() =>
      VerifiedAuthIdentitySchema.parse({
        provider: 'cognito',
        providerUserId: 'provider-user-1',
        email: 'invalid-email',
      }),
    ).toThrow();
  });
});
