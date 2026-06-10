import type { IPropFirmProgramStageRepository } from '@modules/account/application/ports/IPropFirmProgramStageRepository';
import type {
  CreatePropFirmProgramStageInput,
  PropFirmProgramStage,
  UpdatePropFirmProgramStageInput,
} from '@modules/account/domain/PropFirmProgramStage/PropFirmProgramStage';
import {
  toDomainPropFirmProgramStage,
  toPrismaPropFirmProgramStageCreateData,
  toPrismaPropFirmProgramStageUpdateData,
} from '@modules/account/infrastructure/repository/AccountPrismaMapper';
import type { IDatabasePort } from '@shared/application/ports/database/IDatabasePort';
import type { ITransactionPort } from '@shared/application/ports/database/ITransactionPort';
import { getPrismaClient } from '@shared/infrastructure/database/prisma/getPrismaClient';
import { createId } from '@shared/kernel/ids/createId';

const PROP_FIRM_PROGRAM_STAGE_ID_PREFIX = 'pfs';

/**
 * Adapter for the prop firm program stage repository.
 */
export class PropFirmProgramStagePrismaRepositoryAdapter implements IPropFirmProgramStageRepository {
  /**
   * Constructor for the prop firm program stage repository adapter.
   * @param database - The database to use.
   */
  constructor(private readonly database: IDatabasePort) {}

  /**
   * Finds a prop firm program stage by its ID.
   * @param id - The ID of the prop firm program stage.
   * @param tx - The transaction to use.
   * @returns The prop firm program stage.
   */
  async findById(id: string, tx?: ITransactionPort): Promise<PropFirmProgramStage | null> {
    const client = getPrismaClient(this.database, tx);
    const row = await client.propFirmProgramStage.findUnique({ where: { id } });
    return row ? toDomainPropFirmProgramStage(row) : null;
  }

  /**
   * Finds prop firm program stages by their prop firm program ID.
   * @param propFirmProgramId - The ID of the prop firm program.
   * @param tx - The transaction to use.
   * @returns The prop firm program stages.
   */
  async findByPropFirmProgramId(
    propFirmProgramId: string,
    tx?: ITransactionPort,
  ): Promise<PropFirmProgramStage[]> {
    const client = getPrismaClient(this.database, tx);
    const rows = await client.propFirmProgramStage.findMany({
      where: { program_id: propFirmProgramId },
      orderBy: { sequence_order: 'asc' },
    });
    return rows.map(toDomainPropFirmProgramStage);
  }

  /**
   * Creates a new prop firm program stage.
   * @param input - The input to create the prop firm program stage.
   * @param tx - The transaction to use.
   * @returns The created prop firm program stage.
   */
  async create(
    input: CreatePropFirmProgramStageInput,
    tx?: ITransactionPort,
  ): Promise<PropFirmProgramStage> {
    const client = getPrismaClient(this.database, tx);
    const row = await client.propFirmProgramStage.create({
      data: toPrismaPropFirmProgramStageCreateData(
        input,
        createId(PROP_FIRM_PROGRAM_STAGE_ID_PREFIX),
      ),
    });
    return toDomainPropFirmProgramStage(row);
  }

  /**
   * Updates a prop firm program stage by its ID.
   * @param id - The ID of the prop firm program stage.
   * @param input - The input to update the prop firm program stage.
   * @param tx - The transaction to use.
   * @returns The updated prop firm program stage.
   */
  async updateById(
    id: string,
    input: UpdatePropFirmProgramStageInput,
    tx?: ITransactionPort,
  ): Promise<PropFirmProgramStage> {
    const client = getPrismaClient(this.database, tx);
    const row = await client.propFirmProgramStage.update({
      where: { id },
      data: toPrismaPropFirmProgramStageUpdateData(input),
    });
    return toDomainPropFirmProgramStage(row);
  }
}
