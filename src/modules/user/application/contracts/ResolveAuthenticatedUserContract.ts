import { z } from 'zod';

import { VerifiedAuthIdentitySchema } from '../../domain/auth/schemas/VerifiedAuthIdentity.ts';
import { UserSchema } from '../../domain/user/User.ts';
import { UserPreferenceSchema } from '../../domain/preference/UserPreference.ts';

export const ResolveAuthenticatedUserCommand = z.object({
  identity: VerifiedAuthIdentitySchema,
  correlationId: z.string().min(1),
  requestId: z.string().min(1).optional(),
});
export type ResolveAuthenticatedUserCommand = z.infer<typeof ResolveAuthenticatedUserCommand>;

export const ResolveAuthenticatedUserResult = z.object({
  user: UserSchema,
  preferences: UserPreferenceSchema,
  created: z.boolean(),
});
export type ResolveAuthenticatedUserResult = z.infer<typeof ResolveAuthenticatedUserResult>;
