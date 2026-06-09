import cors from 'cors';
import express, { type Express } from 'express';
import morgan from 'morgan';

import type { IAuthProviderPort } from '@shared/application/ports/auth/IAuthProviderPort';
import { env } from '@shared/config/env';
import { AuthProvider } from '@shared/infrastructure/auth/AuthProvider';
import { Logger } from '@shared/infrastructure/logging/Logger';
import { requestContextMiddleware } from '@shared/presentation/http/context/requestContext';
import { errorHandlerMiddleware } from '@shared/presentation/http/middleware/errorHandler';
import { notFoundMiddleware } from '@shared/presentation/http/middleware/notFound';
import { listModuleRoutes, resetModuleRoutes } from '@shared/presentation/http/moduleRouteRegistry';
import { type ModuleRoute, registerRoutes } from '@shared/presentation/http/routes';

interface CreateHttpAppOptions {
  authProvider?: IAuthProviderPort;
  moduleRoutes?: ModuleRoute[];
  readinessChecks?: {
    isReady(): Promise<boolean>;
  };
}

/**
 * Test-friendly Express app factory.
 *
 * The production lifecycle uses `src/app/server.ts`; this helper keeps HTTP
 * composition reusable for integration tests without opening a TCP port.
 */
export function createHttpApp(options: CreateHttpAppOptions = {}): Express {
  const app = express();
  const authProvider = options.authProvider ?? new AuthProvider(env);

  app.disable('x-powered-by');

  const allowedOrigins = env.CORS_ORIGINS;
  app.use(
    cors({
      origin: allowedOrigins.length === 0 ? '*' : allowedOrigins,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: allowedOrigins.length > 0,
    }),
  );

  app.use(requestContextMiddleware);
  app.use(express.json({ limit: '1mb' }));

  if (env.LOG_LEVEL === 'debug' || env.LOG_LEVEL === 'trace') {
    app.use(
      morgan('combined', {
        stream: { write: (line: string) => Logger.debug(line.trim()) },
      }),
    );
  }

  registerRoutes(
    app,
    {
      readinessChecks: options.readinessChecks,
      moduleRoutes: options.moduleRoutes ?? listModuleRoutes(),
    },
    authProvider,
  );

  app.use(notFoundMiddleware);
  app.use(errorHandlerMiddleware);

  return app;
}

export { listModuleRoutes, resetModuleRoutes };
