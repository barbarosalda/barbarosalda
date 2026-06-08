import type { Server } from 'node:http';

import cors from 'cors';
import express, { type Express } from 'express';
import morgan from 'morgan';

import type { ApplicationContext } from '@src/app/Application';
import { getRegisteredModuleRoutes, registeredModules } from '@src/shared/config/registeredModules';
import { LOG_MESSAGES } from '@src/shared/domain/logging/entities/LogMessage';
import { Logger } from '@src/shared/infrastructure/logging/Logger';
import { requestContextMiddleware } from '@src/shared/presentation/http/context/requestContext';
import { errorHandlerMiddleware } from '@src/shared/presentation/http/middleware/errorHandler';
import { notFoundMiddleware } from '@src/shared/presentation/http/middleware/notFound';
import { registerRoutes } from '@src/shared/presentation/http/routes';

/**
 * HTTP server lifecycle wrapper.
 *
 * The Express app is built only after infrastructure and modules have booted,
 * so module routes are registered exactly once and after all dependencies are
 * available.
 */
export class HttpServer {
  public readonly app: Express;
  private server: Server | null = null;

  constructor(private readonly applicationContext: ApplicationContext) {
    this.app = express();
    this.configureBaseMiddleware(this.app);
    this.registerRoutes(this.app);
    this.registerFallbackMiddleware(this.app);
  }

  private configureBaseMiddleware(app: Express): void {
    app.disable('x-powered-by');
    app.use(requestContextMiddleware);

    const allowedOrigins = this.applicationContext.config.CORS_ORIGINS;
    app.use(
      cors({
        origin: allowedOrigins.length === 0 ? '*' : allowedOrigins,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: allowedOrigins.length > 0,
      }),
    );

    app.use(express.json({ limit: '1mb' }));

    if (this.applicationContext.config.LOG_LEVEL === 'debug' || this.applicationContext.config.LOG_LEVEL === 'trace') {
      app.use(
        morgan('combined', {
          stream: { write: (line: string) => Logger.debug(line.trim()) },
        }),
      );
    }
  }

  private registerRoutes(app: Express): void {
    registerRoutes(app, {
      readinessChecks: {
        isReady: async () =>
          this.applicationContext.database.isReady() &&
          this.applicationContext.messenger.isReady() &&
          registeredModules.every((module) => module.isReady()),
      },
      moduleRoutes: getRegisteredModuleRoutes(),
    });
  }

  private registerFallbackMiddleware(app: Express): void {
    app.use(notFoundMiddleware);
    app.use(errorHandlerMiddleware);
  }

  /**
   * Start listening on the given port.
   */
  async start(port: number): Promise<void> {
    if (this.server) {
      throw new Error('HttpServer has already been started');
    }

    await new Promise<void>((resolve, reject) => {
      const server = this.app.listen(port, () => {
        Logger.info(LOG_MESSAGES.APPLICATION.HTTP_SERVER_LISTENING, { port });
        this.server = server;
        resolve();
      });

      server.once('error', (err: Error) => {
        this.server = null;
        reject(err);
      });
    });
  }

  /**
   * Gracefully stop the HTTP server.
   */
  async stop(): Promise<void> {
    const server = this.server;
    if (!server) return;

    await new Promise<void>((resolve, reject) => {
      server.close((err?: Error) => (err ? reject(err) : resolve()));
    });

    this.server = null;
  }
}
