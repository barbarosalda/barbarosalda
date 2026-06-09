import type { VerifiedAuthIdentity } from '@src/shared/domain/auth/schemas/VerifiedAuthIdentity';

export interface IAuthProviderPort {
  verifyToken(token: string): Promise<VerifiedAuthIdentity>;
}