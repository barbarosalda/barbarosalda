import { Router } from 'express';

import type { ModuleRoute } from '@shared/presentation/http/routes';
import { asyncHandler } from '@src/shared/presentation/http/utils/asyncHandler';

/* PropFirms  */
import { GetPropFirmsUseCase } from '@src/modules/account/application/use-cases/GetPropFirmsUseCase';
import { getPropFirmsHttpHandler } from '@src/modules/account/presentation/http/handlers/GetPropFirmsHttpHandler';
/* PropFirmDetails */
import { GetPropFirmDetailsUseCase } from '@src/modules/account/application/use-cases/GetPropFirmDetailsUseCase';
import { getPropFirmDetailsHttpHandler } from '@src/modules/account/presentation/http/handlers/GetPropFirmDetailsHttpHandler';
/* TradingAccounts */
import { GetTradingAccountsUseCase } from '@src/modules/account/application/use-cases/GetTradingAccountsUseCase';
import { getTradingAccountsHttpHandler } from '@src/modules/account/presentation/http/handlers/GetTradingAccountsHttpHandler';

/**
 * Creates the account module routes.
 * @param deps - The dependencies.
 * @returns The routes.
 */
export function createAccountModuleRoutes(deps: {
  getPropFirmsUseCase: GetPropFirmsUseCase;
  getPropFirmDetailsUseCase: GetPropFirmDetailsUseCase;
  getTradingAccountsUseCase: GetTradingAccountsUseCase;
}): ModuleRoute[] {


  const protectedRouter = Router();


  // TradingAccounts
  protectedRouter.get(
    '/trading-accounts',
    asyncHandler(getTradingAccountsHttpHandler(deps)),
  );

  // PropFirms
  protectedRouter.get(
    '/prop-firms',
    asyncHandler(getPropFirmsHttpHandler(deps)),
  );

  // Prop Firm Details
  protectedRouter.get(
    '/prop-firms/:propFirmId',
    asyncHandler(getPropFirmDetailsHttpHandler(deps)),
  );

  return [
    {
      path: '/users',
      router: protectedRouter,
      access: 'protected',
    },
  ];
}
