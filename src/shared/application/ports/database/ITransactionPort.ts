import type { IChangeRecorderPort } from '@shared/application/ports/audit/IChangeRecorderPort';
import type { IEventOutboxPort } from '@shared/application/ports/events/IEventOutboxPort';

export interface ITransactionPort {
  changes: IChangeRecorderPort;
  events: IEventOutboxPort;
}
