import { describe, expect, it } from 'vitest';

import { VerifiedAuthIdentitySchema } from '@shared/domain/Auth/schemas/VerifiedAuthIdentity';

describe('VerifiedAuthIdentitySchema', () => {
  it('validates a correct verified identity', () => {
    const parsed = VerifiedAuthIdentitySchema.parse({
      userId: 'cognito-sub-001',
      provider: 'cognito',
      tokenUse: 'access',
      username: 'traderlock-user',
      email: 'test@example.com',
      emailVerified: true,
      name: 'Test User',
      groups: ['trader'],
      scopes: ['openid', 'email'],
    });

    expect(parsed).toEqual({
      userId: 'cognito-sub-001',
      provider: 'cognito',
      tokenUse: 'access',
      username: 'traderlock-user',
      email: 'test@example.com',
      emailVerified: true,
      name: 'Test User',
      groups: ['trader'],
      scopes: ['openid', 'email'],
    });
  });

  it('defaults groups and scopes to empty arrays', () => {
    const parsed = VerifiedAuthIdentitySchema.parse({
      userId: 'cognito-sub-001',
      provider: 'dev',
      tokenUse: 'access',
    });

    expect(parsed.groups).toEqual([]);
    expect(parsed.scopes).toEqual([]);
  });

  it('rejects an invalid email', () => {
    expect(() =>
      VerifiedAuthIdentitySchema.parse({
        userId: 'cognito-sub-001',
        provider: 'cognito',
        tokenUse: 'access',
        email: 'invalid-email',
      }),
    ).toThrow();
  });

  it('rejects the old providerUserId shape', () => {
    expect(() =>
      VerifiedAuthIdentitySchema.parse({
        provider: 'test',
        providerUserId: 'provider-user-1',
        email: 'test@example.com',
      }),
    ).toThrow();
  });
});
