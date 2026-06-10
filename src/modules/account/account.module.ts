import type { IModulePort, ModuleSetupContext } from '@shared/application/ports/module/IModulePort';
import type { ModuleRoute } from '@shared/presentation/http/routes';

import { createAccountModuleRoutes } from '@src/modules/account/presentation/http/routes';
import { GetPropFirmDetailsUseCase } from '@src/modules/account/application/use-cases/GetPropFirmDetailsUseCase';
import { GetPropFirmsUseCase } from '@src/modules/account/application/use-cases/GetPropFirmsUseCase';
import { GetTradingAccountsUseCase } from '@src/modules/account/application/use-cases/GetTradingAccountsUseCase';
import { PropFirmPrismaRepositoryAdapter } from '@src/modules/account/infrastructure/repository/PropFirmPrismaRepositoryAdapter';
import { TradingAccountPrismaRepositoryAdapter } from '@src/modules/account/infrastructure/repository/TradingAccountPrismaRepositoryAdapter';

/**
 * Account module.
 */
export class AccountModule implements IModulePort {
  readonly name = 'account';

  private ready = false;
  private moduleRoutes: ModuleRoute[] = [];
  private getPropFirmsUseCase?: GetPropFirmsUseCase;
  private getPropFirmDetailsUseCase?: GetPropFirmDetailsUseCase;
  private getTradingAccountsUseCase?: GetTradingAccountsUseCase;

  get routes(): ModuleRoute[] {
    return [...this.moduleRoutes];
  }

  isReady(): boolean {
    return this.ready;
  }

  /**
   * Setup the account module.
   * @param context - The module setup context.
   * @returns The result.
   */
  async setup(context: ModuleSetupContext): Promise<void> {
    if (this.ready) return;

    const propFirmRepository = new PropFirmPrismaRepositoryAdapter(
      context.database,
    );

    const tradingAccountRepository = new TradingAccountPrismaRepositoryAdapter(
      context.database,
    );

    this.getPropFirmsUseCase = new GetPropFirmsUseCase(
      propFirmRepository,
    );
    this.getPropFirmDetailsUseCase = new GetPropFirmDetailsUseCase(
      propFirmRepository,
    );
    this.getTradingAccountsUseCase = new GetTradingAccountsUseCase(
      tradingAccountRepository,
    );

    this.moduleRoutes = createAccountModuleRoutes({
      getPropFirmsUseCase: this.getPropFirmsUseCase,
      getPropFirmDetailsUseCase: this.getPropFirmDetailsUseCase,
      getTradingAccountsUseCase: this.getTradingAccountsUseCase,
    });

    this.ready = true;
  }

  /**
   * Shutdown the account module.
   * @returns The result.
   */
  async shutdown(): Promise<void> {
    this.moduleRoutes = [];
    this.getPropFirmsUseCase = undefined;
    this.getPropFirmDetailsUseCase = undefined;
    this.getTradingAccountsUseCase = undefined;
    this.ready = false;
  }
}
