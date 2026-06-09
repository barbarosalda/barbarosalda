export const IntegrationProviderType = {
    TRADING_PLATFORM: 'TRADING_PLATFORM',
    MARKET_DATA_PROVIDER: 'MARKET_DATA_PROVIDER',
    NEWS_PROVIDER: 'NEWS_PROVIDER',
    NOTIFICATION_PROVIDER: 'NOTIFICATION_PROVIDER',
    OTHER: 'OTHER',
} as const;

export type IntegrationProviderType = (
    typeof IntegrationProviderType
)[keyof typeof IntegrationProviderType];

export const DEFAULT_INTEGRATION_PROVIDER_TYPE = IntegrationProviderType.OTHER;
