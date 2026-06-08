import { z } from 'zod';

import { AuditSnapshotSchema } from '@shared/domain/audit/AuditSnapshot';

export const UserStatusSchema = z.enum(['ACTIVE', 'DISABLED', 'DELETED']);
export type UserStatus = z.infer<typeof UserStatusSchema>;

export const UserSchema = z.object({
    id: z.string().min(1),
    email: z.string().email(),
    externalAuthProvider: z.string().min(1),
    externalAuthUserId: z.string().min(1),
    name: z.string().nullable(),
    status: UserStatusSchema,
    deletedAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

export const CreateUserSchema = z.object({
    email: z.string().email(),
    externalAuthProvider: z.string().min(1),
    externalAuthUserId: z.string().min(1),
    name: z.string().nullable().optional(),
    status: UserStatusSchema.optional().default('ACTIVE'),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = z.object({
    email: z.string().email().optional(),
    name: z.string().nullable().optional(),
    status: UserStatusSchema.optional(),
    deletedAt: z.date().nullable().optional(),
});

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

export const UserAuditActions = {
    UserCreated: 'USER_CREATED',
    UserProfileUpdated: 'USER_PROFILE_UPDATED',
    UserStatusChanged: 'USER_STATUS_CHANGED',
    UserDeleted: 'USER_DELETED',
} as const;

export const UserAuditSnapshotDataSchema = z.object({
    id: z.string().min(1),
    email: z.string().email(),
    externalAuthProvider: z.string().min(1),
    externalAuthUserId: z.string().min(1),
    name: z.string().nullable(),
    status: UserStatusSchema,
    deletedAt: z.string().datetime().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});

export const UserAuditSnapshotSchema = AuditSnapshotSchema.extend({
    entityType: z.literal('user'),
    schemaVersion: z.literal(1),
    data: UserAuditSnapshotDataSchema,
});

export type UserAuditSnapshot = z.infer<typeof UserAuditSnapshotSchema>;

export function toUserAuditSnapshot(user: User): UserAuditSnapshot {
    return UserAuditSnapshotSchema.parse({
        entityType: 'user',
        entityId: user.id,
        schemaVersion: 1,
        data: {
            id: user.id,
            email: user.email,
            externalAuthProvider: user.externalAuthProvider,
            externalAuthUserId: user.externalAuthUserId,
            name: user.name,
            status: user.status,
            deletedAt: user.deletedAt?.toISOString() ?? null,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
        },
    });
}
