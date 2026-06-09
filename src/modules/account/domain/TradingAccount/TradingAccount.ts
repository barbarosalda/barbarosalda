import { z } from 'zod';

import { AuditSnapshotSchema } from '@src/shared/domain/Audit/AuditSnapshot';
import { JsonValueSchema } from '@src/shared/kernel/json/JsonValue';
import { TradingAccountStatus } from '@src/modules/account/domain/TradingAccount/TradingAccountStatus';


export const TradingAccountSchema = z.object({
    id: z.string().min(1),
    user_id: z.string().min(1),
    license_id: z.string().min(1).nullable(),
    provider_account_id: z.string().min(1).nullable(),
    account_number: z.string().min(1).nullable(),
    account_label: z.string().min(1).nullable(),
    account_currency: z.string().min(1).nullable(),
    prop_firm_id: z.string().min(1).nullable(),
    prop_firm_program_id: z.string().min(1).nullable(),
    prop_firm_program_stage_id: z.string().min(1).nullable(),
    rule_group_id: z.string().min(1).nullable(),
    status: z.nativeEnum(TradingAccountStatus),
    metadata_json: JsonValueSchema.nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type TradingAccount = z.infer<typeof TradingAccountSchema>;

export const CreateTradingAccountSchema = z.object({
    user_id: z.string().min(1),
    license_id: z.string().min(1).nullable().optional(),
    provider_account_id: z.string().min(1).nullable().optional(),
    account_number: z.string().min(1).nullable().optional(),
    account_label: z.string().min(1).nullable().optional(),
    account_currency: z.string().min(1).nullable().optional(),
    prop_firm_id: z.string().min(1).nullable().optional(),
    prop_firm_program_id: z.string().min(1).nullable().optional(),
    prop_firm_program_stage_id: z.string().min(1).nullable().optional(),
    rule_group_id: z.string().min(1).nullable().optional(),
    status: z.nativeEnum(TradingAccountStatus).optional(),
    metadata_json: JsonValueSchema.nullable().optional(),
});

export type CreateTradingAccountInput = z.infer<typeof CreateTradingAccountSchema>;

export const UpdateTradingAccountSchema = z.object({
    user_id: z.string().min(1).optional(),
    license_id: z.string().min(1).nullable().optional(),
    provider_account_id: z.string().min(1).nullable().optional(),
    account_number: z.string().min(1).nullable().optional(),
    account_label: z.string().min(1).nullable().optional(),
    account_currency: z.string().min(1).nullable().optional(),
    prop_firm_id: z.string().min(1).nullable().optional(),
    prop_firm_program_id: z.string().min(1).nullable().optional(),
    prop_firm_program_stage_id: z.string().min(1).nullable().optional(),
    rule_group_id: z.string().min(1).nullable().optional(),
    status: z.nativeEnum(TradingAccountStatus).optional(),
    metadata_json: JsonValueSchema.nullable().optional(),
});

export type UpdateTradingAccountInput = z.infer<typeof UpdateTradingAccountSchema>;

export const TradingAccountAuditActions = {
    TradingAccountCreated: 'TRADING_ACCOUNT_CREATED',
    TradingAccountUpdated: 'TRADING_ACCOUNT_UPDATED',
} as const;

export const TradingAccountAuditSnapshotDataSchema = z.object({
    id: z.string().min(1),
    user_id: z.string().min(1),
    license_id: z.string().min(1).nullable(),
    provider_account_id: z.string().min(1).nullable(),
    account_number: z.string().min(1).nullable(),
    account_label: z.string().min(1).nullable(),
    account_currency: z.string().min(1).nullable(),
    prop_firm_id: z.string().min(1).nullable(),
    prop_firm_program_id: z.string().min(1).nullable(),
    prop_firm_program_stage_id: z.string().min(1).nullable(),
    rule_group_id: z.string().min(1).nullable(),
    status: z.nativeEnum(TradingAccountStatus),
    metadata_json: JsonValueSchema.nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});

export const TradingAccountAuditSnapshotSchema = AuditSnapshotSchema.extend({
    entityType: z.literal('trading_account'),
    schemaVersion: z.literal(1),
    data: TradingAccountAuditSnapshotDataSchema,
});

export type TradingAccountAuditSnapshot = z.infer<typeof TradingAccountAuditSnapshotSchema>;

export function toTradingAccountAuditSnapshot(tradingAccount: TradingAccount): TradingAccountAuditSnapshot {
    return TradingAccountAuditSnapshotSchema.parse({
        entityType: 'trading_account',
        entityId: tradingAccount.id,
        schemaVersion: 1,
        data: {
            id: tradingAccount.id,
            user_id: tradingAccount.user_id,
            license_id: tradingAccount.license_id,
            provider_account_id: tradingAccount.provider_account_id,
            account_number: tradingAccount.account_number,
            account_label: tradingAccount.account_label,
            account_currency: tradingAccount.account_currency,
            prop_firm_id: tradingAccount.prop_firm_id,
            prop_firm_program_id: tradingAccount.prop_firm_program_id,
            prop_firm_program_stage_id: tradingAccount.prop_firm_program_stage_id,
            rule_group_id: tradingAccount.rule_group_id,
            status: tradingAccount.status,
            metadata_json: tradingAccount.metadata_json,
            createdAt: tradingAccount.createdAt.toISOString(),
            updatedAt: tradingAccount.updatedAt.toISOString(),
        },
    });
}
