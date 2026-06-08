import { Prisma, type Prisma as PrismaNamespace, type UserPreference as PrismaUserPreference } from '@generated/prisma/client';

import type { JsonValue } from '@shared/kernel/json/JsonValue';
import {
  CreateUserPreferenceSchema,
  type CreateUserPreferenceInput,
  UpdateUserPreferenceSchema,
  type UpdateUserPreferenceInput,
  UserPreferenceSchema,
  type UserPreference,
} from '@modules/user/domain/preference/UserPreference';

export function toDomainUserPreference(row: PrismaUserPreference): UserPreference {
  return UserPreferenceSchema.parse({
    id: row.id,
    userId: row.user_id,
    timezone: row.timezone,
    locale: row.locale,
    metadataJson: row.metadata_json,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

export function toPrismaUserPreferenceCreateData(
  input: CreateUserPreferenceInput,
  id: string,
): PrismaNamespace.UserPreferenceUncheckedCreateInput {
  const parsed = CreateUserPreferenceSchema.parse(input);

  return {
    id,
    user_id: parsed.userId,
    timezone: parsed.timezone,
    locale: parsed.locale ?? null,
    metadata_json: toOptionalPrismaJson(parsed.metadataJson),
  };
}

export function toPrismaUserPreferenceUpdateData(
  input: UpdateUserPreferenceInput,
): PrismaNamespace.UserPreferenceUncheckedUpdateInput {
  const parsed = UpdateUserPreferenceSchema.parse(input);
  const data: PrismaNamespace.UserPreferenceUncheckedUpdateInput = {};

  if (parsed.timezone !== undefined) data.timezone = parsed.timezone;
  if (parsed.locale !== undefined) data.locale = parsed.locale;
  if (parsed.metadataJson !== undefined) data.metadata_json = toPrismaJson(parsed.metadataJson);

  return data;
}

function toPrismaJson(value: JsonValue): PrismaNamespace.InputJsonValue | typeof Prisma.JsonNull {
  return value === null ? Prisma.JsonNull : (value as PrismaNamespace.InputJsonValue);
}

function toOptionalPrismaJson(
  value: JsonValue | undefined,
): PrismaNamespace.InputJsonValue | typeof Prisma.JsonNull | undefined {
  if (value === undefined) return undefined;
  return toPrismaJson(value);
}
