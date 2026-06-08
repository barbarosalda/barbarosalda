import type { IMessengerConsumerPort } from '@shared/application/ports/messenger/input/IMessengerConsumerPort';
import type { IMessengerPort } from '@shared/application/ports/messenger/output/IMessengerPort';
import { LOG_MESSAGES } from '@shared/domain/logging/entities/LogMessage';
import type { TransportEvent } from '@shared/domain/messaging/entities/TransportEvent';
import { decodeTransportEvent } from '@shared/domain/messaging/messagingService';
import { Logger } from '../../logging/Logger.ts';
import { NodeMQConnection } from './NodeMQConnectionAdapter.ts';
import { NodeMQEventPublisher } from './NodeMQEventPublisherAdapter.ts';
import { NodeMQTopologyAdapter } from './NodeMQTopologyAdapter.ts';

/**
 * In-process messenger backed by NodeMQ.
 *
 * Mirrors `RabbitMQMessenger` so application code can depend on a single
 * `IMessengerPort` regardless of the configured transport.
 *
 * Routing note: subscriptions are matched by exact `exchange:routingKey`
 * string — there is no wildcard support (`#`, `*`). Any consumer that relies
 * on AMQP topic-pattern matching will behave differently here than with
 * RabbitMQ. Keep routing keys concrete and avoid wildcards to stay portable.
 */
export class NodeMQMessenger implements IMessengerPort {
  private readonly publisher: NodeMQEventPublisher;
  private readonly unsubscribers: Array<() => void> = [];

  private startPromise: Promise<void> | null = null;
  private started = false;

  constructor(
    private readonly connection: NodeMQConnection,
    private readonly exchangeName: string = NodeMQTopologyAdapter.DEFAULT_EXCHANGE,
  ) {
    this.publisher = new NodeMQEventPublisher(connection, exchangeName);
  }

  async start(): Promise<void> {
    if (this.started) return;
    if (!this.startPromise) {
      this.startPromise = this.doStart().finally(() => {
        this.startPromise = null;
      });
    }
    return this.startPromise;
  }

  async stop(): Promise<void> {
    if (!this.started) return;
    this.started = false;

    while (this.unsubscribers.length > 0) {
      const unsubscribe = this.unsubscribers.pop();
      try {
        unsubscribe?.();
      } catch (err) {
        Logger.warn(LOG_MESSAGES.MESSENGER.CONSUMER_UNSUBSCRIBE_FAILED, {
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    await this.connection.disconnect();
  }

  async publish(event: TransportEvent): Promise<void> {
    await this.start();
    await this.publisher.publish(event);
  }

  async publishMany(events: TransportEvent[]): Promise<void> {
    await this.start();
    await this.publisher.publishMany(events);
  }

  isReady(): boolean {
    return this.started && this.connection.isConnected();
  }

  async registerConsumer(consumer: IMessengerConsumerPort): Promise<void> {
    await this.start();

    const channel = this.connection.getChannel();
    const { exchange, queue, routingKey } = consumer.topology;

    const unsubscribe = channel.subscribe(exchange, routingKey, async (message) => {
      try {
        const event = decodeTransportEvent(message.content);
        await consumer.consume(event);
      } catch (err) {
        Logger.error(LOG_MESSAGES.MESSENGER.CONSUMER_FAILED, {
          exchange,
          queue,
          routingKey,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    });

    this.unsubscribers.push(unsubscribe);
  }

  private async doStart(): Promise<void> {
    await this.connection.connect();
    const topology = new NodeMQTopologyAdapter(this.connection.getChannel());
    await topology.setup();
    this.started = true;
  }
}
