import {
  Prisma,
  type Prisma as PrismaNamespace,
  type PropFirm as PrismaPropFirm,
  type PropFirmProgram as PrismaPropFirmProgram,
  type PropFirmProgramStage as PrismaPropFirmProgramStage,
  type TradingAccount as PrismaTradingAccount,
  type TradingAccountSnapshot as PrismaTradingAccountSnapshot,
} from '@generated/prisma/client';

import type { JsonValue } from '@shared/kernel/json/JsonValue';

import {
  CreatePropFirmSchema,
  PropFirmSchema,
  PropFirmWithProgramsAndStagesSchema,
  type CreatePropFirmInput,
  type PropFirm,
  type PropFirmWithProgramsAndStages,
  type UpdatePropFirmInput,
  UpdatePropFirmSchema,
} from '@modules/account/domain/PropFirm/PropFirm';

import {
  CreatePropFirmProgramSchema,
  PropFirmProgramSchema,
  type CreatePropFirmProgramInput,
  type PropFirmProgram,
  type UpdatePropFirmProgramInput,
  UpdatePropFirmProgramSchema,
} from '@modules/account/domain/PropFirmProgram/PropFirmProgram';

import {
  CreatePropFirmProgramStageSchema,
  PropFirmProgramStageSchema,
  type CreatePropFirmProgramStageInput,
  type PropFirmProgramStage,
  type UpdatePropFirmProgramStageInput,
  UpdatePropFirmProgramStageSchema,
} from '@modules/account/domain/PropFirmProgramStage/PropFirmProgramStage';

import {
  CreateTradingAccountSchema,
  TradingAccountSchema,
  type CreateTradingAccountInput,
  type TradingAccount,
  type UpdateTradingAccountInput,
  UpdateTradingAccountSchema,
} from '@modules/account/domain/TradingAccount/TradingAccount';

import {
  CreateTradingAccountSnapshotSchema,
  TradingAccountSnapshotSchema,
  type CreateTradingAccountSnapshotInput,
  type TradingAccountSnapshot,
} from '@modules/account/domain/TradingAccountSnapshot/TradingAccountSnapshot';

export type PrismaPropFirmWithProgramsAndStages = PrismaNamespace.PropFirmGetPayload<{
  include: {
    programs: {
      include: {
        stages: true;
      };
    };
  };
}>;

/**
 * Converts a Prisma trading account to a domain trading account.
 * @param row - The Prisma trading account.
 * @returns The domain trading account.
 */
