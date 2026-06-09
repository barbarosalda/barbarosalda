import type { PrismaClient } from '@generated/prisma/client';

import type { IDatabasePort } from '@shared/application/ports/database/IDatabasePort';
import { LOG_MESSAGES } from '@src/shared/domain/Logging/entities/LogMessage';
import { Logger } from '@shared/infrastructure/logging/Logger';
import { prismaClient } from '@shared/infrastructure/database/prisma/prismaClient';

export class PrismaDatabaseAdapter implements IDatabasePort {
  private readonly client: PrismaClient;
  private ready = false;
  private startPromise: Promise<void> | null = null;

  constructor(client: PrismaClient = prismaClient) {
    this.client = client;
  }

  async start(): Promise<void> {
    if (this.ready) return;
    if (!this.startPromise) {
      this.startPromise = this.doStart().finally(() => {
        this.startPromise = null;
      });
    }

    await this.startPromise;
  }

  async stop(): Promise<void> {
    if (this.startPromise) {
      try {
        await this.startPromise;
      } catch {
        // start failure already handled by caller/logging path
      }
    }

    if (!this.ready) return;

    try {
      await this.client.$disconnect();
    } catch (err) {
      Logger.error(LOG_MESSAGES.DATABASE.DISCONNECT_FAILED, {
        error: err instanceof Error ? err.message : String(err),
      });
    } finally {
      this.ready = false;
    }
  }

  isReady(): boolean {
    return this.ready;
  }

  getClient(): PrismaClient {
    return this.client;
  }

  private async doStart(): Promise<void> {
    try {
      await this.client.$connect();
      await this.client.$queryRaw`SELECT 1`;
      this.ready = true;
      Logger.info(LOG_MESSAGES.DATABASE.STARTED);
    } catch (err) {
      this.ready = false;
      Logger.error(LOG_MESSAGES.DATABASE.START_FAILED, {
        error: err instanceof Error ? err.message : String(err),
      });
      try {
        await this.client.$disconnect();
      } catch {
        // best-effort cleanup when start fails
      }
      throw err;
    }
  }
}
