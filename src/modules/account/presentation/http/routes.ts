import { Router } from 'express';

import type { ModuleRoute } from '@shared/presentation/http/routes';

export function createAccountModuleRoutes(): ModuleRoute[] {
  const protectedRouter = Router();

  return [
    {
      path: '/users',
      router: protectedRouter,
      access: 'protected',
    },
  ];
}
