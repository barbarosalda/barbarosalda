import { describe, expect, it } from 'vitest';

import type { TransportEvent } from '@shared/domain/messaging/entities/TransportEvent.ts';
import { toTransportEventEnvelope } from '@shared/domain/messaging/entities/TransportEventEnvelope.ts';
import { decodeTransportEvent } from '@shared/domain/messaging/messagingService.ts';

describe('decodeTransportEvent', () => {
  it('round-trips a TransportEvent through its envelope', () => {
    const original: TransportEvent = {
      type: 'order.placed',
      occurredAt: new Date('2026-05-08T13:30:00.000Z'),
      payload: { orderId: 'o-1', total: 42 },
      correlationId: 'corr-123',
    };

    const envelope = toTransportEventEnvelope(original);
    const buffer = Buffer.from(JSON.stringify(envelope));

    const decoded = decodeTransportEvent(buffer);

    expect(decoded.type).toBe(original.type);
    expect(decoded.payload).toEqual(original.payload);
    expect(decoded.correlationId).toBe(original.correlationId);
    expect(decoded.occurredAt.toISOString()).toBe(original.occurredAt.toISOString());
    expect(decoded.version).toBe(1);
  });

  it('throws on invalid JSON', () => {
    expect(() => decodeTransportEvent(Buffer.from('not-json'))).toThrowError(/not valid JSON/i);
  });

  it('throws when the envelope is missing required fields', () => {
    const invalid = { type: '', payload: {} };
    expect(() => decodeTransportEvent(Buffer.from(JSON.stringify(invalid)))).toThrow();
  });

  it('throws when occurredAt is not a valid ISO-8601 datetime', () => {
    const invalid = {
      id: 'a',
      type: 't',
      version: 1,
      occurredAt: 'definitely not a date',
      payload: {},
    };
    expect(() => decodeTransportEvent(Buffer.from(JSON.stringify(invalid)))).toThrow();
  });
});
