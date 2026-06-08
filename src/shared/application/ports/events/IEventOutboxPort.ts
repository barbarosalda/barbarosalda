import type { EventIntent } from '@shared/domain/event/schemas/EventIntent';

export interface IEventOutboxPort {
  enqueue(event: EventIntent): void;
  list(): EventIntent[];
  clear(): void;
}
