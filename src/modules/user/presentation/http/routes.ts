import { Router } from 'express';

import type { ResolveAuthenticatedUserUseCase } from '@modules/user/application/use-cases/ResolveAuthenticatedUserUseCase';
import type { UpdateAuthenticatedUserPreferencesUseCase } from '@modules/user/application/use-cases/UpdateAuthenticatedUserPreferencesUseCase';
import type { ModuleRoute } from '@shared/presentation/http/routes';
import { asyncHandler } from '@shared/presentation/http/utils/asyncHandler';
import { localUserCreationRemovedHttpHandler } from '@modules/user/presentation/http/handlers/localUserCreationRemovedHttpHandler';
import { resolveAuthenticatedUserHttpHandler } from '@modules/user/presentation/http/handlers/resolveAuthenticatedUserHttpHandler';
import { updateAuthenticatedUserPreferencesHttpHandler } from '@modules/user/presentation/http/handlers/updateAuthenticatedUserPreferencesHttpHandler';

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
