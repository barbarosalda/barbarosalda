import type { UserPreference as PrismaUserPreference } from '@generated/prisma/client.ts';
import { describe, expect, it } from 'vitest';

import { toDomainUserPreference } from '@modules/user/infrastructure/persistence/prisma/mappers/UserPreferenceMapper.ts';

describe('UserPreferenceMapper', () => {
  it('maps metadata_json to metadataJson in the domain model', () => {
    const createdAt = new Date('2026-05-01T10:00:00.000Z');
    const updatedAt = new Date('2026-05-02T10:00:00.000Z');
    const metadata = { notifications: { email: true }, tags: ['pro', 'swing'] };

    const row: PrismaUserPreference = {
      id: 'upr_123',
      user_id: 'usr_123',
      timezone: 'UTC',
      locale: 'en-GB',
      metadata_json: metadata,
      created_at: createdAt,
      updated_at: updatedAt,
    };

    const preference = toDomainUserPreference(row);

    expect(preference).toEqual({
      id: 'upr_123',
      userId: 'usr_123',
      timezone: 'UTC',
      locale: 'en-GB',
      metadataJson: metadata,
      createdAt,
      updatedAt,
    });
  });
});
