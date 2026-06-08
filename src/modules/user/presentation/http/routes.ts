import { Router } from 'express';

import type { CreateUserWithPreferencesUseCase } from '../../application/use-cases/CreateUserWithPreferencesUseCase.ts';
import type { ResolveAuthenticatedUserUseCase } from '../../application/use-cases/ResolveAuthenticatedUserUseCase.ts';
import type { IAuthProviderPort } from '../../application/ports/IAuthProviderPort.ts';
import type { ModuleRoute } from '@shared/presentation/http/routes';
import { createUserWithPreferencesHttpHandler } from './handlers/createUserWithPreferencesHttpHandler.ts';
import { resolveAuthenticatedUserHttpHandler } from './handlers/resolveAuthenticatedUserHttpHandler.ts';
import { userHttpErrorHandler } from './errors/userHttpErrors.ts';

export function createUserModuleRoute(deps: {
  createUserWithPreferencesUseCase: CreateUserWithPreferencesUseCase;
  resolveAuthenticatedUserUseCase: ResolveAuthenticatedUserUseCase;
  authProvider: IAuthProviderPort;
}): ModuleRoute {
  const router = Router();

  router.get(
    '/me',
    resolveAuthenticatedUserHttpHandler({
      authProvider: deps.authProvider,
      resolveAuthenticatedUserUseCase: deps.resolveAuthenticatedUserUseCase,
    }),
  );
  router.post('/', createUserWithPreferencesHttpHandler(deps));
  router.use(userHttpErrorHandler);

  return {
    path: '/users',
    router,
  };
}
