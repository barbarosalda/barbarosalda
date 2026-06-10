import type { ITransactionPort } from '@shared/application/ports/database/ITransactionPort';
import type { IRepositoryPort } from '@shared/application/ports/database/IRepositoryPort';
import type {
    CreatePropFirmProgramInput,
    PropFirmProgram,
    UpdatePropFirmProgramInput,
} from '../../domain/PropFirmProgram/PropFirmProgram.ts';

export interface IPropFirmProgramRepository extends IRepositoryPort<PropFirmProgram> {
    findById(id: string, tx?: ITransactionPort): Promise<PropFirmProgram | null>;
    findByPropFirmId(propFirmId: string, tx?: ITransactionPort): Promise<PropFirmProgram[]>;
    create(input: CreatePropFirmProgramInput, tx?: ITransactionPort): Promise<PropFirmProgram>;
    updateById(id: string, input: UpdatePropFirmProgramInput, tx?: ITransactionPort): Promise<PropFirmProgram>;
}
