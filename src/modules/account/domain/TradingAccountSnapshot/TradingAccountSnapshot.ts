import { z } from 'zod';

import { AuditSnapshotSchema } from '@src/shared/domain/Audit/AuditSnapshot';
import { SnapshotType } from '@src/modules/account/domain/TradingAccountSnapshot/SnapshotType';


export const TradingAccountSnapshotSchema = z.object({
    id: z.string().min(1),
    trading_account_id: z.string().min(1),
    balance: z.number().nullable(),
    equity: z.number().nullable(),
    margin_used: z.number().nullable(),
    free_margin: z.number().nullable(),
    unrealized_pnl: z.number().nullable(),
    realized_pnl: z.number().nullable(),
    snapshot_type: z.nativeEnum(SnapshotType),
    provider_timestamp: z.date().nullable(),
    recorded_at: z.date(),
    createdAt: z.date(),
});

export type TradingAccountSnapshot = z.infer<typeof TradingAccountSnapshotSchema>;

export const CreateTradingAccountSnapshotSchema = z.object({
    trading_account_id: z.string().min(1),
    balance: z.number().nullable().optional(),
    equity: z.number().nullable().optional(),
    margin_used: z.number().nullable().optional(),
    free_margin: z.number().nullable().optional(),
    unrealized_pnl: z.number().nullable().optional(),
    realized_pnl: z.number().nullable().optional(),
    snapshot_type: z.nativeEnum(SnapshotType).optional(),
    provider_timestamp: z.date().nullable().optional(),
    recorded_at: z.date().optional(),
});

export type CreateTradingAccountSnapshotInput = z.infer<typeof CreateTradingAccountSnapshotSchema>;

export const UpdateTradingAccountSnapshotSchema = z.object({
    trading_account_id: z.string().min(1).optional(),
    balance: z.number().nullable().optional(),
    equity: z.number().nullable().optional(),
    margin_used: z.number().nullable().optional(),
    free_margin: z.number().nullable().optional(),
    unrealized_pnl: z.number().nullable().optional(),
    realized_pnl: z.number().nullable().optional(),
    snapshot_type: z.nativeEnum(SnapshotType).optional(),
    provider_timestamp: z.date().nullable().optional(),
    recorded_at: z.date().optional(),
});

export type UpdateTradingAccountSnapshotInput = z.infer<typeof UpdateTradingAccountSnapshotSchema>;

export const TradingAccountSnapshotAuditActions = {
    TradingAccountSnapshotCreated: 'TRADING_ACCOUNT_SNAPSHOT_CREATED',
    TradingAccountSnapshotUpdated: 'TRADING_ACCOUNT_SNAPSHOT_UPDATED',
} as const;

export const TradingAccountSnapshotAuditSnapshotDataSchema = z.object({
    id: z.string().min(1),
    trading_account_id: z.string().min(1),
    balance: z.number().nullable(),
    equity: z.number().nullable(),
    margin_used: z.number().nullable(),
    free_margin: z.number().nullable(),
    unrealized_pnl: z.number().nullable(),
    realized_pnl: z.number().nullable(),
    snapshot_type: z.nativeEnum(SnapshotType),
    provider_timestamp: z.string().datetime().nullable(),
    recorded_at: z.string().datetime(),
    createdAt: z.string().datetime(),
});

export const TradingAccountSnapshotAuditSnapshotSchema = AuditSnapshotSchema.extend({
    entityType: z.literal('trading_account_snapshot'),
    schemaVersion: z.literal(1),
    data: TradingAccountSnapshotAuditSnapshotDataSchema,
});

export type TradingAccountSnapshotAuditSnapshot = z.infer<typeof TradingAccountSnapshotAuditSnapshotSchema>;

export function toTradingAccountSnapshotAuditSnapshot(
    tradingAccountSnapshot: TradingAccountSnapshot,
): TradingAccountSnapshotAuditSnapshot {
    return TradingAccountSnapshotAuditSnapshotSchema.parse({
        entityType: 'trading_account_snapshot',
        entityId: tradingAccountSnapshot.id,
        schemaVersion: 1,
        data: {
            id: tradingAccountSnapshot.id,
            trading_account_id: tradingAccountSnapshot.trading_account_id,
            balance: tradingAccountSnapshot.balance,
            equity: tradingAccountSnapshot.equity,
            margin_used: tradingAccountSnapshot.margin_used,
            free_margin: tradingAccountSnapshot.free_margin,
            unrealized_pnl: tradingAccountSnapshot.unrealized_pnl,
            realized_pnl: tradingAccountSnapshot.realized_pnl,
            snapshot_type: tradingAccountSnapshot.snapshot_type,
            provider_timestamp: tradingAccountSnapshot.provider_timestamp?.toISOString() ?? null,
            recorded_at: tradingAccountSnapshot.recorded_at.toISOString(),
            createdAt: tradingAccountSnapshot.createdAt.toISOString(),
        },
    });
}
