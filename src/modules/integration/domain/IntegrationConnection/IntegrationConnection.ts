import { z } from 'zod';

import { AuditSnapshotSchema } from '@src/shared/domain/Audit/AuditSnapshot';
import { JsonValueSchema } from '@src/shared/kernel/json/JsonValue';
import { IntegrationConnectionStatus } from '@src/modules/integration/domain/IntegrationConnection/IntegrationConnectionStatus';


export const IntegrationConnectionSchema = z.object({
    id: z.string().min(1),
    user_id: z.string().min(1),
    provider_id: z.string().min(1),
    provider_external_user_id: z.string().nullable(),
    status: z.nativeEnum(IntegrationConnectionStatus),
    credentials_ref: z.string().nullable(),
    connected_at: z.date().nullable(),
    disconnected_at: z.date().nullable(),
    last_sync_at: z.date().nullable(),
    last_error: z.string().nullable(),
    metadata_json: JsonValueSchema.nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type IntegrationConnection = z.infer<typeof IntegrationConnectionSchema>;

export const CreateIntegrationConnectionSchema = z.object({
    user_id: z.string().min(1),
    provider_id: z.string().min(1),
    provider_external_user_id: z.string().nullable().optional(),
    status: z.nativeEnum(IntegrationConnectionStatus).optional(),
    credentials_ref: z.string().nullable().optional(),
    connected_at: z.date().nullable().optional(),
    disconnected_at: z.date().nullable().optional(),
    last_sync_at: z.date().nullable().optional(),
    last_error: z.string().nullable().optional(),
    metadata_json: JsonValueSchema.nullable().optional(),
});

export type CreateIntegrationConnectionInput = z.infer<typeof CreateIntegrationConnectionSchema>;

export const UpdateIntegrationConnectionSchema = z.object({
    provider_external_user_id: z.string().nullable().optional(),
    status: z.nativeEnum(IntegrationConnectionStatus).optional(),
    credentials_ref: z.string().nullable().optional(),
    connected_at: z.date().nullable().optional(),
    disconnected_at: z.date().nullable().optional(),
    last_sync_at: z.date().nullable().optional(),
    last_error: z.string().nullable().optional(),
    metadata_json: JsonValueSchema.nullable().optional(),
});

export type UpdateIntegrationConnectionInput = z.infer<typeof UpdateIntegrationConnectionSchema>;

export const IntegrationConnectionAuditActions = {
    IntegrationConnectionCreated: 'INTEGRATION_CONNECTION_CREATED',
    IntegrationConnectionUpdated: 'INTEGRATION_CONNECTION_UPDATED',
} as const;

export const IntegrationConnectionAuditSnapshotDataSchema = z.object({
    id: z.string().min(1),
    user_id: z.string().min(1),
    provider_id: z.string().min(1),
    provider_external_user_id: z.string().nullable(),
    status: z.nativeEnum(IntegrationConnectionStatus),
    credentials_ref: z.string().nullable(),
    connected_at: z.string().datetime().nullable(),
    disconnected_at: z.string().datetime().nullable(),
    last_sync_at: z.string().datetime().nullable(),
    last_error: z.string().nullable(),
    metadata_json: JsonValueSchema.nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});

export const IntegrationConnectionAuditSnapshotSchema = AuditSnapshotSchema.extend({
    entityType: z.literal('integration_connection'),
    schemaVersion: z.literal(1),
    data: IntegrationConnectionAuditSnapshotDataSchema,
});

export type IntegrationConnectionAuditSnapshot = z.infer<typeof IntegrationConnectionAuditSnapshotSchema>;

export function toIntegrationConnectionAuditSnapshot(
    integrationConnection: IntegrationConnection,
): IntegrationConnectionAuditSnapshot {
    return IntegrationConnectionAuditSnapshotSchema.parse({
        entityType: 'integration_connection',
        entityId: integrationConnection.id,
        schemaVersion: 1,
        data: {
            id: integrationConnection.id,
            user_id: integrationConnection.user_id,
            provider_id: integrationConnection.provider_id,
            provider_external_user_id: integrationConnection.provider_external_user_id,
            status: integrationConnection.status,
            credentials_ref: integrationConnection.credentials_ref,
            connected_at: integrationConnection.connected_at?.toISOString() ?? null,
            disconnected_at: integrationConnection.disconnected_at?.toISOString() ?? null,
            last_sync_at: integrationConnection.last_sync_at?.toISOString() ?? null,
            last_error: integrationConnection.last_error,
            metadata_json: integrationConnection.metadata_json,
            createdAt: integrationConnection.createdAt.toISOString(),
            updatedAt: integrationConnection.updatedAt.toISOString(),
        },
    });
}
