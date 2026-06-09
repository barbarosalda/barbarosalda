import type { VerifiedAuthIdentity } from '@src/shared/domain/Auth/schemas/VerifiedAuthIdentity';

export interface IAuthProviderPort {
  verifyToken(token: string): Promise<VerifiedAuthIdentity>;
}