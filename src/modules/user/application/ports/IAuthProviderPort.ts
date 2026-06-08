import type { VerifiedAuthIdentity } from "../../domain/auth/schemas/VerifiedAuthIdentity.ts";

export interface IAuthProviderPort {
  verifyToken(token: string): Promise<VerifiedAuthIdentity>;
}