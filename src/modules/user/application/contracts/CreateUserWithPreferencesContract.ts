import { z } from 'zod';

import { CreateUserSchema, UserSchema } from '../../domain/user/User.ts';
import { CreateUserPreferenceSchema, UserPreferenceSchema } from '../../domain/preference/UserPreference.ts';

export const CreateUserWithPreferencesCommand = z.object({
  actorUserId: z.string().min(1).nullable().optional(),
  correlationId: z.string().min(1),
  requestId: z.string().min(1).optional(),
  user: CreateUserSchema,
  preferences: CreateUserPreferenceSchema.omit({ userId: true }),
});

export type CreateUserWithPreferencesCommand = z.infer<typeof CreateUserWithPreferencesCommand>;

export const CreateUserWithPreferencesResult = z.object({
  user: UserSchema,
  preferences: UserPreferenceSchema,
});

export type CreateUserWithPreferencesResult = z.infer<typeof CreateUserWithPreferencesResult>;
