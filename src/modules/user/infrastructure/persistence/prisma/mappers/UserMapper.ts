import type { Prisma, User as PrismaUser } from '@generated/prisma/client';

import {
  CreateUserSchema,
  type CreateUserInput,
  UpdateUserSchema,
  type UpdateUserInput,
  UserSchema,
  type User,
} from '@modules/user/domain/user/User';

export function toDomainUser(row: PrismaUser): User {
  return UserSchema.parse({
    id: row.id,
    email: row.email,
    externalAuthProvider: row.external_auth_provider,
    externalAuthUserId: row.external_auth_user_id,
    name: row.name,
    status: row.status,
    deletedAt: row.deleted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

export function toPrismaUserCreateData(input: CreateUserInput, id: string): Prisma.UserUncheckedCreateInput {
  const parsed = CreateUserSchema.parse(input);

  return {
    id,
    email: parsed.email,
    external_auth_provider: parsed.externalAuthProvider,
    external_auth_user_id: parsed.externalAuthUserId,
    name: parsed.name ?? null,
    status: parsed.status,
  };
}

export function toPrismaUserUpdateData(input: UpdateUserInput): Prisma.UserUncheckedUpdateInput {
  const parsed = UpdateUserSchema.parse(input);
  const data: Prisma.UserUncheckedUpdateInput = {};

  if (parsed.email !== undefined) data.email = parsed.email;
  if (parsed.name !== undefined) data.name = parsed.name;
  if (parsed.status !== undefined) data.status = parsed.status;
  if (parsed.deletedAt !== undefined) data.deleted_at = parsed.deletedAt;

  return data;
}
