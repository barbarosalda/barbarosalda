import type { RequestHandler } from 'express';

import { GetPropFirmDetailsUseCase } from '@src/modules/account/application/use-cases/GetPropFirmDetailsUseCase';
import { GetPropFirmDetailsCommand } from '@src/modules/account/application/contracts/PropFirmContracts';

/**
 * Handler for getting prop firm details.
 * @param deps - The dependencies.
 * @returns The handler.
 */
export function getPropFirmDetailsHttpHandler(deps: {
  getPropFirmDetailsUseCase: GetPropFirmDetailsUseCase;
}): RequestHandler {
  /**
   * Handler for getting prop firms.
   * @param request - The request.
   * @param response - The response.
   * @returns The result.
   */
  return async (request, response) => {
    const command = GetPropFirmDetailsCommand.parse({
      propFirmId: request.params.propFirmId,
    });

    const result = await deps.getPropFirmDetailsUseCase.execute(command);

    response.status(200).json(result);
  };
}
