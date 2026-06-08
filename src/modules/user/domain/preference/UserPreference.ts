import { z } from 'zod';

import { AuditSnapshotSchema } from '@shared/domain/audit/AuditSnapshot';
import { JsonValueSchema } from '@shared/kernel/json/JsonValue';

export const UserPreferenceSchema = z.object({
    id: z.string().min(1),
    userId: z.string().min(1),
    timezone: z.string().min(1),
    locale: z.string().nullable(),
    metadataJson: JsonValueSchema.nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type UserPreference = z.infer<typeof UserPreferenceSchema>;

export const CreateUserPreferenceSchema = z.object({
    userId: z.string().min(1),
    timezone: z.string().min(1),
    locale: z.string().nullable().optional(),
    metadataJson: JsonValueSchema.nullable().optional(),
});

export type CreateUserPreferenceInput = z.infer<typeof CreateUserPreferenceSchema>;

export const UpdateUserPreferenceSchema = z.object({
    timezone: z.string().min(1).optional(),
    locale: z.string().nullable().optional(),
    metadataJson: JsonValueSchema.nullable().optional(),
});

export type UpdateUserPreferenceInput = z.infer<typeof UpdateUserPreferenceSchema>;

export const UserPreferenceAuditActions = {
    UserPreferenceCreated: 'USER_PREFERENCE_CREATED',
    UserPreferenceUpdated: 'USER_PREFERENCE_UPDATED',
} as const;

export const UserPreferenceAuditSnapshotDataSchema = z.object({
    id: z.string().min(1),
    userId: z.string().min(1),
    timezone: z.string().min(1),
    locale: z.string().nullable(),
    metadataJson: JsonValueSchema.nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});

export const UserPreferenceAuditSnapshotSchema = AuditSnapshotSchema.extend({
    entityType: z.literal('user_preference'),
    schemaVersion: z.literal(1),
    data: UserPreferenceAuditSnapshotDataSchema,
});

export type UserPreferenceAuditSnapshot = z.infer<typeof UserPreferenceAuditSnapshotSchema>;

export function toUserPreferenceAuditSnapshot(userPreference: UserPreference): UserPreferenceAuditSnapshot {
    return UserPreferenceAuditSnapshotSchema.parse({
        entityType: 'user_preference',
        entityId: userPreference.id,
        schemaVersion: 1,
        data: {
            id: userPreference.id,
            userId: userPreference.userId,
            timezone: userPreference.timezone,
            locale: userPreference.locale,
            metadataJson: userPreference.metadataJson,
            createdAt: userPreference.createdAt.toISOString(),
            updatedAt: userPreference.updatedAt.toISOString(),
        },
    });
}
