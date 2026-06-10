import type { ITransactionPort } from '@shared/application/ports/database/ITransactionPort';
import type { IRepositoryPort } from '@shared/application/ports/database/IRepositoryPort';
import type {
    CreatePropFirmProgramStageInput,
    PropFirmProgramStage,
    UpdatePropFirmProgramStageInput,
} from '../../domain/PropFirmProgramStage/PropFirmProgramStage.ts';

export interface IPropFirmProgramStageRepository extends IRepositoryPort<PropFirmProgramStage> {
    findById(id: string, tx?: ITransactionPort): Promise<PropFirmProgramStage | null>;
    findByPropFirmProgramId(propFirmProgramId: string, tx?: ITransactionPort): Promise<PropFirmProgramStage[]>;
    create(input: CreatePropFirmProgramStageInput, tx?: ITransactionPort): Promise<PropFirmProgramStage>;
    updateById(id: string, input: UpdatePropFirmProgramStageInput, tx?: ITransactionPort): Promise<PropFirmProgramStage>;
}
