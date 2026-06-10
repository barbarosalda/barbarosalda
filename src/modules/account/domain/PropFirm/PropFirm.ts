import { z } from 'zod';

import { AuditSnapshotSchema } from '@src/shared/domain/Audit/AuditSnapshot';
import { RecordStatus } from '@src/shared/domain/Record/RecordStatus';
import { PropFirmType } from '@src/modules/account/domain/PropFirm/PropFirmType';
import { PropFirmProgramSchema } from '@src/modules/account/domain/PropFirmProgram/PropFirmProgram';
import { PropFirmProgramStageSchema } from '@src/modules/account/domain/PropFirmProgramStage/PropFirmProgramStage';


export const PropFirmSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    slug: z.string().min(1),
    website_url: z.string().nullable(),
    status: z.nativeEnum(RecordStatus).nullable(),
    firm_type: z.nativeEnum(PropFirmType).nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type PropFirm = z.infer<typeof PropFirmSchema>;

export const PropFirmProgramWithStagesSchema = PropFirmProgramSchema.extend({
    stages: z.array(PropFirmProgramStageSchema),
});

export type PropFirmProgramWithStages = z.infer<typeof PropFirmProgramWithStagesSchema>;

export const PropFirmWithProgramsAndStagesSchema = PropFirmSchema.extend({
    programs: z.array(PropFirmProgramWithStagesSchema),
});

export type PropFirmWithProgramsAndStages = z.infer<typeof PropFirmWithProgramsAndStagesSchema>;

export const CreatePropFirmSchema = z.object({
    name: z.string().min(1),
    slug: z.string().min(1),
    website_url: z.string().nullable(),
    status: z.nativeEnum(RecordStatus).nullable(),
    firm_type: z.nativeEnum(PropFirmType).nullable(),
});

export type CreatePropFirmInput = z.infer<typeof CreatePropFirmSchema>;

export const UpdatePropFirmSchema = z.object({
    website_url: z.string().nullable(),
    status: z.nativeEnum(RecordStatus).nullable(),
    firm_type: z.nativeEnum(PropFirmType).nullable(),
});

export type UpdatePropFirmInput = z.infer<typeof UpdatePropFirmSchema>;

export const PropFirmAuditActions = {
    PropFirmCreated: 'PROP_FIRM_CREATED',
    PropFirmUpdated: 'PROP_FIRM_UPDATED',   
} as const;

export const PropFirmAuditSnapshotDataSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    slug: z.string().min(1),
    website_url: z.string().nullable(),
    status: z.nativeEnum(RecordStatus).nullable(),
    firm_type: z.nativeEnum(PropFirmType).nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});

export const PropFirmAuditSnapshotSchema = AuditSnapshotSchema.extend({
    entityType: z.literal('prop_firm'),
    schemaVersion: z.literal(1),
    data: PropFirmAuditSnapshotDataSchema,
});

export type PropFirmAuditSnapshot = z.infer<typeof PropFirmAuditSnapshotSchema>;

export function toPropFirmAuditSnapshot(propFirm: PropFirm): PropFirmAuditSnapshot {
    return PropFirmAuditSnapshotSchema.parse({
        entityType: 'prop_firm',
        entityId: propFirm.id,
        schemaVersion: 1,
        data: {
            id: propFirm.id,
            name: propFirm.name,
            slug: propFirm.slug,
            website_url: propFirm.website_url,
            status: propFirm.status,
            firm_type: propFirm.firm_type,
            createdAt: propFirm.createdAt.toISOString(),
            updatedAt: propFirm.updatedAt.toISOString(),
        },
    });
}
