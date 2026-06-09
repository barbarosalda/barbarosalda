import type { RequestContext } from '@shared/presentation/http/context/requestContext';

declare global {
  namespace Express {
    interface Request {
      context: RequestContext;
    }
  }
}

export {};
