import type { IDatabasePort } from '@src/shared/application/ports/database/IDatabasePort';
import type { IUnitOfWorkPort } from '@src/shared/application/ports/database/IUnitOfWorkPort';
import type { IMessengerPort } from '@src/shared/application/ports/messenger/output/IMessengerPort';
import type { ILoggerPort } from '@src/shared/application/ports/logger/ILoggerPort';
import type { IModulePort, ModuleSetupContext } from '@src/shared/application/ports/module/IModulePort';
import { PrismaDatabaseAdapter } from '@src/shared/infrastructure/database/prisma/adapters/PrismaDatabaseAdapter';
import { PrismaUnitOfWorkAdapter } from '@src/shared/infrastructure/database/prisma/adapters/PrismaUnitOfWorkAdapter';
import { Messenger } from '@src/shared/infrastructure/messaging/Messenger';
import { LOG_MESSAGES } from '@src/shared/domain/logging/entities/LogMessage';
import { Logger } from '@src/shared/infrastructure/logging/Logger';
import { env } from '@src/shared/config/env';
import type { HttpServer } from '@src/app/server';

import {
  logApplicationStartup,
  startDatabase,
  startHttpServer,
  startMessenger,
  startModules,
} from './processes/applicationStart.ts';
import {
  logShutdownComplete,
  logShutdownSignalReceived,
  stopDatabase,
  stopHttpServer,
  stopMessenger,
  stopModules,
} from './processes/applicationStop.ts';

export interface ApplicationContext extends ModuleSetupContext {
  database: IDatabasePort;
  unitOfWork: IUnitOfWorkPort;
  messenger: IMessengerPort;
  logger: ILoggerPort;
  config: typeof env;
  startedModules: IModulePort[];
  httpServer?: HttpServer;
}

type ApplicationState = 'idle' | 'starting' | 'started' | 'stopping' | 'stopped';

export class Application {
  private static _instance: Application | undefined;
  private static _exiting = false;

  private readonly appContext: ApplicationContext;
  private state: ApplicationState = 'idle';

  private constructor(context: ApplicationContext) {
    this.appContext = context;
  }

  /**
   * Get the singleton instance of the application composition root.
   */
  static getInstance(): Application {
    if (!Application._instance) {
      const database = new PrismaDatabaseAdapter();
      const unitOfWork = new PrismaUnitOfWorkAdapter(database);

      Application._instance = new Application({
        database,
        unitOfWork,
        messenger: Messenger,
        logger: Logger,
        config: env,
        startedModules: [],
      });
    }

    return Application._instance;
  }

  /**
   * Start infrastructure, modules, then HTTP. If any step fails, clean up what
   * already started and let the composition root decide the process exit code.
   */
  async start(): Promise<void> {
    if (this.state === 'started' || this.state === 'starting') return;

    this.state = 'starting';

    try {
      logApplicationStartup();
      await startDatabase(this.appContext.database);
      await startMessenger(this.appContext.messenger);
      await startModules(this.appContext);
      await startHttpServer(this.appContext);
      this.state = 'started';
    } catch (error) {
      this.appContext.logger.error(LOG_MESSAGES.APPLICATION.FATAL_STARTUP_FAILURE, {
        error: error instanceof Error ? error.message : String(error),
      });
      await this.stop();
      throw error;
    }
  }

  /**
   * Stop HTTP, modules, messenger, then database.
   */
  private async stop(): Promise<void> {
    if (this.state === 'stopping' || this.state === 'stopped') return;

    this.state = 'stopping';

    try {
      await stopHttpServer(this.appContext);
      await stopModules(this.appContext);
      await stopMessenger(this.appContext.messenger);
      await stopDatabase(this.appContext.database);
      this.state = 'stopped';
    } catch (error) {
      this.state = 'stopped';
      this.appContext.logger.error(LOG_MESSAGES.APPLICATION.FATAL_SHUTDOWN_FAILURE, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Restart the application lifecycle.
   */
  async restart(): Promise<void> {
    await this.stop();
    this.state = 'idle';
    await this.start();
  }

  /**
   * Shutdown the application and exit the process.
   */
  async shutdown(signal: string = 'SIGTERM', code: number = 0): Promise<void> {
    if (Application._exiting) return;
    Application._exiting = true;

    logShutdownSignalReceived(signal);

    let exitCode = code;
    try {
      await this.stop();
    } catch {
      if (exitCode === 0) exitCode = 1;
    } finally {
      logShutdownComplete();
      process.exit(exitCode);
    }
  }
}
