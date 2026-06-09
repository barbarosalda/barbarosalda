import { describe, expect, it } from 'vitest';

import { TransportEventEnvelopeSchema } from '@shared/domain/Messaging/entities/TransportEventEnvelope';
import { NodeMQConnection } from '@shared/infrastructure/messaging/nodeMQ/NodeMQConnectionAdapter';
import { NodeMQEventPublisher } from '@shared/infrastructure/messaging/nodeMQ/NodeMQEventPublisherAdapter';
import { NodeMQTopologyAdapter } from '@shared/infrastructure/messaging/nodeMQ/NodeMQTopologyAdapter';

const flushMicrotasks = () => new Promise<void>((resolve) => setImmediate(resolve));

describe('NodeMQEventPublisher', () => {
  it('publishes a JSON envelope to the channel for the event type', async () => {
    const connection = new NodeMQConnection();
    await connection.connect();
    const channel = connection.getChannel();
    const topology = new NodeMQTopologyAdapter(channel);
    await topology.setup();

    const exchange = NodeMQTopologyAdapter.DEFAULT_EXCHANGE;
    const captured: { exchange: string; routingKey: string; envelope: unknown }[] = [];
    channel.subscribe(exchange, 'evt.x', (message) => {
      captured.push({
        exchange: message.exchange,
        routingKey: message.routingKey,
        envelope: JSON.parse(message.content.toString('utf-8')),
      });
    });

    const publisher = new NodeMQEventPublisher(connection);
    await publisher.publish({
      type: 'evt.x',
      occurredAt: new Date('2026-05-08T14:00:00.000Z'),
      payload: { hello: 'there' },
      correlationId: 'c-1',
    });
    await flushMicrotasks();

    expect(captured).toHaveLength(1);
    const [hit] = captured;
    expect(hit?.exchange).toBe(exchange);
    expect(hit?.routingKey).toBe('evt.x');

    const envelope = TransportEventEnvelopeSchema.parse(hit?.envelope);
    expect(envelope.type).toBe('evt.x');
    expect(envelope.occurredAt).toBe('2026-05-08T14:00:00.000Z');
    expect(envelope.correlationId).toBe('c-1');
    expect(envelope.payload).toEqual({ hello: 'there' });

    await connection.disconnect();
  });

  it('publishMany sends one envelope per event', async () => {
    const connection = new NodeMQConnection();
    await connection.connect();
    const channel = connection.getChannel();
    await new NodeMQTopologyAdapter(channel).setup();

    const seen: string[] = [];
    channel.subscribe(NodeMQTopologyAdapter.DEFAULT_EXCHANGE, 'evt.many', (m) => {
      seen.push(m.routingKey);
    });

    const publisher = new NodeMQEventPublisher(connection);
    await publisher.publishMany([
      { type: 'evt.many', occurredAt: new Date(), payload: 1 },
      { type: 'evt.many', occurredAt: new Date(), payload: 2 },
      { type: 'evt.many', occurredAt: new Date(), payload: 3 },
    ]);
    await flushMicrotasks();

    expect(seen).toEqual(['evt.many', 'evt.many', 'evt.many']);

    await connection.disconnect();
  });
});
