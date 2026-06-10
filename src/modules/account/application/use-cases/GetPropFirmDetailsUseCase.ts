import { GetPropFirmDetailsCommand, GetPropFirmDetailsResult } from '@src/modules/account/application/contracts/PropFirmContracts';
import { IPropFirmRepository } from '@src/modules/account/application/ports/IPropFirmRepository';
import { NotFoundError } from '@src/shared/presentation/http/errors/HttpError';

/**
 * Use case for getting prop firm details.
 * @param deps - The dependencies.
 * @returns The use case.
 */
export class GetPropFirmDetailsUseCase {
    constructor(
        private readonly propFirmRepository: IPropFirmRepository,
    ) { }

    /**
     * Execute the use case.
     * @param command - The command.
     * @returns The result.
     */
    async execute(command: GetPropFirmDetailsCommand): Promise<GetPropFirmDetailsResult> {
        const parsed = GetPropFirmDetailsCommand.parse(command);
        const propFirmId = parsed.propFirmId;

        const propFirm = await this.propFirmRepository.getById(propFirmId);

        if (!propFirm) {
            throw new NotFoundError(`Prop firm not found: ${propFirmId}`);
        }

        return GetPropFirmDetailsResult.parse({
            propFirm,
        });
    }
}
