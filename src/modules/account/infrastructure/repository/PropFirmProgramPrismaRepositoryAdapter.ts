import type { IPropFirmProgramRepository } from '@modules/account/application/ports/IPropFirmProgramRepository';
import type {
  CreatePropFirmProgramInput,
  PropFirmProgram,
  UpdatePropFirmProgramInput,
} from '@modules/account/domain/PropFirmProgram/PropFirmProgram';
import {
  toDomainPropFirmProgram,
  toPrismaPropFirmProgramCreateData,
  toPrismaPropFirmProgramUpdateData,
} from '@modules/account/infrastructure/repository/AccountPrismaMapper';
import type { IDatabasePort } from '@shared/application/ports/database/IDatabasePort';
import type { ITransactionPort } from '@shared/application/ports/database/ITransactionPort';
import { getPrismaClient } from '@shared/infrastructure/database/prisma/getPrismaClient';
import { createId } from '@shared/kernel/ids/createId';

const PROP_FIRM_PROGRAM_ID_PREFIX = 'pfp';

/**
 * Adapter for the prop firm program repository.
 */
export class PropFirmProgramPrismaRepositoryAdapter implements IPropFirmProgramRepository {
  /**
   * Constructor for the prop firm program repository adapter.
   * @param database - The database to use.
   */
  constructor(private readonly database: IDatabasePort) {}

  /**
   * Finds a prop firm program by its ID.
   * @param id - The ID of the prop firm program.
   * @param tx - The transaction to use.
   * @returns The prop firm program.
   */
  async findById(id: string, tx?: ITransactionPort): Promise<PropFirmProgram | null> {
    const client = getPrismaClient(this.database, tx);
    const row = await client.propFirmProgram.findUnique({ where: { id } });
    return row ? toDomainPropFirmProgram(row) : null;
  }

  /**
   * Finds prop firm programs by their prop firm ID.
   * @param propFirmId - The ID of the prop firm.
   * @param tx - The transaction to use.
   * @returns The prop firm programs.
   */
  async findByPropFirmId(
    propFirmId: string,
    tx?: ITransactionPort,
  ): Promise<PropFirmProgram[]> {
    const client = getPrismaClient(this.database, tx);
    const rows = await client.propFirmProgram.findMany({
      where: { prop_firm_id: propFirmId },
      orderBy: { name: 'asc' },
    });
    return rows.map(toDomainPropFirmProgram);
  }

  /**
   * Creates a new prop firm program.
   * @param input - The input to create the prop firm program.
   * @param tx - The transaction to use.
   * @returns The created prop firm program.
   */
  async create(
    input: CreatePropFirmProgramInput,
    tx?: ITransactionPort,
  ): Promise<PropFirmProgram> {
    const client = getPrismaClient(this.database, tx);
    const row = await client.propFirmProgram.create({
      data: toPrismaPropFirmProgramCreateData(input, createId(PROP_FIRM_PROGRAM_ID_PREFIX)),
    });
    return toDomainPropFirmProgram(row);
  }

  /**
   * Updates a prop firm program by its ID.
   * @param id - The ID of the prop firm program.
   * @param input - The input to update the prop firm program.
   * @param tx - The transaction to use.
   * @returns The updated prop firm program.
   */
  async updateById(
    id: string,
    input: UpdatePropFirmProgramInput,
    tx?: ITransactionPort,
  ): Promise<PropFirmProgram> {
    const client = getPrismaClient(this.database, tx);
    const row = await client.propFirmProgram.update({
      where: { id },
      data: toPrismaPropFirmProgramUpdateData(input),
    });
    return toDomainPropFirmProgram(row);
  }
}
