import { z } from 'zod';

const VerifiedAuthProviderSchema = z.string().min(1);

export const VerifiedAuthIdentitySchema = z.object({
  provider: VerifiedAuthProviderSchema,
  providerUserId: z.string().min(1),
  email: z.string().email().optional(),
  emailVerified: z.boolean().optional(),
  name: z.string().min(1).optional(),
});

export type VerifiedAuthIdentity = z.infer<typeof VerifiedAuthIdentitySchema>;
