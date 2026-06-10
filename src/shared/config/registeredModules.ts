import type { IModulePort } from '@shared/application/ports/module/IModulePort';
import { UserModule } from '@modules/user/user.module';
import { IntegrationModule } from '@modules/integration/integration.module';

/**
 * Compile-time list of application modules that participate in the boot lifecycle.
 *
 * Keep this boring and explicit. A module becomes part of the server only when it is
 * added here, which makes boot order visible and avoids side-effect registration.
 */
export const registeredModules: IModulePort[] = [
  new UserModule(),
  new IntegrationModule(),
];

export function getReadyRegisteredModules(): IModulePort[] {
  return registeredModules.filter((module) => module.isReady());
}

export function getRegisteredModuleRoutes(): IModulePort['routes'] {
  return getReadyRegisteredModules().flatMap((module) => module.routes);
}
