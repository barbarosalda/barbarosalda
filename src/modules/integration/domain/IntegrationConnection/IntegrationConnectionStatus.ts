export const IntegrationConnectionStatus = {
    PENDING: 'PENDING',
    ACTIVE: 'ACTIVE',
    EXPIRED: 'EXPIRED',
    REVOKED: 'REVOKED',
    ERROR: 'ERROR',
    DISCONNECTED: 'DISCONNECTED',
} as const;

export type IntegrationConnectionStatus = (
    typeof IntegrationConnectionStatus
)[keyof typeof IntegrationConnectionStatus];

export const DEFAULT_INTEGRATION_CONNECTION_STATUS = IntegrationConnectionStatus.PENDING;
