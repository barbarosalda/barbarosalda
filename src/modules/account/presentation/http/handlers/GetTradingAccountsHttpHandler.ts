import type { RequestHandler } from 'express';

import { GetTradingAccountsUseCase } from '@src/modules/account/application/use-cases/GetTradingAccountsUseCase';
import { getAuthenticatedUser } from '@src/shared/presentation/http/middleware/getAuthenticatedUser';
import { GetTradingAccountsCommand } from '@src/modules/account/application/contracts/TradingAccountsContracts';

/**
 * Handler for getting trading accounts.
 * @param deps - The dependencies.
 * @returns The handler.
 */
export function getTradingAccountsHttpHandler(deps: {
  getTradingAccountsUseCase: GetTradingAccountsUseCase;
}): RequestHandler {
  /**
   * Handler for getting trading accounts.
   * @param request - The request.
   * @param response - The response.
   * @returns The result.
   */
  return async (request, response) => {
    const identity = getAuthenticatedUser(request);

    const command = GetTradingAccountsCommand.parse({
      identity,
    });

    const result = await deps.getTradingAccountsUseCase.execute(command);

    response.status(200).json(result);
  };
}
