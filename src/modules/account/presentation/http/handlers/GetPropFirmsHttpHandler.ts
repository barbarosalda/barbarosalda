import type { RequestHandler } from 'express';

import { GetPropFirmsUseCase } from '@src/modules/account/application/use-cases/GetPropFirmsUseCase';

/**
 * Handler for getting prop firms.
 * @param deps - The dependencies.
 * @returns The handler.
 */
export function getPropFirmsHttpHandler(deps: {
  getPropFirmsUseCase: GetPropFirmsUseCase;
}): RequestHandler {
  /**
   * Handler for getting prop firms.
   * @param _request - The request.
   * @param response - The response.
   * @returns The result.
   */
  return async (_request, response) => {
    const result = await deps.getPropFirmsUseCase.execute();

    response.status(200).json(result);
  };
}
