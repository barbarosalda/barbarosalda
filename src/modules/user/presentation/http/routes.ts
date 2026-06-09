import { Router } from 'express';

import type { ResolveAuthenticatedUserUseCase } from '../../application/use-cases/ResolveAuthenticatedUserUseCase.ts';
import type { UpdateAuthenticatedUserPreferencesUseCase } from '../../application/use-cases/UpdateAuthenticatedUserPreferencesUseCase.ts';
import type { ModuleRoute } from '@shared/presentation/http/routes';
import { asyncHandler } from '@shared/presentation/http/utils/asyncHandler';
import { localUserCreationRemovedHttpHandler } from './handlers/localUserCreationRemovedHttpHandler.ts';
import { resolveAuthenticatedUserHttpHandler } from './handlers/resolveAuthenticatedUserHttpHandler.ts';
import { updateAuthenticatedUserPreferencesHttpHandler } from './handlers/updateAuthenticatedUserPreferencesHttpHandler.ts';

export function createUserModuleRoutes(deps: {
  resolveAuthenticatedUserUseCase: ResolveAuthenticatedUserUseCase;
  updateAuthenticatedUserPreferencesUseCase: UpdateAuthenticatedUserPreferencesUseCase;
}): ModuleRoute[] {
  const publicRouter = Router();
  const protectedRouter = Router();

  publicRouter.post('/', localUserCreationRemovedHttpHandler());

  protectedRouter.get(
    '/me',
    asyncHandler(resolveAuthenticatedUserHttpHandler(deps)),
  );

  protectedRouter.patch(
    '/me/preferences',
    asyncHandler(updateAuthenticatedUserPreferencesHttpHandler(deps)),
  );

  return [
    {
      path: '/users',
      router: publicRouter,
      access: 'public',
    },
    {
      path: '/users',
      router: protectedRouter,
      access: 'protected',
    },
  ];
}
