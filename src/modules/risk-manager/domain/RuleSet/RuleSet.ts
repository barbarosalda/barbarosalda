import { z } from 'zod';

import { AuditSnapshotSchema } from '@src/shared/domain/Audit/AuditSnapshot';
import { RecordStatus } from '@src/shared/domain/Record/RecordStatus';
import { JsonValueSchema } from '@src/shared/kernel/json/JsonValue';
import { RuleSetType } from '@src/modules/risk-manager/domain/RuleSet/RuleSetType';


export const RuleSetSchema = z.object({
    id: z.string().min(1),
    rule_group_id: z.string().min(1),
    prop_firm_id: z.string().min(1).nullable(),
    prop_firm_program_id: z.string().min(1).nullable(),
    prop_firm_program_stage_id: z.string().min(1).nullable(),
    name: z.string().min(1),
    description: z.string().nullable(),
    set_type: z.nativeEnum(RuleSetType),
    priority: z.number().int(),
    version: z.number().int().positive(),
    source_url: z.string().nullable(),
    status: z.nativeEnum(RecordStatus),
    metadata_json: JsonValueSchema.nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type RuleSet = z.infer<typeof RuleSetSchema>;

export const CreateRuleSetSchema = z.object({
    rule_group_id: z.string().min(1),
    prop_firm_id: z.string().min(1).nullable().optional(),
    prop_firm_program_id: z.string().min(1).nullable().optional(),
    prop_firm_program_stage_id: z.string().min(1).nullable().optional(),
    name: z.string().min(1),
    description: z.string().nullable().optional(),
    set_type: z.nativeEnum(RuleSetType).optional(),
    priority: z.number().int().optional(),
    version: z.number().int().positive().optional(),
    source_url: z.string().nullable().optional(),
    status: z.nativeEnum(RecordStatus).optional(),
    metadata_json: JsonValueSchema.nullable().optional(),
});

export type CreateRuleSetInput = z.infer<typeof CreateRuleSetSchema>;

export const UpdateRuleSetSchema = z.object({
    rule_group_id: z.string().min(1).optional(),
    prop_firm_id: z.string().min(1).nullable().optional(),
    prop_firm_program_id: z.string().min(1).nullable().optional(),
    prop_firm_program_stage_id: z.string().min(1).nullable().optional(),
    name: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    set_type: z.nativeEnum(RuleSetType).optional(),
    priority: z.number().int().optional(),
    version: z.number().int().positive().optional(),
    source_url: z.string().nullable().optional(),
    status: z.nativeEnum(RecordStatus).optional(),
    metadata_json: JsonValueSchema.nullable().optional(),
});

export type UpdateRuleSetInput = z.infer<typeof UpdateRuleSetSchema>;

export const RuleSetAuditActions = {
    RuleSetCreated: 'RULE_SET_CREATED',
    RuleSetUpdated: 'RULE_SET_UPDATED',
} as const;

export const RuleSetAuditSnapshotDataSchema = z.object({
    id: z.string().min(1),
    rule_group_id: z.string().min(1),
    prop_firm_id: z.string().min(1).nullable(),
    prop_firm_program_id: z.string().min(1).nullable(),
    prop_firm_program_stage_id: z.string().min(1).nullable(),
    name: z.string().min(1),
    description: z.string().nullable(),
    set_type: z.nativeEnum(RuleSetType),
    priority: z.number().int(),
    version: z.number().int().positive(),
    source_url: z.string().nullable(),
    status: z.nativeEnum(RecordStatus),
    metadata_json: JsonValueSchema.nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});

export const RuleSetAuditSnapshotSchema = AuditSnapshotSchema.extend({
    entityType: z.literal('rule_set'),
    schemaVersion: z.literal(1),
    data: RuleSetAuditSnapshotDataSchema,
});

export type RuleSetAuditSnapshot = z.infer<typeof RuleSetAuditSnapshotSchema>;

export function toRuleSetAuditSnapshot(ruleSet: RuleSet): RuleSetAuditSnapshot {
    return RuleSetAuditSnapshotSchema.parse({
        entityType: 'rule_set',
        entityId: ruleSet.id,
        schemaVersion: 1,
        data: {
            id: ruleSet.id,
            rule_group_id: ruleSet.rule_group_id,
            prop_firm_id: ruleSet.prop_firm_id,
            prop_firm_program_id: ruleSet.prop_firm_program_id,
            prop_firm_program_stage_id: ruleSet.prop_firm_program_stage_id,
            name: ruleSet.name,
            description: ruleSet.description,
            set_type: ruleSet.set_type,
            priority: ruleSet.priority,
            version: ruleSet.version,
            source_url: ruleSet.source_url,
            status: ruleSet.status,
            metadata_json: ruleSet.metadata_json,
            createdAt: ruleSet.createdAt.toISOString(),
            updatedAt: ruleSet.updatedAt.toISOString(),
        },
    });
}
