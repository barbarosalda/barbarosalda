import type { IPropFirmRepository } from '@modules/account/application/ports/IPropFirmRepository';
import type {
  CreatePropFirmInput,
  PropFirm,
  PropFirmWithProgramsAndStages,
  UpdatePropFirmInput,
} from '@modules/account/domain/PropFirm/PropFirm';
import {
  toDomainPropFirm,
  toDomainPropFirmWithProgramsAndStages,
  toPrismaPropFirmCreateData,
  toPrismaPropFirmUpdateData,
} from '@modules/account/infrastructure/repository/AccountPrismaMapper';
import type { IDatabasePort } from '@shared/application/ports/database/IDatabasePort';
import type { ITransactionPort } from '@shared/application/ports/database/ITransactionPort';
import { getPrismaClient } from '@shared/infrastructure/database/prisma/getPrismaClient';
import { createId } from '@shared/kernel/ids/createId';

const PROP_FIRM_ID_PREFIX = 'pfm';

/**
 * Adapter for the prop firm repository.
 */
export class PropFirmPrismaRepositoryAdapter implements IPropFirmRepository {
  /**
   * Constructor for the prop firm repository adapter.
   * @param database - The database to use.
   */
  constructor(private readonly database: IDatabasePort) {}

  /**
   * Finds a prop firm by its ID.
   * @param id - The ID of the prop firm.
   * @param tx - The transaction to use.
   * @returns The prop firm.
   */
  async findById(id: string, tx?: ITransactionPort): Promise<PropFirm | null> {
    const client = getPrismaClient(this.database, tx);
    const row = await client.propFirm.findUnique({ where: { id } });
    return row ? toDomainPropFirm(row) : null;
  }

  /**
   * Gets all prop firms.
   * @param tx - The transaction to use.
   * @returns The prop firms.
   */
  async getAll(tx?: ITransactionPort): Promise<PropFirm[]> {
    const client = getPrismaClient(this.database, tx);
    const rows = await client.propFirm.findMany({ orderBy: { name: 'asc' } });
    return rows.map(toDomainPropFirm);
  }

  /**
   * Gets a prop firm by its ID.
   * @param id - The ID of the prop firm.
   * @param tx - The transaction to use.
   * @returns The prop firm.
   */
  async getById(
    id: string,
    tx?: ITransactionPort,
  ): Promise<PropFirmWithProgramsAndStages | null> {
    const client = getPrismaClient(this.database, tx);
    const row = await client.propFirm.findUnique({
      where: { id },
      include: {
        programs: {
          include: {
            stages: {
              orderBy: { sequence_order: 'asc' },
            },
          },
          orderBy: { name: 'asc' },
        },
      },
    });
    return row ? toDomainPropFirmWithProgramsAndStages(row) : null;
  }

  /**
   * Creates a new prop firm.
   * @param input - The input to create the prop firm.
   * @param tx - The transaction to use.
   * @returns The created prop firm.
   */
  async create(input: CreatePropFirmInput, tx?: ITransactionPort): Promise<PropFirm> {
    const client = getPrismaClient(this.database, tx);
    const row = await client.propFirm.create({
      data: toPrismaPropFirmCreateData(input, createId(PROP_FIRM_ID_PREFIX)),
    });
    return toDomainPropFirm(row);
  }

  /**
   * Updates a prop firm by its ID.
   * @param id - The ID of the prop firm.
   * @param input - The input to update the prop firm.
   * @param tx - The transaction to use.
   * @returns The updated prop firm.
   */
  async updateById(
    id: string,
    input: UpdatePropFirmInput,
    tx?: ITransactionPort,
  ): Promise<PropFirm> {
    const client = getPrismaClient(this.database, tx);
    const row = await client.propFirm.update({
      where: { id },
      data: toPrismaPropFirmUpdateData(input),
    });
    return toDomainPropFirm(row);
  }
}
