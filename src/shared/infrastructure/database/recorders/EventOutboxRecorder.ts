import type { IEventOutboxPort } from '@shared/application/ports/events/IEventOutboxPort';
import { EventIntentSchema, type EventIntent } from '@src/shared/domain/Event/schemas/EventIntent';

export class EventOutboxRecorder implements IEventOutboxPort {
  private readonly events: EventIntent[] = [];

  enqueue(event: EventIntent): void {
    const parsedEvent = EventIntentSchema.parse(event);
    this.events.push(parsedEvent);
  }

  list(): EventIntent[] {
    return [...this.events];
  }

  clear(): void {
    this.events.length = 0;
  }
}
