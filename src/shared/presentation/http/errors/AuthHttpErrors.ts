import type { ErrorRequestHandler } from 'express';
import { z } from 'zod';

import { LOG_MESSAGES } from '@shared/domain/logging/entities/LogMessage';
import { Logger } from '@shared/infrastructure/logging/Logger';
import { HttpError } from './HttpError.ts';

interface UserValidationIssue {
  path: string;
  message: string;
  code: string;
}

function toValidationIssues(error: z.ZodError): UserValidationIssue[] {
  return error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: issue.code,
  }));
}

export class AuthUnauthorizedHttpError extends HttpError {
  constructor(message = 'Unauthorized') {
    super(401, message);
  }
}

export const authHttpErrorHandler: ErrorRequestHandler = (error, request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }

  if (error instanceof z.ZodError) {
    response.status(400).json({
      error: 'Validation error',
      details: toValidationIssues(error),
    });
    return;
  }

  if (error instanceof AuthUnauthorizedHttpError) {
    response.status(401).json({ error: error.message });
    return;
  }

  Logger.error(LOG_MESSAGES.APPLICATION.HTTP_UNHANDLED_ERROR, {
    error: error instanceof Error ? error.message : String(error),
    route: `${request.method} ${request.baseUrl}${request.path}`,
  });
  response.status(500).json({ error: 'Internal server error' });
};
