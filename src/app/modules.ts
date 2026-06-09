import type { ApplicationContext } from '@bootstrap/Application';
import type { IModulePort } from '@shared/application/ports/module/IModulePort';
import { registeredModules } from '@shared/config/registeredModules';
import { LOG_MESSAGES } from '@src/shared/domain/Logging/entities/LogMessage';

export async function setupRegisteredModules(appContext: ApplicationContext): Promise<void> {
  for (const module of registeredModules) {
    appContext.logger.info(LOG_MESSAGES.APPLICATION.MODULE_SETUP, { module: module.name });

    try {
      await module.setup(appContext);
      appContext.startedModules.push(module);
    } catch (err) {
      appContext.logger.error(LOG_MESSAGES.APPLICATION.MODULE_SETUP_FAILED, {
        module: module.name,
        error: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  }
}

export async function shutdownStartedModules(appContext: ApplicationContext): Promise<void> {
  const modulesToShutdown: IModulePort[] = [...appContext.startedModules].reverse();
  appContext.startedModules = [];

  for (const module of modulesToShutdown) {
    appContext.logger.info(LOG_MESSAGES.APPLICATION.MODULE_SHUTDOWN, { module: module.name });

    try {
      await module.shutdown();
    } catch (err) {
      appContext.logger.error(LOG_MESSAGES.APPLICATION.MODULE_SHUTDOWN_FAILED, {
        module: module.name,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
}
