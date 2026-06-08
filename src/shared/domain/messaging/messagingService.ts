import { TransportEvent } from './entities/TransportEvent.ts';
import { TransportEventEnvelopeSchema } from './entities/TransportEventEnvelope.ts';

/**
 * Decode a transport envelope buffer (as produced by the publishers) back
 * into a `TransportEvent` ready for consumer handlers.
 *
 * Validates the envelope shape with Zod and throws if the payload is not a
 * valid envelope, so adapters can route bad messages to a DLQ.
 */
export function decodeTransportEvent(content: Buffer): TransportEvent {
  let raw: unknown;
  try {
    raw = JSON.parse(content.toString('utf-8'));
  } catch (cause) {
    throw new Error('Invalid transport envelope: not valid JSON', { cause });
  }

  const envelope = TransportEventEnvelopeSchema.parse(raw);

  const event: TransportEvent = {
    type: envelope.type,
    version: envelope.version,
    occurredAt: new Date(envelope.occurredAt),
    payload: envelope.payload,
  };

  if (envelope.correlationId) {
    event.correlationId = envelope.correlationId;
  }

  return event;
}
