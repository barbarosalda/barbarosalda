import { IDatabasePort } from '@src/shared/application/ports/database/IDatabasePort';
import { IMessengerPort } from '@src/shared/application/ports/messenger/output/IMessengerPort';
import { env } from '@src/shared/config/env';
import { LOG_MESSAGES } from '@src/shared/domain/logging/entities/LogMessage';
import { Logger } from '@src/shared/infrastructure/logging/Logger';
import { ApplicationContext } from '../Application.ts';
import { HttpServer } from '@src/app/server';
import { setupRegisteredModules } from '../modules.ts';

/**
 * Log the startup of the application.
 */
export function logApplicationStartup(): void {
  Logger.info(LOG_MESSAGES.APPLICATION.STARTING, {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    messenger: env.MESSENGER ?? 'node',
    logger: env.LOGGER,
  });
}

/**
 * Start the database and fail boot if the database cannot become ready.
 */
export async function startDatabase(database: IDatabasePort): Promise<void> {
  try {
    await database.start();
  } catch (err) {
    Logger.error(LOG_MESSAGES.DATABASE.START_FAILED, {
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

/**
 * Start the messenger and fail boot if the transport cannot become ready.
 */
export async function startMessenger(messenger: IMessengerPort): Promise<void> {
  try {
    await messenger.start();
  } catch (err) {
    Logger.error(LOG_MESSAGES.MESSENGER.START_FAILED, {
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

/**
 * Start all registered modules in the configured order.
 */
export async function startModules(appContext: ApplicationContext): Promise<void> {
  await setupRegisteredModules(appContext);
}

/**
 * Start the HTTP server after infrastructure and modules are ready.
 */
export async function startHttpServer(appContext: ApplicationContext): Promise<void> {
  try {
    const httpServer = new HttpServer(appContext);
    await httpServer.start(appContext.config.PORT);
    appContext.httpServer = httpServer;
  } catch (err) {
    Logger.error(LOG_MESSAGES.APPLICATION.HTTP_SERVER_START_FAILED, {
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}
