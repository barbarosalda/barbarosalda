import type { Express, Router } from 'express';
import { healthHandler, readyHandler } from './controller.ts';

interface AppReadinessChecks {
  isReady(): Promise<boolean>;
}

export interface ModuleRoute {
  path: string;
  router: Router;
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
export function registerRoutes(app: Express, options: RegisterRoutesOptions = {}): void {
  app.get('/health', healthHandler());
  app.get('/ready', readyHandler(options.readinessChecks));

  for (const route of options.moduleRoutes ?? []) {
    app.use(route.path, route.router);
  }
}
