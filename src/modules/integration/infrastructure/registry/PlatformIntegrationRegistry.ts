import type { IPlatformIntegration } from '@modules/integration/application/port/platform-integration/IPlatformIntegration';
import type { IPlatformIntegrationRegistry } from '@modules/integration/application/port/platform-integration/IPlatformIntegrationRegistry';

/**
 * Registry for platform integrations.
 */
export class PlatformIntegrationRegistry implements IPlatformIntegrationRegistry {
  private readonly integrationsByAdapterKey = new Map<string, IPlatformIntegration>();

  /**
   * Constructor for the platform integration registry.
   * @param integrations - The integrations to register.
   */
  constructor(integrations: IPlatformIntegration[]) {
    for (const integration of integrations) {
      if (this.integrationsByAdapterKey.has(integration.adapterKey)) {
        throw new Error(`Duplicate platform integration adapter: ${integration.adapterKey}`);
      }

      this.integrationsByAdapterKey.set(integration.adapterKey, integration);
    }
  }

  /**
   * Get a platform integration by its adapter key.
   * @param adapterKey - The adapter key of the platform integration.
   * @returns The platform integration.
   */
  get(adapterKey: string): IPlatformIntegration {
    const integration = this.integrationsByAdapterKey.get(adapterKey);

    if (!integration) {
      throw new Error(`Platform integration adapter not registered: ${adapterKey}`);
    }

    return integration;
  }

  /**
   * List all platform integrations.
   * @returns The list of platform integrations.
   */
  list(): IPlatformIntegration[] {
    return [...this.integrationsByAdapterKey.values()];
  }
}
