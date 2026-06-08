import type { RequestHandler } from 'express';

import { CreateUserWithPreferencesCommand } from '../../../application/contracts/CreateUserWithPreferencesContract.ts';
import type { CreateUserWithPreferencesUseCase } from '../../../application/use-cases/CreateUserWithPreferencesUseCase.ts';

export function createUserWithPreferencesHttpHandler(deps: {
  createUserWithPreferencesUseCase: CreateUserWithPreferencesUseCase;
}): RequestHandler {
  return async (request, response) => {
    const command = CreateUserWithPreferencesCommand.parse(request.body);
    const result = await deps.createUserWithPreferencesUseCase.execute(command);
    response.status(201).json(result);
  };
}
