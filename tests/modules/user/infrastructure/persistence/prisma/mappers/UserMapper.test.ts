import type { User as PrismaUser } from '@generated/prisma/client.ts';
import { describe, expect, it } from 'vitest';

import { toDomainUser } from '@modules/user/infrastructure/persistence/prisma/mappers/UserMapper.ts';

describe('UserMapper', () => {
  it('maps a Prisma user row to the domain model', () => {
    const createdAt = new Date('2026-05-01T10:00:00.000Z');
    const updatedAt = new Date('2026-05-02T10:00:00.000Z');
    const deletedAt = new Date('2026-05-03T10:00:00.000Z');

    const row: PrismaUser = {
      id: 'usr_123',
      email: 'user@example.com',
      external_auth_provider: 'auth0',
      external_auth_user_id: 'auth0|123',
      name: 'Trader Lock',
      status: 'ACTIVE',
      deleted_at: deletedAt,
      created_at: createdAt,
      updated_at: updatedAt,
    };

    const user = toDomainUser(row);

    expect(user).toEqual({
      id: 'usr_123',
      email: 'user@example.com',
      externalAuthProvider: 'auth0',
      externalAuthUserId: 'auth0|123',
      name: 'Trader Lock',
      status: 'ACTIVE',
      deletedAt,
      createdAt,
      updatedAt,
    });
  });

  it('throws when the row is not valid for the domain schema', () => {
    const row = {
      id: 'usr_123',
      email: 'user@example.com',
      external_auth_provider: 'auth0',
      external_auth_user_id: 'auth0|123',
      name: null,
      status: 'NOT_A_REAL_STATUS',
      deleted_at: null,
      created_at: new Date('2026-05-01T10:00:00.000Z'),
      updated_at: new Date('2026-05-02T10:00:00.000Z'),
    } as unknown as PrismaUser;

    expect(() => toDomainUser(row)).toThrow();
  });
});
