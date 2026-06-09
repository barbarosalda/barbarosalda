import type { ModuleRoute } from '@shared/presentation/http/routes';

const moduleRoutes: ModuleRoute[] = [];

export function registerModuleRoute(route: ModuleRoute): void {
  const existingIndex = moduleRoutes.findIndex((registeredRoute) => registeredRoute.path === route.path);

  if (existingIndex >= 0) {
    moduleRoutes[existingIndex] = route;
    return;
  }

  moduleRoutes.push(route);
}

export function listModuleRoutes(): ModuleRoute[] {
  return [...moduleRoutes];
}

export function resetModuleRoutes(): void {
  moduleRoutes.length = 0;
}
