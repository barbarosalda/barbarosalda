import { z } from 'zod';

import { RuleSeverity } from '@src/modules/risk-manager/domain/Rule/RuleSeverity';
import { RuleType } from '@src/modules/risk-manager/domain/Rule/RuleType';
import { AuditSnapshotSchema } from '@src/shared/domain/Audit/AuditSnapshot';
import { RecordStatus } from '@src/shared/domain/Record/RecordStatus';
import { JsonValueSchema } from '@src/shared/kernel/json/JsonValue';


export const RuleSchema = z.object({
    id: z.string().min(1),
    rule_set_id: z.string().min(1),
    rule_type: z.nativeEnum(RuleType),
    name: z.string().min(1),
    description: z.string().nullable(),
    severity: z.nativeEnum(RuleSeverity),
    priority: z.number().int(),
    params_json: JsonValueSchema,
    source_url: z.string().nullable(),
    status: z.nativeEnum(RecordStatus),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type Rule = z.infer<typeof RuleSchema>;

export const CreateRuleSchema = z.object({
    rule_set_id: z.string().min(1),
    rule_type: z.nativeEnum(RuleType),
    name: z.string().min(1),
    description: z.string().nullable().optional(),
    severity: z.nativeEnum(RuleSeverity).optional(),
    priority: z.number().int().optional(),
    params_json: JsonValueSchema,
    source_url: z.string().nullable().optional(),
    status: z.nativeEnum(RecordStatus).optional(),
});

export type CreateRuleInput = z.infer<typeof CreateRuleSchema>;

export const UpdateRuleSchema = z.object({
    rule_set_id: z.string().min(1).optional(),
    rule_type: z.nativeEnum(RuleType).optional(),
    name: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    severity: z.nativeEnum(RuleSeverity).optional(),
    priority: z.number().int().optional(),
    params_json: JsonValueSchema.optional(),
    source_url: z.string().nullable().optional(),
    status: z.nativeEnum(RecordStatus).optional(),
});

export type UpdateRuleInput = z.infer<typeof UpdateRuleSchema>;

export const RuleAuditActions = {
    RuleCreated: 'RULE_CREATED',
    RuleUpdated: 'RULE_UPDATED',
} as const;

export const RuleAuditSnapshotDataSchema = z.object({
    id: z.string().min(1),
    rule_set_id: z.string().min(1),
    rule_type: z.nativeEnum(RuleType),
    name: z.string().min(1),
    description: z.string().nullable(),
    severity: z.nativeEnum(RuleSeverity),
    priority: z.number().int(),
    params_json: JsonValueSchema,
    source_url: z.string().nullable(),
    status: z.nativeEnum(RecordStatus),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});

export const RuleAuditSnapshotSchema = AuditSnapshotSchema.extend({
    entityType: z.literal('rule'),
    schemaVersion: z.literal(1),
    data: RuleAuditSnapshotDataSchema,
});

export type RuleAuditSnapshot = z.infer<typeof RuleAuditSnapshotSchema>;

export function toRuleAuditSnapshot(rule: Rule): RuleAuditSnapshot {
    return RuleAuditSnapshotSchema.parse({
        entityType: 'rule',
        entityId: rule.id,
        schemaVersion: 1,
        data: {
            id: rule.id,
            rule_set_id: rule.rule_set_id,
            rule_type: rule.rule_type,
            name: rule.name,
            description: rule.description,
            severity: rule.severity,
            priority: rule.priority,
            params_json: rule.params_json,
            source_url: rule.source_url,
            status: rule.status,
            createdAt: rule.createdAt.toISOString(),
            updatedAt: rule.updatedAt.toISOString(),
        },
    });
}
