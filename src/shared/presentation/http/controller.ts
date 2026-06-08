import type { RequestHandler } from 'express';

interface AppReadinessChecks {
  isReady(): Promise<boolean>;
}

export function healthHandler(): RequestHandler {
  return (_request, response) => {
    response.status(200).json({ status: 'ok' });
  };
}

export function readyHandler(readinessChecks?: AppReadinessChecks): RequestHandler {
  return async (_request, response) => {
    const isReady = readinessChecks ? await readinessChecks.isReady() : true;

    if (!isReady) {
      response.status(503).json({ status: 'not_ready' });
      return;
    }

    response.status(200).json({ status: 'ready' });
  };
}