import { Router } from 'express';

import type { ConnectIntegrationConnectionUseCase } from '@modules/integration/application/use-cases/ConnectIntegrationConnectionUseCase';
import type { DisconnectIntegrationConnectionUseCase } from '@modules/integration/application/use-cases/DisconnectIntegrationConnectionUseCase';
import type { ListIntegrationProvidersUseCase } from '@modules/integration/application/use-cases/ListIntegrationProvidersUseCase';
import type { ReceivePlatformIntegrationEventUseCase } from '@modules/integration/application/use-cases/ReceivePlatformIntegrationEventUseCase';
import { connectIntegrationConnectionHttpHandler } from '@modules/integration/presentation/http/handlers/connectIntegrationConnectionHttpHandler';
import { disconnectIntegrationConnectionHttpHandler } from '@modules/integration/presentation/http/handlers/disconnectIntegrationConnectionHttpHandler';
import { listIntegrationProvidersHttpHandler } from '@modules/integration/presentation/http/handlers/listIntegrationProvidersHttpHandler';
import { receivePlatformIntegrationEventHttpHandler } from '@modules/integration/presentation/http/handlers/receivePlatformIntegrationEventHttpHandler';
import type { ModuleRoute } from '@shared/presentation/http/routes';
import { asyncHandler } from '@shared/presentation/http/utils/asyncHandler';

/**
 * Creates the integration module routes.
 * @param deps - The dependencies.
 * @returns The routes.
 */
export function createIntegrationModuleRoutes(deps: {
  listIntegrationProvidersUseCase: ListIntegrationProvidersUseCase;
  connectIntegrationConnectionUseCase: ConnectIntegrationConnectionUseCase;
  disconnectIntegrationConnectionUseCase: DisconnectIntegrationConnectionUseCase;
  receivePlatformIntegrationEventUseCase: ReceivePlatformIntegrationEventUseCase;
}): ModuleRoute[] {
  const protectedRouter = Router();

  // Should be moved to account module.
  protectedRouter.get(
    '/providers',
    asyncHandler(listIntegrationProvidersHttpHandler(deps)),
  );

  protectedRouter.post(
    '/connections',
    asyncHandler(connectIntegrationConnectionHttpHandler(deps)),
  );

  protectedRouter.delete(
    '/connections/:connectionId',
    asyncHandler(disconnectIntegrationConnectionHttpHandler(deps)),
  );

  // SHould be removed and handled async but platform events coming from other modules like risk module and account module.
  protectedRouter.post(
    '/connections/:connectionId/events',
    asyncHandler(receivePlatformIntegrationEventHttpHandler(deps)),
  );

  return [
    {
      path: '/integrations',
      router: protectedRouter,
      access: 'protected',
    },
  ];
}
