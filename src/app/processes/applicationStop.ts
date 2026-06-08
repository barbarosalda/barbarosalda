import { IDatabasePort } from '@src/shared/application/ports/database/IDatabasePort';
import { IMessengerPort } from '@src/shared/application/ports/messenger/output/IMessengerPort';
import { LOG_MESSAGES } from '@src/shared/domain/logging/entities/LogMessage';
import { Logger } from '@src/shared/infrastructure/logging/Logger';
import { ApplicationContext } from '../Application.ts';
import { shutdownStartedModules } from '../modules.ts';

/**
 * Stop the database.
 */
export async function stopDatabase(database: IDatabasePort): Promise<void> {
  try {
    await database.stop();
  } catch (err) {
    Logger.error(LOG_MESSAGES.DATABASE.DISCONNECT_FAILED, {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

/**
 * Stop the messenger.
 */
export async function stopMessenger(messenger: IMessengerPort): Promise<void> {
  try {
    await messenger.stop();
  } catch (err) {
    Logger.error(LOG_MESSAGES.MESSENGER.STOP_FAILED, {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

/**
 * Stop only modules that completed setup, in reverse boot order.
 */
export async function stopModules(appContext: ApplicationContext): Promise<void> {
  await shutdownStartedModules(appContext);
}

/**
 * Stop the HTTP server.
 */
export async function stopHttpServer(appContext: ApplicationContext): Promise<void> {
  const httpServer = appContext.httpServer;
  if (!httpServer) return;

  try {
    await httpServer.stop();
    appContext.httpServer = undefined;
  } catch (err) {
    Logger.error(LOG_MESSAGES.APPLICATION.HTTP_SERVER_STOP_FAILED, {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

/**
 * Log that a shutdown signal has been received, at the start of teardown.
 */
export function logShutdownSignalReceived(signal: string): void {
  Logger.info(LOG_MESSAGES.APPLICATION.SHUTDOWN_SIGNAL_RECEIVED, { signal });
}

/**
 * Log that the application has finished tearing down, just before exit.
 */
export function logShutdownComplete(): void {
  Logger.info(LOG_MESSAGES.APPLICATION.SHUTDOWN_COMPLETE);
}
