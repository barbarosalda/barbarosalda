import type { IModulePort, ModuleSetupContext } from '@shared/application/ports/module/IModulePort';
import type { ModuleRoute } from '@shared/presentation/http/routes';
import { ConnectIntegrationConnectionUseCase } from '@modules/integration/application/use-cases/ConnectIntegrationConnectionUseCase';
import { DisconnectIntegrationConnectionUseCase } from '@modules/integration/application/use-cases/DisconnectIntegrationConnectionUseCase';
import { ListIntegrationProvidersUseCase } from '@modules/integration/application/use-cases/ListIntegrationProvidersUseCase';
import { ReceivePlatformIntegrationEventUseCase } from '@modules/integration/application/use-cases/ReceivePlatformIntegrationEventUseCase';
import { ensurePlatformIntegrationProviders } from '@modules/integration/application/services/ensurePlatformIntegrationProviders';
import { IntegrationConnectionPrismaRepositoryAdapter } from '@modules/integration/infrastructure/repository/IntegrationConnectionPrismaRepositoryAdapter';
import { IntegrationProviderPrismaRepositoryAdapter } from '@modules/integration/infrastructure/repository/IntegrationProviderPrismaRepositoryAdapter';
import { CTraderPlatformIntegration } from '@modules/integration/infrastructure/platforms/ctrader/CTraderPlatformIntegration';
import { PlatformIntegrationRegistry } from '@modules/integration/infrastructure/registry/PlatformIntegrationRegistry';
import { createIntegrationModuleRoutes } from '@modules/integration/presentation/http/routes';

/**
 * Integration module.
 */
export class IntegrationModule implements IModulePort {
  readonly name = 'integration';

  private ready = false;
  private moduleRoutes: ModuleRoute[] = [];
  private listIntegrationProvidersUseCase?: ListIntegrationProvidersUseCase;
  private connectIntegrationConnectionUseCase?: ConnectIntegrationConnectionUseCase;
  private disconnectIntegrationConnectionUseCase?: DisconnectIntegrationConnectionUseCase;
  private receivePlatformIntegrationEventUseCase?: ReceivePlatformIntegrationEventUseCase;

  get routes(): ModuleRoute[] {
    return [...this.moduleRoutes];
  }

  isReady(): boolean {
    return this.ready;
  }

  /**
   * Setup the integration module.
   * @param context - The module setup context.
   * @returns The result.
   */
  async setup(context: ModuleSetupContext): Promise<void> {
    if (this.ready) return;

    const integrationProviderRepository = new IntegrationProviderPrismaRepositoryAdapter(
      context.database,
    );
    const integrationConnectionRepository = new IntegrationConnectionPrismaRepositoryAdapter(
      context.database,
    );
    const platformIntegrationRegistry = new PlatformIntegrationRegistry([
      new CTraderPlatformIntegration(),
    ]);

    await ensurePlatformIntegrationProviders(
      integrationProviderRepository,
      platformIntegrationRegistry,
    );

    this.listIntegrationProvidersUseCase = new ListIntegrationProvidersUseCase(
      integrationProviderRepository,
    );
    this.connectIntegrationConnectionUseCase = new ConnectIntegrationConnectionUseCase(
      context.unitOfWork,
      context.messenger,
      integrationProviderRepository,
      integrationConnectionRepository,
      platformIntegrationRegistry,
    );
    this.disconnectIntegrationConnectionUseCase = new DisconnectIntegrationConnectionUseCase(
      context.unitOfWork,
      context.messenger,
      integrationProviderRepository,
      integrationConnectionRepository,
      platformIntegrationRegistry,
    );
    this.receivePlatformIntegrationEventUseCase = new ReceivePlatformIntegrationEventUseCase(
      context.unitOfWork,
      context.messenger,
      integrationProviderRepository,
      integrationConnectionRepository,
      platformIntegrationRegistry,
    );

    this.moduleRoutes = createIntegrationModuleRoutes({
      listIntegrationProvidersUseCase: this.listIntegrationProvidersUseCase,
      connectIntegrationConnectionUseCase: this.connectIntegrationConnectionUseCase,
      disconnectIntegrationConnectionUseCase: this.disconnectIntegrationConnectionUseCase,
      receivePlatformIntegrationEventUseCase: this.receivePlatformIntegrationEventUseCase,
    });

    this.ready = true;
  }

  /**
   * Shutdown the integration module.
   * @returns The result.
   */
  async shutdown(): Promise<void> {
    this.moduleRoutes = [];
    this.listIntegrationProvidersUseCase = undefined;
    this.connectIntegrationConnectionUseCase = undefined;
    this.disconnectIntegrationConnectionUseCase = undefined;
    this.receivePlatformIntegrationEventUseCase = undefined;
    this.ready = false;
  }
}
