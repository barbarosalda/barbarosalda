import {
  type IAuthProviderPort,
} from '@modules/user/application/ports/IAuthProviderPort';
import type { VerifiedAuthIdentity } from '@modules/user/domain/auth/schemas/VerifiedAuthIdentity';
import { AuthTokenInvalidError } from '@modules/user/domain/auth/errors/AuthTokenInvalidError';

export interface CognitoAuthProviderConfig {
  region: string;
  userPoolId: string;
  clientId: string;
  issuer?: string;
}

export class CognitoAuthProviderAdapter implements IAuthProviderPort {
  constructor(private readonly _config: CognitoAuthProviderConfig) {}

  async verifyToken(token: string): Promise<VerifiedAuthIdentity> {
    if (token.trim().length === 0) {
      throw new AuthTokenInvalidError();
    }

    throw new Error('Cognito token verification is not implemented yet.');
  }
}
