import { z } from 'zod';

import { AuditSnapshotSchema } from '@src/shared/domain/Audit/AuditSnapshot';
import { JsonValueSchema } from '@src/shared/kernel/json/JsonValue';
import { RuleStateStatus } from '@src/modules/risk-manager/domain/RuleState/RuleStateStatus';


export const RuleStateSchema = z.object({
    id: z.string().min(1),
    trading_account_id: z.string().min(1),
    rule_id: z.string().min(1),
    status: z.nativeEnum(RuleStateStatus),
    state_json: JsonValueSchema.nullable(),
    window_start_at: z.date().nullable(),
    window_end_at: z.date().nullable(),
    last_evaluated_event_id: z.string().min(1).nullable(),
    last_evaluated_at: z.date().nullable(),
    next_evaluation_at: z.date().nullable(),
    status_changed_at: z.date().nullable(),
    metadata_json: JsonValueSchema.nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type RuleState = z.infer<typeof RuleStateSchema>;

export const CreateRuleStateSchema = z.object({
    trading_account_id: z.string().min(1),
    rule_id: z.string().min(1),
    status: z.nativeEnum(RuleStateStatus).optional(),
    state_json: JsonValueSchema.nullable().optional(),
    window_start_at: z.date().nullable().optional(),
    window_end_at: z.date().nullable().optional(),
    last_evaluated_event_id: z.string().min(1).nullable().optional(),
    last_evaluated_at: z.date().nullable().optional(),
    next_evaluation_at: z.date().nullable().optional(),
    status_changed_at: z.date().nullable().optional(),
    metadata_json: JsonValueSchema.nullable().optional(),
});

export type CreateRuleStateInput = z.infer<typeof CreateRuleStateSchema>;

export const UpdateRuleStateSchema = z.object({
    trading_account_id: z.string().min(1).optional(),
    rule_id: z.string().min(1).optional(),
    status: z.nativeEnum(RuleStateStatus).optional(),
    state_json: JsonValueSchema.nullable().optional(),
    window_start_at: z.date().nullable().optional(),
    window_end_at: z.date().nullable().optional(),
    last_evaluated_event_id: z.string().min(1).nullable().optional(),
    last_evaluated_at: z.date().nullable().optional(),
    next_evaluation_at: z.date().nullable().optional(),
    status_changed_at: z.date().nullable().optional(),
    metadata_json: JsonValueSchema.nullable().optional(),
});

export type UpdateRuleStateInput = z.infer<typeof UpdateRuleStateSchema>;

export const RuleStateAuditActions = {
    RuleStateCreated: 'RULE_STATE_CREATED',
    RuleStateUpdated: 'RULE_STATE_UPDATED',
} as const;

export const RuleStateAuditSnapshotDataSchema = z.object({
    id: z.string().min(1),
    trading_account_id: z.string().min(1),
    rule_id: z.string().min(1),
    status: z.nativeEnum(RuleStateStatus),
    state_json: JsonValueSchema.nullable(),
    window_start_at: z.string().datetime().nullable(),
    window_end_at: z.string().datetime().nullable(),
    last_evaluated_event_id: z.string().min(1).nullable(),
    last_evaluated_at: z.string().datetime().nullable(),
    next_evaluation_at: z.string().datetime().nullable(),
    status_changed_at: z.string().datetime().nullable(),
    metadata_json: JsonValueSchema.nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});

export const RuleStateAuditSnapshotSchema = AuditSnapshotSchema.extend({
    entityType: z.literal('rule_state'),
    schemaVersion: z.literal(1),
    data: RuleStateAuditSnapshotDataSchema,
});

export type RuleStateAuditSnapshot = z.infer<typeof RuleStateAuditSnapshotSchema>;

export function toRuleStateAuditSnapshot(ruleState: RuleState): RuleStateAuditSnapshot {
    return RuleStateAuditSnapshotSchema.parse({
        entityType: 'rule_state',
        entityId: ruleState.id,
        schemaVersion: 1,
        data: {
            id: ruleState.id,
            trading_account_id: ruleState.trading_account_id,
            rule_id: ruleState.rule_id,
            status: ruleState.status,
            state_json: ruleState.state_json,
            window_start_at: ruleState.window_start_at?.toISOString() ?? null,
            window_end_at: ruleState.window_end_at?.toISOString() ?? null,
            last_evaluated_event_id: ruleState.last_evaluated_event_id,
            last_evaluated_at: ruleState.last_evaluated_at?.toISOString() ?? null,
            next_evaluation_at: ruleState.next_evaluation_at?.toISOString() ?? null,
            status_changed_at: ruleState.status_changed_at?.toISOString() ?? null,
            metadata_json: ruleState.metadata_json,
            createdAt: ruleState.createdAt.toISOString(),
            updatedAt: ruleState.updatedAt.toISOString(),
        },
    });
}
