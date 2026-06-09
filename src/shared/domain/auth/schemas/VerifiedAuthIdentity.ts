import { z } from 'zod';

export const VerifiedAuthIdentitySchema = z.object({
  /**
   * TraderLock user id.
   *
   * This is always the Cognito `sub` claim from a verified JWT. TraderLock does
   * not keep a local users table for this identity.
   */
  userId: z.string().min(1),
  provider: z.literal('cognito').or(z.literal('dev')),
  tokenUse: z.enum(['access', 'id']),
  username: z.string().min(1).optional(),
  email: z.string().email().optional(),
  emailVerified: z.boolean().optional(),
  name: z.string().min(1).optional(),
  groups: z.array(z.string()).default([]),
  scopes: z.array(z.string()).default([]),
});

export type VerifiedAuthIdentity = z.infer<typeof VerifiedAuthIdentitySchema>;
