import { z } from 'zod';

import { VerifiedAuthIdentitySchema } from '@src/shared/domain/Auth/schemas/VerifiedAuthIdentity';
import { UserPreferenceSchema } from '@modules/user/domain/preference/UserPreference';

export const ResolveAuthenticatedUserCommand = z.object({
  identity: VerifiedAuthIdentitySchema,
  correlationId: z.string().min(1),
  requestId: z.string().min(1).optional(),
});
export type ResolveAuthenticatedUserCommand = z.infer<typeof ResolveAuthenticatedUserCommand>;

export const ResolveAuthenticatedUserResult = z.object({
  identity: VerifiedAuthIdentitySchema,
  preferences: UserPreferenceSchema,
  created: z.boolean(),
});
export type ResolveAuthenticatedUserResult = z.infer<typeof ResolveAuthenticatedUserResult>;
