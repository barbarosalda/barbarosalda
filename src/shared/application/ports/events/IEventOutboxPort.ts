import type { EventIntent } from '@src/shared/domain/Event/schemas/EventIntent';

export interface IEventOutboxPort {
  enqueue(event: EventIntent): void;
  list(): EventIntent[];
  clear(): void;
}
