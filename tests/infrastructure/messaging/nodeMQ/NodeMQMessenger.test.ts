import { describe, expect, it } from 'vitest';

import type { IMessengerConsumerPort } from '@shared/application/ports/messenger/input/IMessengerConsumerPort.ts';
import type { TransportEvent } from '@shared/domain/messaging/entities/TransportEvent.ts';
import { NodeMQConnection } from '@shared/infrastructure/messaging/nodeMQ/NodeMQConnectionAdapter.ts';
import { NodeMQMessenger } from '@shared/infrastructure/messaging/nodeMQ/NodeMQMessengerAdapter.ts';
import { NodeMQTopologyAdapter } from '@shared/infrastructure/messaging/nodeMQ/NodeMQTopologyAdapter.ts';

const flushMicrotasks = () => new Promise<void>((resolve) => setImmediate(resolve));

function buildMessenger(): NodeMQMessenger {
  return new NodeMQMessenger(new NodeMQConnection());
}

describe('NodeMQMessenger', () => {
  it('delivers a published event to a registered consumer', async () => {
    const messenger = buildMessenger();
    const received: TransportEvent[] = [];

    const consumer: IMessengerConsumerPort = {
      topology: {
        exchange: NodeMQTopologyAdapter.DEFAULT_EXCHANGE,
        queue: 'test.queue',
        routingKey: 'test.thing.happened',
      },
      consume(event) {
        received.push(event);
      },
    };

    await messenger.registerConsumer(consumer);
    await messenger.publish({
      type: 'test.thing.happened',
      occurredAt: new Date(),
      payload: { hello: 'world' },
    });

    await flushMicrotasks();

    expect(received).toHaveLength(1);
    expect(received[0]?.type).toBe('test.thing.happened');
    expect(received[0]?.payload).toEqual({ hello: 'world' });

    await messenger.stop();
  });

  it('start() is race-safe under concurrent calls', async () => {
    const messenger = buildMessenger();

    await Promise.all([messenger.start(), messenger.start(), messenger.start()]);
    // A second start after the first finishes should be a no-op.
    await messenger.start();

    await messenger.stop();
  });

  it('stop() unsubscribes consumers so further publishes are ignored', async () => {
    const messenger = buildMessenger();
    const received: TransportEvent[] = [];

    await messenger.registerConsumer({
      topology: {
        exchange: NodeMQTopologyAdapter.DEFAULT_EXCHANGE,
        queue: 'test.queue.stop',
        routingKey: 'test.unsub',
      },
      consume(event) {
        received.push(event);
      },
    });

    await messenger.publish({
      type: 'test.unsub',
      occurredAt: new Date(),
      payload: { n: 1 },
    });
    await flushMicrotasks();
    expect(received).toHaveLength(1);

    await messenger.stop();

    // Re-start the messenger so a publish does not throw "channel not initialized".
    await messenger.start();
    await messenger.publish({
      type: 'test.unsub',
      occurredAt: new Date(),
      payload: { n: 2 },
    });
    await flushMicrotasks();

    // Old consumer was unsubscribed by stop(), so no new delivery.
    expect(received).toHaveLength(1);

    await messenger.stop();
  });

  it('isolates messages by routing key', async () => {
    const messenger = buildMessenger();
    const a: TransportEvent[] = [];
    const b: TransportEvent[] = [];

    await messenger.registerConsumer({
      topology: {
        exchange: NodeMQTopologyAdapter.DEFAULT_EXCHANGE,
        queue: 'q.a',
        routingKey: 'evt.a',
      },
      consume(event) {
        a.push(event);
      },
    });
    await messenger.registerConsumer({
      topology: {
        exchange: NodeMQTopologyAdapter.DEFAULT_EXCHANGE,
        queue: 'q.b',
        routingKey: 'evt.b',
      },
      consume(event) {
        b.push(event);
      },
    });

    await messenger.publish({ type: 'evt.a', occurredAt: new Date(), payload: 1 });
    await messenger.publish({ type: 'evt.b', occurredAt: new Date(), payload: 2 });
    await flushMicrotasks();

    expect(a.map((e) => e.type)).toEqual(['evt.a']);
    expect(b.map((e) => e.type)).toEqual(['evt.b']);

    await messenger.stop();
  });
});
