import type { RequestContext } from './context/requestContext';

declare global {
  namespace Express {
    interface Request {
      context: RequestContext;
    }
  }
}

export {};
