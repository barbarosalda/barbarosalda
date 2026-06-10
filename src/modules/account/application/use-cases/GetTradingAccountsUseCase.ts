import { GetTradingAccountsCommand, GetTradingAccountsResult } from '@src/modules/account/application/contracts/TradingAccountsContracts';
import { ITradingAccountRepository } from '@src/modules/account/application/ports/ITradingAccountRepository';

/**
 * Use case for getting trading accounts.
 * @param deps - The dependencies.
 * @returns The use case.
 */
export class GetTradingAccountsUseCase {
    constructor(
        private readonly tradingAccountRepository: ITradingAccountRepository,
    ) { }

    /**
     * Execute the use case.
     * @param command - The command.
     * @returns The result.
     */
    async execute(command: GetTradingAccountsCommand): Promise<GetTradingAccountsResult> {
        const parsed = GetTradingAccountsCommand.parse(command);
        const userId = parsed.identity.userId;

        // todo: add some error handling maybe
        const accounts = await this.tradingAccountRepository.findByUserId(userId);

        return GetTradingAccountsResult.parse({
            accounts,
        });
    }
}
