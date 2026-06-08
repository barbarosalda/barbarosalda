import { describe, expect, it } from 'vitest';

import {
  TransportEventEnvelopeSchema,
  toTransportEventEnvelope,
} from '@shared/domain/messaging/entities/TransportEventEnvelope.ts';
import type { TransportEvent } from '@shared/domain/messaging/entities/TransportEvent.ts';

describe('toTransportEventEnvelope', () => {
  const baseEvent: TransportEvent = {
    type: 'user.created',
    occurredAt: new Date('2026-05-08T13:00:00.000Z'),
    payload: { id: 'u-1' },
  };

  it('normalises occurredAt to ISO-8601 and defaults version to 1', () => {
    const envelope = toTransportEventEnvelope(baseEvent);

    expect(envelope.type).toBe('user.created');
    expect(envelope.version).toBe(1);
    expect(envelope.occurredAt).toBe('2026-05-08T13:00:00.000Z');
    expect(envelope.payload).toEqual({ id: 'u-1' });
  });

  it('honours an explicit version', () => {
    const envelope = toTransportEventEnvelope({ ...baseEvent, version: 7 });
    expect(envelope.version).toBe(7);
  });

  it('only sets correlationId when provided', () => {
    const without = toTransportEventEnvelope(baseEvent);
    expect(without.correlationId).toBeUndefined();

    const withId = toTransportEventEnvelope({ ...baseEvent, correlationId: 'c-1' });
    expect(withId.correlationId).toBe('c-1');
  });

  it('allocates a fresh id per call', () => {
    const a = toTransportEventEnvelope(baseEvent);
    const b = toTransportEventEnvelope(baseEvent);
    expect(a.id).not.toBe(b.id);
    expect(a.id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('produces an envelope that satisfies its own schema', () => {
    const envelope = toTransportEventEnvelope({ ...baseEvent, correlationId: 'c-1' });
    expect(() => TransportEventEnvelopeSchema.parse(envelope)).not.toThrow();
  });
});
