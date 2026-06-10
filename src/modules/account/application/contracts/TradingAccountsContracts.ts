import { z } from 'zod';
import { TradingAccountSchema } from '../../domain/TradingAccount/TradingAccount.ts';
import { VerifiedAuthIdentitySchema } from '@src/shared/domain/Auth/schemas/VerifiedAuthIdentity';


/**
 * Command for getting trading accounts.
 * @returns The command.
 */
export const GetTradingAccountsCommand = z.object({
  identity: VerifiedAuthIdentitySchema,
});

export type GetTradingAccountsCommand = z.infer<
  typeof GetTradingAccountsCommand
>;


/**
 * Result for getting accounts.
 * @returns The result.
 */
export const GetTradingAccountsResult = z.object({
  accounts: z.array(TradingAccountSchema),
});

export type GetTradingAccountsResult = z.infer<
  typeof GetTradingAccountsResult
>;
