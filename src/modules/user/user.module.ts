import type { IModulePort, ModuleSetupContext } from '@shared/application/ports/module/IModulePort';
import type { ModuleRoute } from '@shared/presentation/http/routes';
import { PrismaDatabaseAdapter } from '@shared/infrastructure/database/prisma/adapters/PrismaDatabaseAdapter';
import { registerModuleRoute } from '@shared/presentation/http/moduleRouteRegistry';
import { CreateUserWithPreferencesUseCase } from './application/use-cases/CreateUserWithPreferencesUseCase.ts';
import { ResolveAuthenticatedUserUseCase } from './application/use-cases/ResolveAuthenticatedUserUseCase.ts';
import { createUserModuleRoute } from './presentation/http/routes.ts';
import { AuthProvider } from './infrastructure/auth/AuthProvider.ts';
import { PrismaUserPreferenceRepositoryAdapter } from './infrastructure/persistence/prisma/repository/PrismaUserPreferenceRepositoryAdapter.ts';
import { PrismaUserRepositoryAdapter } from './infrastructure/persistence/prisma/repository/PrismaUserRepositoryAdapter.ts';

export class UserModule implements IModulePort {
  readonly name = 'user';

  private ready = false;
  private moduleRoutes: ModuleRoute[] = [];
  private createUserWithPreferencesUseCase?: CreateUserWithPreferencesUseCase;
  private resolveAuthenticatedUserUseCase?: ResolveAuthenticatedUserUseCase;

  get routes(): ModuleRoute[] {
    return [...this.moduleRoutes];
  }

  isReady(): boolean {
    return this.ready;
  }

  async setup(context: ModuleSetupContext): Promise<void> {
    if (this.ready) return;

    if (!(context.database instanceof PrismaDatabaseAdapter)) {
      throw new Error('UserModule setup requires PrismaDatabaseAdapter.');
    }

    const userRepository = new PrismaUserRepositoryAdapter(context.database);
    const userPreferenceRepository = new PrismaUserPreferenceRepositoryAdapter(context.database);
    const authProvider = new AuthProvider(context.config);

    this.createUserWithPreferencesUseCase = new CreateUserWithPreferencesUseCase(
      context.unitOfWork,
      userRepository,
      userPreferenceRepository,
    );

    this.resolveAuthenticatedUserUseCase = new ResolveAuthenticatedUserUseCase(
      context.unitOfWork,
      userRepository,
      userPreferenceRepository,
    );

    const userRoute = createUserModuleRoute({
      createUserWithPreferencesUseCase: this.createUserWithPreferencesUseCase,
      resolveAuthenticatedUserUseCase: this.resolveAuthenticatedUserUseCase,
      authProvider,
    });

    this.moduleRoutes = [userRoute];
    registerModuleRoute(userRoute);
    this.ready = true;
  }

  async shutdown(): Promise<void> {
    this.moduleRoutes = [];
    this.createUserWithPreferencesUseCase = undefined;
    this.resolveAuthenticatedUserUseCase = undefined;
    this.ready = false;
  }
}
