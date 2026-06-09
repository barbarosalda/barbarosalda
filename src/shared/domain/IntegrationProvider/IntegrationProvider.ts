import { z } from 'zod';

import { AuditSnapshotSchema } from '@src/shared/domain/Audit/AuditSnapshot';
import { RecordStatus } from '@src/shared/domain/Record/RecordStatus';
import { IntegrationAuthType } from '@src/shared/domain/IntegrationProvider/enums/IntegrationAuthType';
import { IntegrationConnectionMode } from '@src/shared/domain/IntegrationProvider/enums/IntegrationConnectionMode';
import { IntegrationProviderType } from '@src/shared/domain/IntegrationProvider/enums/IntegrationProviderType';


export const IntegrationProviderSchema = z.object({
    id: z.string().min(1),
    code: z.string().min(1),
    name: z.string().min(1),
    description: z.string().nullable(),
    provider_type: z.nativeEnum(IntegrationProviderType),
    auth_type: z.nativeEnum(IntegrationAuthType),
    connection_mode: z.nativeEnum(IntegrationConnectionMode),
    adapter_key: z.string().min(1),
    website_url: z.string().nullable(),
    logo_url: z.string().nullable(),
    status: z.nativeEnum(RecordStatus),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type IntegrationProvider = z.infer<typeof IntegrationProviderSchema>;

export const CreateIntegrationProviderSchema = z.object({
    code: z.string().min(1),
    name: z.string().min(1),
    description: z.string().nullable().optional(),
    provider_type: z.nativeEnum(IntegrationProviderType).optional(),
    auth_type: z.nativeEnum(IntegrationAuthType),
    connection_mode: z.nativeEnum(IntegrationConnectionMode),
    adapter_key: z.string().min(1),
    website_url: z.string().nullable().optional(),
    logo_url: z.string().nullable().optional(),
    status: z.nativeEnum(RecordStatus).optional(),
});

export type CreateIntegrationProviderInput = z.infer<typeof CreateIntegrationProviderSchema>;

export const UpdateIntegrationProviderSchema = z.object({
    code: z.string().min(1).optional(),
    name: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    provider_type: z.nativeEnum(IntegrationProviderType).optional(),
    auth_type: z.nativeEnum(IntegrationAuthType).optional(),
    connection_mode: z.nativeEnum(IntegrationConnectionMode).optional(),
    adapter_key: z.string().min(1).optional(),
    website_url: z.string().nullable().optional(),
    logo_url: z.string().nullable().optional(),
    status: z.nativeEnum(RecordStatus).optional(),
});

export type UpdateIntegrationProviderInput = z.infer<typeof UpdateIntegrationProviderSchema>;

export const IntegrationProviderAuditActions = {
    IntegrationProviderCreated: 'INTEGRATION_PROVIDER_CREATED',
    IntegrationProviderUpdated: 'INTEGRATION_PROVIDER_UPDATED',
} as const;

export const IntegrationProviderAuditSnapshotDataSchema = z.object({
    id: z.string().min(1),
    code: z.string().min(1),
    name: z.string().min(1),
    description: z.string().nullable(),
    provider_type: z.nativeEnum(IntegrationProviderType),
    auth_type: z.nativeEnum(IntegrationAuthType),
    connection_mode: z.nativeEnum(IntegrationConnectionMode),
    adapter_key: z.string().min(1),
    website_url: z.string().nullable(),
    logo_url: z.string().nullable(),
    status: z.nativeEnum(RecordStatus),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});

export const IntegrationProviderAuditSnapshotSchema = AuditSnapshotSchema.extend({
    entityType: z.literal('integration_provider'),
    schemaVersion: z.literal(1),
    data: IntegrationProviderAuditSnapshotDataSchema,
});

export type IntegrationProviderAuditSnapshot = z.infer<typeof IntegrationProviderAuditSnapshotSchema>;

export function toIntegrationProviderAuditSnapshot(
    integrationProvider: IntegrationProvider,
): IntegrationProviderAuditSnapshot {
    return IntegrationProviderAuditSnapshotSchema.parse({
        entityType: 'integration_provider',
        entityId: integrationProvider.id,
        schemaVersion: 1,
        data: {
            id: integrationProvider.id,
            code: integrationProvider.code,
            name: integrationProvider.name,
            description: integrationProvider.description,
            provider_type: integrationProvider.provider_type,
            auth_type: integrationProvider.auth_type,
            connection_mode: integrationProvider.connection_mode,
            adapter_key: integrationProvider.adapter_key,
            website_url: integrationProvider.website_url,
            logo_url: integrationProvider.logo_url,
            status: integrationProvider.status,
            createdAt: integrationProvider.createdAt.toISOString(),
            updatedAt: integrationProvider.updatedAt.toISOString(),
        },
    });
}
