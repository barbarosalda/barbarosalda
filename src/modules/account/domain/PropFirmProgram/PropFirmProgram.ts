import { z } from 'zod';

import { AuditSnapshotSchema } from '@src/shared/domain/Audit/AuditSnapshot';
import { RecordStatus } from '@src/shared/domain/Record/RecordStatus';
import { TradingMarketType } from '@src/modules/account/domain/PropFirmProgram/TradingMarketType';


export const PropFirmProgramSchema = z.object({
    id: z.string().min(1),
    prop_firm_id: z.string().min(1),
    name: z.string().min(1),
    slug: z.string().nullable(),
    initial_nominal_value: z.number().positive().nullable(),
    market_type: z.nativeEnum(TradingMarketType).nullable(),
    status: z.nativeEnum(RecordStatus).nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type PropFirmProgram = z.infer<typeof PropFirmProgramSchema>;

export const CreatePropFirmProgramSchema = z.object({
    prop_firm_id: z.string().min(1),
    name: z.string().min(1),
    slug: z.string().min(1),
    initial_nominal_value: z.number().positive().nullable(),
    market_type: z.nativeEnum(TradingMarketType).nullable(),
    status: z.nativeEnum(RecordStatus).nullable(),
});

export type CreatePropFirmProgramInput = z.infer<typeof CreatePropFirmProgramSchema>;

export const UpdatePropFirmProgramSchema = z.object({
    name: z.string().min(1),
    slug: z.string().min(1),
    initial_nominal_value: z.number().positive().nullable(),
    market_type: z.nativeEnum(TradingMarketType).nullable(),
    status: z.nativeEnum(RecordStatus).nullable(),
});

export type UpdatePropFirmProgramInput = z.infer<typeof UpdatePropFirmProgramSchema>;

export const PropFirmProgramAuditActions = {
    PropFirmProgramCreated: 'PROP_FIRM_PROGRAM_CREATED',
    PropFirmProgramUpdated: 'PROP_FIRM_PROGRAM_UPDATED',
} as const;

export const PropFirmProgramAuditSnapshotDataSchema = z.object({
    id: z.string().min(1),
    prop_firm_id: z.string().min(1),
    name: z.string().min(1),
    slug: z.string().min(1),
    initial_nominal_value: z.number().positive().nullable(),
    market_type: z.nativeEnum(TradingMarketType).nullable(),
    status: z.nativeEnum(RecordStatus).nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});

export const PropFirmProgramAuditSnapshotSchema = AuditSnapshotSchema.extend({
    entityType: z.literal('prop_firm_program'),
    schemaVersion: z.literal(1),
    data: PropFirmProgramAuditSnapshotDataSchema,
});

export type PropFirmProgramAuditSnapshot = z.infer<typeof PropFirmProgramAuditSnapshotSchema>;

export function toPropFirmProgramAuditSnapshot(propFirmProgram: PropFirmProgram): PropFirmProgramAuditSnapshot {
    return PropFirmProgramAuditSnapshotSchema.parse({
        entityType: 'prop_firm_program',
        entityId: propFirmProgram.id,
        schemaVersion: 1,
        data: {
            id: propFirmProgram.id,
            prop_firm_id: propFirmProgram.prop_firm_id,
            name: propFirmProgram.name,
            slug: propFirmProgram.slug,
            initial_nominal_value: propFirmProgram.initial_nominal_value,
            market_type: propFirmProgram.market_type,
            status: propFirmProgram.status,
            createdAt: propFirmProgram.createdAt.toISOString(),
            updatedAt: propFirmProgram.updatedAt.toISOString(),
        },
    });
}
