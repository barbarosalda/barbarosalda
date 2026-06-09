export const IntegrationAuthType = {
    OAUTH: 'OAUTH',
    API_KEY: 'API_KEY',
    USERNAME_PASSWORD: 'USERNAME_PASSWORD',
    NONE: 'NONE',
    SYSTEM_MANAGED: 'SYSTEM_MANAGED',
} as const;

export type IntegrationAuthType = (
    typeof IntegrationAuthType
)[keyof typeof IntegrationAuthType];
