import { randomUUID } from 'node:crypto';

import { z } from 'zod';

import type { TransportEvent } from '@shared/domain/Messaging/entities/TransportEvent';

/**
 * Zod schema for the on-the-wire envelope. Validates inbound payloads at the
 * transport boundary so consumers can rely on the parsed shape.
 */
export const TransportEventEnvelopeSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  version: z.number().int().nonnegative(),
  occurredAt: z.string().datetime({ offset: true }),
  payload: z.unknown(),
  correlationId: z.string().min(1).optional(),
});

/**
 * Wire format envelope for published events (JSON-serializable).
 */
export type TransportEventEnvelope = z.infer<typeof TransportEventEnvelopeSchema>;

/**
 * Wrap a `TransportEvent` into its wire-format envelope.
 *
 * Allocates a fresh envelope id, defaults the version to `1`, and
 * normalises `occurredAt` to ISO-8601. Inverse of `decodeTransportEvent`.
 */
export function toTransportEventEnvelope(event: TransportEvent): TransportEventEnvelope {
  const envelope: TransportEventEnvelope = {
    id: randomUUID(),
    type: event.type,
    version: event.version ?? 1,
    occurredAt: event.occurredAt.toISOString(),
    payload: event.payload,
  };

  if (event.correlationId) {
    envelope.correlationId = event.correlationId;
  }

  return envelope;
}
