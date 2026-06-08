import { Router } from 'express';

import type { ResolveAuthenticatedUserUseCase } from '../../application/use-cases/ResolveAuthenticatedUserUseCase.ts';
import type { UpdateAuthenticatedUserPreferencesUseCase } from '../../application/use-cases/UpdateAuthenticatedUserPreferencesUseCase.ts';
import type { IAuthProviderPort } from '../../application/ports/IAuthProviderPort.ts';
import type { ModuleRoute } from '@shared/presentation/http/routes';
import { asyncHandler } from '@shared/presentation/http/utils/asyncHandler';
import { localUserCreationRemovedHttpHandler } from './handlers/localUserCreationRemovedHttpHandler.ts';
import { resolveAuthenticatedUserHttpHandler } from './handlers/resolveAuthenticatedUserHttpHandler.ts';
import { updateAuthenticatedUserPreferencesHttpHandler } from './handlers/updateAuthenticatedUserPreferencesHttpHandler.ts';
import { userHttpErrorHandler } from './errors/userHttpErrors.ts';
import { requireAuthenticatedUser } from './middleware/requireAuthenticatedUser.ts';

export function createUserModuleRoute(deps: {
  resolveAuthenticatedUserUseCase: ResolveAuthenticatedUserUseCase;
  updateAuthenticatedUserPreferencesUseCase: UpdateAuthenticatedUserPreferencesUseCase;
  authProvider: IAuthProviderPort;
}): ModuleRoute {
  const router = Router();
  const requireAuth = requireAuthenticatedUser({ authProvider: deps.authProvider });

  router.get(
    '/me',
    requireAuth,
    asyncHandler(resolveAuthenticatedUserHttpHandler(deps)),
  );

  router.patch(
    '/me/preferences',
    requireAuth,
    asyncHandler(updateAuthenticatedUserPreferencesHttpHandler(deps)),
  );

  router.post('/', localUserCreationRemovedHttpHandler());
  router.use(userHttpErrorHandler);

  return {
    path: '/users',
    router,
  };
}
