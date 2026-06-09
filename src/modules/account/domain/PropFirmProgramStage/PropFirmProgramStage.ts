import { z } from 'zod';

import { AuditSnapshotSchema } from '@src/shared/domain/Audit/AuditSnapshot';


export const PropFirmProgramStageSchema = z.object({
    id: z.string().min(1),
    program_id: z.string().min(1),
    name: z.string().min(1),
    sequence_order: z.number().int().positive(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type PropFirmProgramStage = z.infer<typeof PropFirmProgramStageSchema>;

export const CreatePropFirmProgramStageSchema = z.object({
    program_id: z.string().min(1),
    name: z.string().min(1),
    sequence_order: z.number().int().positive(),
});

export type CreatePropFirmProgramStageInput = z.infer<typeof CreatePropFirmProgramStageSchema>;

export const UpdatePropFirmProgramStageSchema = z.object({
    name: z.string().min(1),
    sequence_order: z.number().int().positive(),
});

export type UpdatePropFirmProgramStageInput = z.infer<typeof UpdatePropFirmProgramStageSchema>;

export const PropFirmProgramStageAuditActions = {
    PropFirmProgramStageCreated: 'PROP_FIRM_PROGRAM_STAGE_CREATED',
    PropFirmProgramStageUpdated: 'PROP_FIRM_PROGRAM_STAGE_UPDATED',
} as const;

export const PropFirmProgramStageAuditSnapshotDataSchema = z.object({
    id: z.string().min(1),
    program_id: z.string().min(1),
    name: z.string().min(1),
    sequence_order: z.number().int().positive(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});

export const PropFirmProgramStageAuditSnapshotSchema = AuditSnapshotSchema.extend({
    entityType: z.literal('prop_firm_program_stage'),
    schemaVersion: z.literal(1),
    data: PropFirmProgramStageAuditSnapshotDataSchema,
});

export type PropFirmProgramStageAuditSnapshot = z.infer<typeof PropFirmProgramStageAuditSnapshotSchema>;

export function toPropFirmProgramStageAuditSnapshot(
    propFirmProgramStage: PropFirmProgramStage,
): PropFirmProgramStageAuditSnapshot {
    return PropFirmProgramStageAuditSnapshotSchema.parse({
        entityType: 'prop_firm_program_stage',
        entityId: propFirmProgramStage.id,
        schemaVersion: 1,
        data: {
            id: propFirmProgramStage.id,
            program_id: propFirmProgramStage.program_id,
            name: propFirmProgramStage.name,
            sequence_order: propFirmProgramStage.sequence_order,
            createdAt: propFirmProgramStage.createdAt.toISOString(),
            updatedAt: propFirmProgramStage.updatedAt.toISOString(),
        },
    });
}