export function toDomainTradingAccount(row: PrismaTradingAccount): TradingAccount {
  return TradingAccountSchema.parse({
    id: row.id,
    user_id: row.user_id,
    license_id: row.license_id,
    provider_account_id: row.provider_account_id,
    account_number: row.account_number,
    account_label: row.account_label,
    account_currency: row.account_currency,
    prop_firm_id: row.prop_firm_id,
    prop_firm_program_id: row.prop_firm_program_id,
    prop_firm_program_stage_id: row.prop_firm_program_stage_id,
    rule_group_id: row.rule_group_id,
    status: row.status,
    metadata_json: row.metadata_json,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

/**
 * Converts a domain trading account to a Prisma trading account.
 * @param input - The domain trading account.
 * @param id - The ID of the trading account.
 * @returns The Prisma trading account.
 */
export function toPrismaTradingAccountCreateData(
  input: CreateTradingAccountInput,
  id: string,
): PrismaNamespace.TradingAccountUncheckedCreateInput {
  const parsed = CreateTradingAccountSchema.parse(input);

  return {
    id,
    user_id: parsed.user_id,
    license_id: parsed.license_id,
    provider_account_id: parsed.provider_account_id,
    account_number: parsed.account_number,
    account_label: parsed.account_label,
    account_currency: parsed.account_currency,
    prop_firm_id: parsed.prop_firm_id,
    prop_firm_program_id: parsed.prop_firm_program_id,
    prop_firm_program_stage_id: parsed.prop_firm_program_stage_id,
    rule_group_id: parsed.rule_group_id,
    status: parsed.status,
    metadata_json: toOptionalPrismaJson(parsed.metadata_json),
  };
}

/**
 * Converts a domain trading account to a Prisma trading account.
 * @param input - The domain trading account.
 * @returns The Prisma trading account.
 */
export function toPrismaTradingAccountUpdateData(
  input: UpdateTradingAccountInput,
): PrismaNamespace.TradingAccountUncheckedUpdateInput {
  const parsed = UpdateTradingAccountSchema.parse(input);
  const data: PrismaNamespace.TradingAccountUncheckedUpdateInput = {};

  if (parsed.user_id !== undefined) data.user_id = parsed.user_id;
  if (parsed.license_id !== undefined) data.license_id = parsed.license_id;
  if (parsed.provider_account_id !== undefined) data.provider_account_id = parsed.provider_account_id;
  if (parsed.account_number !== undefined) data.account_number = parsed.account_number;
  if (parsed.account_label !== undefined) data.account_label = parsed.account_label;
  if (parsed.account_currency !== undefined) data.account_currency = parsed.account_currency;
  if (parsed.prop_firm_id !== undefined) data.prop_firm_id = parsed.prop_firm_id;
  if (parsed.prop_firm_program_id !== undefined) data.prop_firm_program_id = parsed.prop_firm_program_id;
  if (parsed.prop_firm_program_stage_id !== undefined) {
    data.prop_firm_program_stage_id = parsed.prop_firm_program_stage_id;
  }
  if (parsed.rule_group_id !== undefined) data.rule_group_id = parsed.rule_group_id;
  if (parsed.status !== undefined) data.status = parsed.status;
  if (parsed.metadata_json !== undefined) data.metadata_json = toPrismaJson(parsed.metadata_json);

  return data;
}

/**
 * Converts a Prisma trading account snapshot to a domain trading account snapshot.
 * @param row - The Prisma trading account snapshot.
 * @returns The domain trading account snapshot.
 */
export function toDomainTradingAccountSnapshot(
  row: PrismaTradingAccountSnapshot,
): TradingAccountSnapshot {
  return TradingAccountSnapshotSchema.parse({
    id: row.id,
    trading_account_id: row.trading_account_id,
    balance: row.balance,
    equity: row.equity,
    margin_used: row.margin_used,
    free_margin: row.free_margin,
    unrealized_pnl: row.unrealized_pnl,
    realized_pnl: row.realized_pnl,
    snapshot_type: row.snapshot_type,
    provider_timestamp: row.provider_timestamp,
    recorded_at: row.recorded_at,
    createdAt: row.created_at,
  });
}

/**
 * Converts a domain trading account snapshot to a Prisma trading account snapshot.
 * @param input - The domain trading account snapshot.
 * @param id - The ID of the trading account snapshot.
 * @returns The Prisma trading account snapshot.
 */
export function toPrismaTradingAccountSnapshotCreateData(
  input: CreateTradingAccountSnapshotInput,
  id: string,
): PrismaNamespace.TradingAccountSnapshotUncheckedCreateInput {
  const parsed = CreateTradingAccountSnapshotSchema.parse(input);

  return {
    id,
    trading_account_id: parsed.trading_account_id,
    balance: parsed.balance,
    equity: parsed.equity,
    margin_used: parsed.margin_used,
    free_margin: parsed.free_margin,
    unrealized_pnl: parsed.unrealized_pnl,
    realized_pnl: parsed.realized_pnl,
    snapshot_type: parsed.snapshot_type,
    provider_timestamp: parsed.provider_timestamp,
    recorded_at: parsed.recorded_at,
  };
}

/**
 * Converts a Prisma prop firm to a domain prop firm.
 * @param row - The Prisma prop firm.
 * @returns The domain prop firm.
 */
export function toDomainPropFirm(row: PrismaPropFirm): PropFirm {
  return PropFirmSchema.parse({
    id: row.id,
    name: row.name,
    slug: row.slug,
    website_url: row.website_url,
    status: row.status,
    firm_type: row.firm_type,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

/**
 * Converts a Prisma prop firm with programs and stages to a domain prop firm with programs and stages.
 * @param row - The Prisma prop firm with programs and stages.
 * @returns The domain prop firm with programs and stages.
 */
export function toDomainPropFirmWithProgramsAndStages(
  row: PrismaPropFirmWithProgramsAndStages,
): PropFirmWithProgramsAndStages {
  return PropFirmWithProgramsAndStagesSchema.parse({
    ...toDomainPropFirm(row),
    programs: row.programs.map((program) => ({
      ...toDomainPropFirmProgram(program),
      stages: program.stages.map(toDomainPropFirmProgramStage),
    })),
  });
}

/**
 * Converts a domain prop firm to a Prisma prop firm.
 * @param input - The domain prop firm.
 * @param id - The ID of the prop firm.
 * @returns The Prisma prop firm.
 */
export function toPrismaPropFirmCreateData(
  input: CreatePropFirmInput,
  id: string,
): PrismaNamespace.PropFirmUncheckedCreateInput {
  const parsed = CreatePropFirmSchema.parse(input);

  return {
    id,
    name: parsed.name,
    slug: parsed.slug,
    website_url: parsed.website_url,
    status: parsed.status,
    firm_type: parsed.firm_type,
  };
}

/**
 * Converts a domain prop firm to a Prisma prop firm.
 * @param input - The domain prop firm.
 * @returns The Prisma prop firm.
 */
export function toPrismaPropFirmUpdateData(
  input: UpdatePropFirmInput,
): PrismaNamespace.PropFirmUncheckedUpdateInput {
  const parsed = UpdatePropFirmSchema.parse(input);

  return {
    website_url: parsed.website_url,
    status: parsed.status,
    firm_type: parsed.firm_type,
  };
}

/**
 * Converts a Prisma prop firm program to a domain prop firm program.
 * @param row - The Prisma prop firm program.
 * @returns The domain prop firm program.
 */
export function toDomainPropFirmProgram(row: PrismaPropFirmProgram): PropFirmProgram {
  return PropFirmProgramSchema.parse({
    id: row.id,
    prop_firm_id: row.prop_firm_id,
    name: row.name,
    slug: row.slug,
    initial_nominal_value: row.initial_nominal_value,
    market_type: row.market_type,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

/**
 * Converts a domain prop firm program to a Prisma prop firm program.
 * @param input - The domain prop firm program.
 * @param id - The ID of the prop firm program.
 * @returns The Prisma prop firm program.
 */
  export function toPrismaPropFirmProgramCreateData(
  input: CreatePropFirmProgramInput,
  id: string,
): PrismaNamespace.PropFirmProgramUncheckedCreateInput {
  const parsed = CreatePropFirmProgramSchema.parse(input);

  return {
    id,
    prop_firm_id: parsed.prop_firm_id,
    name: parsed.name,
    slug: parsed.slug,
    initial_nominal_value: parsed.initial_nominal_value,
    market_type: parsed.market_type,
    status: parsed.status,
  };
}

/**
 * Converts a domain prop firm program to a Prisma prop firm program.
 * @param input - The domain prop firm program.
 * @returns The Prisma prop firm program.
 */
export function toPrismaPropFirmProgramUpdateData(
  input: UpdatePropFirmProgramInput,
): PrismaNamespace.PropFirmProgramUncheckedUpdateInput {
  const parsed = UpdatePropFirmProgramSchema.parse(input);

  return {
    name: parsed.name,
    slug: parsed.slug,
    initial_nominal_value: parsed.initial_nominal_value,
    market_type: parsed.market_type,
    status: parsed.status,
  };
}

/**
 * Converts a Prisma prop firm program stage to a domain prop firm program stage.
 * @param row - The Prisma prop firm program stage.
 * @returns The domain prop firm program stage.
 */
export function toDomainPropFirmProgramStage(
  row: PrismaPropFirmProgramStage,
): PropFirmProgramStage {
  return PropFirmProgramStageSchema.parse({
    id: row.id,
    program_id: row.program_id,
    name: row.name,
    sequence_order: row.sequence_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

/**
 * Converts a domain prop firm program stage to a Prisma prop firm program stage.
 * @param input - The domain prop firm program stage.
 * @param id - The ID of the prop firm program stage.
 * @returns The Prisma prop firm program stage.
 */
export function toPrismaPropFirmProgramStageCreateData(
  input: CreatePropFirmProgramStageInput,
  id: string,
): PrismaNamespace.PropFirmProgramStageUncheckedCreateInput {
  const parsed = CreatePropFirmProgramStageSchema.parse(input);

  return {
    id,
    program_id: parsed.program_id,
    name: parsed.name,
    sequence_order: parsed.sequence_order,
  };
}

/**
 * Converts a domain prop firm program stage to a Prisma prop firm program stage.
 * @param input - The domain prop firm program stage.
 * @returns The Prisma prop firm program stage.
 */
export function toPrismaPropFirmProgramStageUpdateData(
  input: UpdatePropFirmProgramStageInput,
): PrismaNamespace.PropFirmProgramStageUncheckedUpdateInput {
  const parsed = UpdatePropFirmProgramStageSchema.parse(input);

  return {
    name: parsed.name,
    sequence_order: parsed.sequence_order,
  };
}

/**
 * Converts a JSON value to a Prisma JSON value.
 * @param value - The JSON value.
 * @returns The Prisma JSON value.
 */
function toPrismaJson(value: JsonValue): PrismaNamespace.InputJsonValue | typeof Prisma.JsonNull {
  return value === null ? Prisma.JsonNull : (value as PrismaNamespace.InputJsonValue);
}

/**
 * Converts a JSON value to a Prisma JSON value.
 * @param value - The JSON value.
 * @returns The Prisma JSON value.
 */
function toOptionalPrismaJson(
  value: JsonValue | undefined,
): PrismaNamespace.InputJsonValue | typeof Prisma.JsonNull | undefined {
  if (value === undefined) return undefined;
  return toPrismaJson(value);
}
