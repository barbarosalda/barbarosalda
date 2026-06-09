export const TradingAccountStatus = {
    ACTIVE: 'ACTIVE',
    DISCONNECTED: 'DISCONNECTED',
    LOCKED: 'LOCKED',
    BREACHED: 'BREACHED',
    ARCHIVED: 'ARCHIVED',
} as const;

export type TradingAccountStatus = (typeof TradingAccountStatus)[keyof typeof TradingAccountStatus];

export const DEFAULT_TRADING_ACCOUNT_STATUS = TradingAccountStatus.ACTIVE;
