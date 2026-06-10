import type { IPlatformIntegration } from '@modules/integration/application/port/platform-integration/IPlatformIntegration';

export interface IPlatformIntegrationRegistry {
  get(adapterKey: string): IPlatformIntegration;
  list(): IPlatformIntegration[];
}
