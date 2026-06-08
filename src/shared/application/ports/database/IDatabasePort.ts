import type { PrismaClient } from '@generated/prisma/client';

export interface IDatabasePort {
  start(): Promise<void>;
  stop(): Promise<void>;
  isReady(): boolean;
  getClient(): PrismaClient;
}
