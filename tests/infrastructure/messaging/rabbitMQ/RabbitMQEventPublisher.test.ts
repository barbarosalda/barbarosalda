import { describe, expect, it, vi } from 'vitest';

import { TransportEventEnvelopeSchema } from '@shared/domain/messaging/entities/TransportEventEnvelope.ts';
import type { RabbitMQConnection } from '@shared/infrastructure/messaging/rabbitMQ/RabbitMQConnectionAdapter.ts';
import { RabbitMQEventPublisher } from '@shared/infrastructure/messaging/rabbitMQ/RabbitMQEventPublisherAdapter.ts';
import { RabbitMQTopologyAdapter } from '@shared/infrastructure/messaging/rabbitMQ/RabbitMQTopologyAdapter.ts';

interface CapturedPublish {
  exchange: string;
  routingKey: string;
  body: unknown;
  options: Record<string, unknown> | undefined;
}

function buildFakeConnection(captured: CapturedPublish[]): RabbitMQConnection {
  const channel = {
    publish(
      exchange: string,
      routingKey: string,
      content: Buffer,
      options?: Record<string, unknown>,
    ) {
      captured.push({
        exchange,
        routingKey,
        body: JSON.parse(content.toString('utf-8')),
        options,
      });
      return true;
    },
  };

  return {
    connect: vi.fn(async () => undefined),
    getChannel: () => channel,
  } as unknown as RabbitMQConnection;
}

describe('RabbitMQEventPublisher', () => {
  it('publishes envelopes to the default exchange with the event type as routing key', async () => {
    const captured: CapturedPublish[] = [];
    const connection = buildFakeConnection(captured);
    const publisher = new RabbitMQEventPublisher(connection);

    await publisher.publish({
      type: 'user.created',
      occurredAt: new Date('2026-05-08T15:00:00.000Z'),
      payload: { id: 'u-1' },
      correlationId: 'corr-9',
    });

    expect(captured).toHaveLength(1);
    const [hit] = captured;
    expect(hit?.exchange).toBe(RabbitMQTopologyAdapter.DEFAULT_EXCHANGE);
    expect(hit?.routingKey).toBe('user.created');
    expect(hit?.options).toMatchObject({
      contentType: 'application/json',
      persistent: true,
      correlationId: 'corr-9',
    });

    const envelope = TransportEventEnvelopeSchema.parse(hit?.body);
    expect(envelope.type).toBe('user.created');
    expect(envelope.occurredAt).toBe('2026-05-08T15:00:00.000Z');
    expect(envelope.payload).toEqual({ id: 'u-1' });
    expect(envelope.correlationId).toBe('corr-9');
  });

  it('connects before publishMany and emits one publish per event', async () => {
    const captured: CapturedPublish[] = [];
    const connection = buildFakeConnection(captured);
    const publisher = new RabbitMQEventPublisher(connection);

    await publisher.publishMany([
      { type: 'evt.a', occurredAt: new Date(), payload: 1 },
      { type: 'evt.b', occurredAt: new Date(), payload: 2 },
    ]);

    expect(connection.connect).toHaveBeenCalled();
    expect(captured.map((c) => c.routingKey)).toEqual(['evt.a', 'evt.b']);
  });
});
