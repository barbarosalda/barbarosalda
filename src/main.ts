import { LOG_MESSAGES } from './shared/domain/logging/entities/LogMessage.ts';
import { Logger } from './shared/infrastructure/logging/Logger.ts';
import { Application } from './app/Application.ts';

/**
 * Composition root.
 *
 * Boot order:
 *   1. Validate env (already enforced by `./shared/config/env.ts` on import).
 *   2. Start database.
 *   3. Start messenger.
 *   4. Run each module's `setup()`.
 *   5. Build and start the Express server.
 *   6. Install SIGINT/SIGTERM handlers that close the server, shut down each
 *      module in reverse order, stop the messenger, then stop database.
 */
async function main(): Promise<void> {
  const application = Application.getInstance();
  
  // Register SIGINT/SIGTERM handlers
  process.on('SIGINT', () => void application.shutdown('SIGINT'));
  process.on('SIGTERM', () => void application.shutdown('SIGTERM'));
  
  // Register unhandled rejection handler
  process.on('unhandledRejection', (reason) => {
    Logger.error(LOG_MESSAGES.PROCESS.UNHANDLED_REJECTION, {
      reason: reason instanceof Error ? reason.message : String(reason),
    });
    void application.shutdown('unhandledRejection', 1);
  });

  // Register uncaught exception handler
  process.on('uncaughtException', (err) => {
    Logger.error(LOG_MESSAGES.PROCESS.UNCAUGHT_EXCEPTION, { error: err.message });
    void application.shutdown('uncaughtException', 1);
  });

  await application.start();
  
}

main().catch((err) => {
  Logger.error(LOG_MESSAGES.APPLICATION.FATAL_STARTUP_FAILURE, {
    error: err instanceof Error ? err.message : String(err),
  });
  process.exit(1);
});
