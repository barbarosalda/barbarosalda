import {
  Prisma,
  type Prisma as PrismaNamespace,
  type IntegrationConnection as PrismaIntegrationConnection,
  type IntegrationProvider as PrismaIntegrationProvider,
} from '@generated/prisma/client';

import {
  CreateIntegrationConnectionSchema,
  IntegrationConnectionSchema,
  type CreateIntegrationConnectionInput,
  type IntegrationConnection,
  type UpdateIntegrationConnectionInput,
  UpdateIntegrationConnectionSchema,
} from '@modules/integration/domain/IntegrationConnection/IntegrationConnection';
import {
  CreateIntegrationProviderSchema,
  IntegrationProviderSchema,
  type CreateIntegrationProviderInput,
  type IntegrationProvider,
  type UpdateIntegrationProviderInput,
  UpdateIntegrationProviderSchema,
} from '@modules/integration/domain/IntegrationProvider/IntegrationProvider';
import type { JsonValue } from '@shared/kernel/json/JsonValue';

export function toDomainIntegrationConnection(
  row: PrismaIntegrationConnection,
): IntegrationConnection {
  return IntegrationConnectionSchema.parse({
    id: row.id,
    user_id: row.user_id,
    provider_id: row.provider_id,
    provider_external_user_id: row.provider_external_user_id,
    status: row.status,
    credentials_ref: row.credentials_ref,
    connected_at: row.connected_at,
    disconnected_at: row.disconnected_at,
    last_sync_at: row.last_sync_at,
    last_error: row.last_error,
    metadata_json: row.metadata_json,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

export function toPrismaIntegrationConnectionCreateData(
  input: CreateIntegrationConnectionInput,
  id: string,
): PrismaNamespace.IntegrationConnectionUncheckedCreateInput {
  const parsed = CreateIntegrationConnectionSchema.parse(input);

  return {
    id,
    user_id: parsed.user_id,
    provider_id: parsed.provider_id,
    provider_external_user_id: parsed.provider_external_user_id,
    status: parsed.status,
    credentials_ref: parsed.credentials_ref,
    connected_at: parsed.connected_at,
    disconnected_at: parsed.disconnected_at,
    last_sync_at: parsed.last_sync_at,
    last_error: parsed.last_error,
    metadata_json: toOptionalPrismaJson(parsed.metadata_json),
  };
}

export function toPrismaIntegrationConnectionUpdateData(
  input: UpdateIntegrationConnectionInput,
): PrismaNamespace.IntegrationConnectionUncheckedUpdateInput {
  const parsed = UpdateIntegrationConnectionSchema.parse(input);
  const data: PrismaNamespace.IntegrationConnectionUncheckedUpdateInput = {};

  if (parsed.provider_external_user_id !== undefined) {
    data.provider_external_user_id = parsed.provider_external_user_id;
  }
  if (parsed.status !== undefined) data.status = parsed.status;
  if (parsed.credentials_ref !== undefined) data.credentials_ref = parsed.credentials_ref;
  if (parsed.connected_at !== undefined) data.connected_at = parsed.connected_at;
  if (parsed.disconnected_at !== undefined) data.disconnected_at = parsed.disconnected_at;
  if (parsed.last_sync_at !== undefined) data.last_sync_at = parsed.last_sync_at;
  if (parsed.last_error !== undefined) data.last_error = parsed.last_error;
  if (parsed.metadata_json !== undefined) data.metadata_json = toPrismaJson(parsed.metadata_json);

  return data;
}

export function toDomainIntegrationProvider(row: PrismaIntegrationProvider): IntegrationProvider {
  return IntegrationProviderSchema.parse({
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    provider_type: row.provider_type,
    auth_type: row.auth_type,
    connection_mode: row.connection_mode,
    adapter_key: row.adapter_key,
    website_url: row.website_url,
    logo_url: row.logo_url,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

export function toPrismaIntegrationProviderCreateData(
  input: CreateIntegrationProviderInput,
  id: string,
): PrismaNamespace.IntegrationProviderUncheckedCreateInput {
  const parsed = CreateIntegrationProviderSchema.parse(input);

  return {
    id,
    code: parsed.code,
    name: parsed.name,
    description: parsed.description,
    provider_type: parsed.provider_type,
    auth_type: parsed.auth_type,
    connection_mode: parsed.connection_mode,
    adapter_key: parsed.adapter_key,
    website_url: parsed.website_url,
    logo_url: parsed.logo_url,
    status: parsed.status,
  };
}

export function toPrismaIntegrationProviderUpdateData(
  input: UpdateIntegrationProviderInput,
): PrismaNamespace.IntegrationProviderUncheckedUpdateInput {
  const parsed = UpdateIntegrationProviderSchema.parse(input);
  const data: PrismaNamespace.IntegrationProviderUncheckedUpdateInput = {};

  if (parsed.code !== undefined) data.code = parsed.code;
  if (parsed.name !== undefined) data.name = parsed.name;
  if (parsed.description !== undefined) data.description = parsed.description;
  if (parsed.provider_type !== undefined) data.provider_type = parsed.provider_type;
  if (parsed.auth_type !== undefined) data.auth_type = parsed.auth_type;
  if (parsed.connection_mode !== undefined) data.connection_mode = parsed.connection_mode;
  if (parsed.adapter_key !== undefined) data.adapter_key = parsed.adapter_key;
  if (parsed.website_url !== undefined) data.website_url = parsed.website_url;
  if (parsed.logo_url !== undefined) data.logo_url = parsed.logo_url;
  if (parsed.status !== undefined) data.status = parsed.status;

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
