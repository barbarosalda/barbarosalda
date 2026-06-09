import type { IModulePort, ModuleSetupContext } from '@shared/application/ports/module/IModulePort';
import type { ModuleRoute } from '@shared/presentation/http/routes';
import { PrismaUserPreferenceRepositoryAdapter } from '@modules/user/infrastructure/persistence/prisma/repository/PrismaUserPreferenceRepositoryAdapter';
import { ResolveAuthenticatedUserUseCase } from '@modules/user/application/use-cases/ResolveAuthenticatedUserUseCase';
import { UpdateAuthenticatedUserPreferencesUseCase } from '@modules/user/application/use-cases/UpdateAuthenticatedUserPreferencesUseCase';
import { createUserModuleRoutes } from '@modules/user/presentation/http/routes';

export class UserModule implements IModulePort {
  readonly name = 'user';

  private ready = false;
  private moduleRoutes: ModuleRoute[] = [];
  private resolveAuthenticatedUserUseCase?: ResolveAuthenticatedUserUseCase;
  private updateAuthenticatedUserPreferencesUseCase?: UpdateAuthenticatedUserPreferencesUseCase;

  get routes(): ModuleRoute[] {
    return [...this.moduleRoutes];
  }

  isReady(): boolean {
    return this.ready;
  }

  async setup(context: ModuleSetupContext): Promise<void> {
    if (this.ready) return;

    const userPreferenceRepository = new PrismaUserPreferenceRepositoryAdapter(context.database);

    this.resolveAuthenticatedUserUseCase = new ResolveAuthenticatedUserUseCase(
      context.unitOfWork,
      userPreferenceRepository,
    );

    this.updateAuthenticatedUserPreferencesUseCase = new UpdateAuthenticatedUserPreferencesUseCase(
      context.unitOfWork,
      userPreferenceRepository,
    );

    const userRoutes = createUserModuleRoutes({
      resolveAuthenticatedUserUseCase: this.resolveAuthenticatedUserUseCase,
      updateAuthenticatedUserPreferencesUseCase: this.updateAuthenticatedUserPreferencesUseCase,
    });

    this.moduleRoutes = userRoutes;
    this.ready = true;
  }

  async shutdown(): Promise<void> {
    this.moduleRoutes = [];
    this.resolveAuthenticatedUserUseCase = undefined;
    this.updateAuthenticatedUserPreferencesUseCase = undefined;
    this.ready = false;
  }
}
