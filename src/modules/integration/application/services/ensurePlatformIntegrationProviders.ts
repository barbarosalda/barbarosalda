import type { IIntegrationProviderRepository } from '@modules/integration/application/port/repository/IIntegrationProviderRepository';
import type { IPlatformIntegrationRegistry } from '@modules/integration/application/port/platform-integration/IPlatformIntegrationRegistry';

export async function ensurePlatformIntegrationProviders(
  integrationProviderRepository: IIntegrationProviderRepository,
  platformIntegrationRegistry: IPlatformIntegrationRegistry,
): Promise<void> {
  for (const integration of platformIntegrationRegistry.list()) {
    const definition = integration.providerDefinition;
    const existing = await integrationProviderRepository.findByCode(definition.code);

    if (!existing) {
      await integrationProviderRepository.create(definition);
      continue;
    }

    if (
      existing.name !== definition.name ||
      existing.adapter_key !== definition.adapter_key ||
      existing.auth_type !== definition.auth_type ||
      existing.connection_mode !== definition.connection_mode ||
      existing.provider_type !== definition.provider_type ||
      existing.description !== definition.description ||
      existing.website_url !== definition.website_url ||
      existing.logo_url !== definition.logo_url ||
      existing.status !== definition.status
    ) {
      await integrationProviderRepository.updateById(existing.id, {
        name: definition.name,
        description: definition.description,
        provider_type: definition.provider_type,
        auth_type: definition.auth_type,
        connection_mode: definition.connection_mode,
        adapter_key: definition.adapter_key,
        website_url: definition.website_url,
        logo_url: definition.logo_url,
        status: definition.status,
      });
    }
  }
}
