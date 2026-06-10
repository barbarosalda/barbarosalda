import type { ITransactionPort } from '@shared/application/ports/database/ITransactionPort';
import type { EventIntent } from '@shared/domain/Event/schemas/EventIntent';
import type { TransportEvent } from '@shared/domain/Messaging/entities/TransportEvent';
import type { JsonValue } from '@shared/kernel/json/JsonValue';
import type { PlatformIntegrationEvent } from '@modules/integration/domain/events/PlatformIntegrationEvent';

function buildEventPayload(event: PlatformIntegrationEvent): JsonValue {
  return {
    userId: event.userId,
    providerId: event.providerId,
    providerCode: event.providerCode,
    connectionId: event.connectionId,
    tradingAccountId: event.tradingAccountId ?? null,
    providerAccountId: event.providerAccountId ?? null,
    occurredAt: event.occurredAt.toISOString(),
    data: event.payloadJson,
  };
}

export function toIntegrationEventIntent(event: PlatformIntegrationEvent): EventIntent {
  return {
    type: event.type,
    category: 'INTEGRATION',
    target: { type: 'integration_connection', id: event.connectionId },
    providerId: event.providerId,
    orderingKey: event.tradingAccountId ?? event.connectionId,
    payloadJson: buildEventPayload(event),
    rawPayloadJson: event.rawPayloadJson,
    metadataJson: {
      source: 'platform_integration',
      providerCode: event.providerCode,
    },
  };
}

export function toPlatformIntegrationTransportEvent(
  event: PlatformIntegrationEvent,
): TransportEvent {
  return {
    type: event.type,
    occurredAt: event.occurredAt,
    correlationId: event.correlationId,
    payload: buildEventPayload(event),
  };
}

export function enqueuePlatformIntegrationEvents(
  tx: ITransactionPort,
  events: PlatformIntegrationEvent[],
): void {
  for (const event of events) {
    tx.events.enqueue(toIntegrationEventIntent(event));
  }
}
