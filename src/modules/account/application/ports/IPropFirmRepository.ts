import type { ITransactionPort } from '@shared/application/ports/database/ITransactionPort';
import type { IRepositoryPort } from '@shared/application/ports/database/IRepositoryPort';
import type {
    CreatePropFirmInput,
    PropFirm,
    PropFirmWithProgramsAndStages,
    UpdatePropFirmInput,
} from '../../domain/PropFirm/PropFirm.ts';

export interface IPropFirmRepository extends IRepositoryPort<PropFirm> {
    getAll(tx?: ITransactionPort): Promise<PropFirm[]>;
    getById(id: string, tx?: ITransactionPort): Promise<PropFirmWithProgramsAndStages | null>;
    create(input: CreatePropFirmInput, tx?: ITransactionPort): Promise<PropFirm>;
    updateById(id: string, input: UpdatePropFirmInput, tx?: ITransactionPort): Promise<PropFirm>;
}
