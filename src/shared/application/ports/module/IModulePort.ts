import type { ILoggerPort } from '@shared/application/ports/logger/ILoggerPort';
import type { IDatabasePort } from '@shared/application/ports/database/IDatabasePort';
import type { IUnitOfWorkPort } from '@shared/application/ports/database/IUnitOfWorkPort';
import type { IMessengerPort } from '@shared/application/ports/messenger/output/IMessengerPort';
import type { env } from '@shared/config/env';
import type { ModuleRoute } from '@shared/presentation/http/routes';

export interface ModuleSetupContext {
  database: IDatabasePort;
  unitOfWork: IUnitOfWorkPort;
  messenger: IMessengerPort;
  logger: ILoggerPort;
  config: typeof env;
}

export interface IModulePort {
  readonly name: string;
  readonly routes: ModuleRoute[];
  isReady(): boolean;
  setup(context: ModuleSetupContext): Promise<void>;
  shutdown(): Promise<void>;
}
