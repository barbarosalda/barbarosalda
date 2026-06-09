export const IntegrationConnectionMode = {
    REST: 'REST',
    WEBSOCKET: 'WEBSOCKET',
    HYBRID: 'HYBRID',
    MANUAL: 'MANUAL',
    INTERNAL: 'INTERNAL',
} as const;

export type IntegrationConnectionMode = (
    typeof IntegrationConnectionMode
)[keyof typeof IntegrationConnectionMode];
