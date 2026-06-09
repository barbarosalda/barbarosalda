import { z } from 'zod';

import { AuditSnapshotSchema } from '@src/shared/domain/Audit/AuditSnapshot';
import { RecordStatus } from '@src/shared/domain/Record/RecordStatus';
import { JsonValueSchema } from '@src/shared/kernel/json/JsonValue';
import { RuleGroupType } from '@src/modules/risk-manager/domain/RuleGroup/RuleGroupType';


export const RuleGroupSchema = z.object({
    id: z.string().min(1),
    user_id: z.string().min(1).nullable(),
    name: z.string().min(1),
    description: z.string().nullable(),
    group_type: z.nativeEnum(RuleGroupType),
    status: z.nativeEnum(RecordStatus),
    metadata_json: JsonValueSchema.nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type RuleGroup = z.infer<typeof RuleGroupSchema>;

export const CreateRuleGroupSchema = z.object({
    user_id: z.string().min(1).nullable().optional(),
    name: z.string().min(1),
    description: z.string().nullable().optional(),
    group_type: z.nativeEnum(RuleGroupType).optional(),
    status: z.nativeEnum(RecordStatus).optional(),
    metadata_json: JsonValueSchema.nullable().optional(),
});

export type CreateRuleGroupInput = z.infer<typeof CreateRuleGroupSchema>;

export const UpdateRuleGroupSchema = z.object({
    user_id: z.string().min(1).nullable().optional(),
    name: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    group_type: z.nativeEnum(RuleGroupType).optional(),
    status: z.nativeEnum(RecordStatus).optional(),
    metadata_json: JsonValueSchema.nullable().optional(),
});

export type UpdateRuleGroupInput = z.infer<typeof UpdateRuleGroupSchema>;

export const RuleGroupAuditActions = {
    RuleGroupCreated: 'RULE_GROUP_CREATED',
    RuleGroupUpdated: 'RULE_GROUP_UPDATED',
} as const;

export const RuleGroupAuditSnapshotDataSchema = z.object({
    id: z.string().min(1),
    user_id: z.string().min(1).nullable(),
    name: z.string().min(1),
    description: z.string().nullable(),
    group_type: z.nativeEnum(RuleGroupType),
    status: z.nativeEnum(RecordStatus),
    metadata_json: JsonValueSchema.nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});

export const RuleGroupAuditSnapshotSchema = AuditSnapshotSchema.extend({
    entityType: z.literal('rule_group'),
    schemaVersion: z.literal(1),
    data: RuleGroupAuditSnapshotDataSchema,
});

export type RuleGroupAuditSnapshot = z.infer<typeof RuleGroupAuditSnapshotSchema>;

export function toRuleGroupAuditSnapshot(ruleGroup: RuleGroup): RuleGroupAuditSnapshot {
    return RuleGroupAuditSnapshotSchema.parse({
        entityType: 'rule_group',
        entityId: ruleGroup.id,
        schemaVersion: 1,
        data: {
            id: ruleGroup.id,
            user_id: ruleGroup.user_id,
            name: ruleGroup.name,
            description: ruleGroup.description,
            group_type: ruleGroup.group_type,
            status: ruleGroup.status,
            metadata_json: ruleGroup.metadata_json,
            createdAt: ruleGroup.createdAt.toISOString(),
            updatedAt: ruleGroup.updatedAt.toISOString(),
        },
    });
}
