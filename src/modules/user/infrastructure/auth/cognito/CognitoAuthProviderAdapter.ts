import { CognitoJwtVerifier } from 'aws-jwt-verify';

import type { IAuthProviderPort } from '../../../application/ports/IAuthProviderPort.ts';
import { AuthTokenInvalidError } from '../../../domain/auth/errors/AuthTokenInvalidError.ts';
import { VerifiedAuthIdentitySchema } from '../../../domain/auth/schemas/VerifiedAuthIdentity.ts';

type CognitoAuthProviderConfig = {
  userPoolId: string;
  clientId: string;
  tokenUse: 'access' | 'id';
};

export class CognitoAuthProviderAdapter implements IAuthProviderPort {
  private readonly verifier;

  constructor(private readonly config: CognitoAuthProviderConfig) {
    this.verifier = CognitoJwtVerifier.create({
      userPoolId: config.userPoolId,
      tokenUse: config.tokenUse,
      clientId: config.clientId,
    });
  }

  async verifyToken(token: string) {
    try {
      const payload = await this.verifier.verify(token);
      const groupsClaim = payload['cognito:groups'];
      const scopeClaim = payload.scope;
      const usernameClaim = payload.username ?? payload['cognito:username'];

      return VerifiedAuthIdentitySchema.parse({
        userId: payload.sub,
        provider: 'cognito',
        tokenUse: this.config.tokenUse,
        username: typeof usernameClaim === 'string' ? usernameClaim : undefined,
        email: typeof payload.email === 'string' ? payload.email : undefined,
        emailVerified: typeof payload.email_verified === 'boolean' ? payload.email_verified : undefined,
        name: typeof payload.name === 'string' ? payload.name : undefined,
        groups: Array.isArray(groupsClaim) ? groupsClaim.filter((group): group is string => typeof group === 'string') : [],
        scopes: typeof scopeClaim === 'string' ? scopeClaim.split(' ').filter(Boolean) : [],
      });
    } catch {
      throw new AuthTokenInvalidError('Invalid or expired authentication token.');
    }
  }
}
