import { GetPropFirmsResult } from '@src/modules/account/application/contracts/PropFirmContracts';
import { IPropFirmRepository } from '@src/modules/account/application/ports/IPropFirmRepository';

/**
 * Use case for getting prop firms.
 * @param deps - The dependencies.
 * @returns The use case.
 */
export class GetPropFirmsUseCase {
    constructor(
        private readonly propFirmRepository: IPropFirmRepository,
    ) { }

    /**
     * Execute the use case.
     * @returns The result.
     */
    async execute(): Promise<GetPropFirmsResult> {

        const propFirms = await this.propFirmRepository.getAll();

        return GetPropFirmsResult.parse({
            propFirms,
        });
    }
}
