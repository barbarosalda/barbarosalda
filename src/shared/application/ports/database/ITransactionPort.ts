import type { IChangeRecorderPort } from '../audit/IChangeRecorderPort.ts';
import type { IEventOutboxPort } from '../events/IEventOutboxPort.ts';

export interface ITransactionPort {
  changes: IChangeRecorderPort;
  events: IEventOutboxPort;
}
