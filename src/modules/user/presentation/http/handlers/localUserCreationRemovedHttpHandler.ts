import type { RequestHandler } from 'express';

/**
 * Compatibility response for the old local-user bootstrap endpoint.
 *
 * TraderLock now derives user_id from Cognito `sub`, so users are not created
 * through this API anymore.
 */
export function localUserCreationRemovedHttpHandler(): RequestHandler {
  return (_request, response) => {
    response.status(410).json({
      error: 'LOCAL_USER_CREATION_REMOVED',
      message: 'Authenticate with Cognito and call GET /users/me to create preferences automatically.',
    });
  };
}
