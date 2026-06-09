import type { Express, Router } from 'express';
import { healthHandler, readyHandler } from '@shared/presentation/http/controller';
import { requireAuthenticatedUser } from '@shared/presentation/http/middleware/requireAuthenticatedUser';
import type { IAuthProviderPort } from '@src/shared/application/ports/auth/IAuthProviderPort';

interface AppReadinessChecks {
  isReady(): Promise<boolean>;
}

export type ModuleRouteAccess = 'public' | 'protected';

export interface ModuleRoute {
  path: string;
  router: Router;
  access: ModuleRouteAccess;
}

interface RegisterRoutesOptions {
  readinessChecks?: AppReadinessChecks;
  moduleRoutes?: ModuleRoute[];
}

/**
 * Registers shared HTTP routes and module route mounts.
 *
 * Registers global health/readiness endpoints and mounted module routes.
 */
export function registerRoutes(
  app: Express,
  options: RegisterRoutesOptions = {},
  authProvider: IAuthProviderPort,
): void {
  app.get('/health', healthHandler());
  app.get('/ready', readyHandler(options.readinessChecks));

  for (const route of options.moduleRoutes ?? []) {
    if (route.access === 'protected') {
      app.use(
        route.path,
        requireAuthenticatedUser({ authProvider }),
        route.router,
      );

      continue;
    }

    app.use(route.path, route.router);
  }
}
