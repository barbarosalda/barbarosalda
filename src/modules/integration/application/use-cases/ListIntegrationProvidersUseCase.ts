import type { IIntegrationProviderRepository } from '@modules/integration/application/port/repository/IIntegrationProviderRepository';
import { ListIntegrationProvidersResult } from '@src/modules/integration/application/contracts/ListIntegrationProvidersContract';

/**
 * Use case for listing integration providers.
 * @param deps - The dependencies.
 * @returns The use case.
 */
export class ListIntegrationProvidersUseCase {
  constructor(private readonly integrationProviderRepository: IIntegrationProviderRepository) {}

  /**
   * Execute the use case.
   * @returns The result.
   */
  async execute(): Promise<ListIntegrationProvidersResult> {
    const providers = await this.integrationProviderRepository.getAll();

    return ListIntegrationProvidersResult.parse({ providers });
  }
}
