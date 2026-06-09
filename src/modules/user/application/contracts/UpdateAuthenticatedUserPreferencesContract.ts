import { z } from 'zod';

import { VerifiedAuthIdentitySchema } from '@shared/domain/auth/schemas/VerifiedAuthIdentity';
import { UpdateUserPreferenceSchema, UserPreferenceSchema } from '../../domain/preference/UserPreference.ts';

export const UpdateAuthenticatedUserPreferencesCommand = z.object({
  identity: VerifiedAuthIdentitySchema,
  preferences: UpdateUserPreferenceSchema,
  correlationId: z.string().min(1),
  requestId: z.string().min(1).optional(),
});
export type UpdateAuthenticatedUserPreferencesCommand = z.infer<
  typeof UpdateAuthenticatedUserPreferencesCommand
>;

export const UpdateAuthenticatedUserPreferencesResult = z.object({
  preferences: UserPreferenceSchema,
});
export type UpdateAuthenticatedUserPreferencesResult = z.infer<
  typeof UpdateAuthenticatedUserPreferencesResult
>;
