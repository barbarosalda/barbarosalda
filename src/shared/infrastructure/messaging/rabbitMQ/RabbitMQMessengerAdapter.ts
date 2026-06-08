import type { IMessengerConsumerPort } from '@shared/application/ports/messenger/input/IMessengerConsumerPort';
import type { IMessengerPort } from '@shared/application/ports/messenger/output/IMessengerPort';
import { LOG_MESSAGES } from '@shared/domain/logging/entities/LogMessage';
import type { TransportEvent } from '@shared/domain/messaging/entities/TransportEvent';
import { decodeTransportEvent } from '@shared/domain/messaging/messagingService';
import { Logger } from '../../logging/Logger.ts';
import { RabbitMQConnection } from './RabbitMQConnectionAdapter.ts';
import { RabbitMQEventPublisher } from './RabbitMQEventPublisherAdapter.ts';
import { RabbitMQTopologyAdapter } from './RabbitMQTopologyAdapter.ts';

interface RegisteredConsumer {
  consumer: IMessengerConsumerPort;
  /** Latest consumer tag from the broker; `null` while not currently bound. */
  consumerTag: string | null;
}

/**
 * RabbitMQ-backed messenger.
 *
 * Composes the connection, topology and publisher adapters into a single
 * `IMessengerPort` so callers can publish events and register consumers
 * without knowing about the underlying broker.
 *
 * Reconnect behaviour: when the underlying connection is lost, the messenger
 * re-asserts topology and re-binds every previously registered consumer once
 * the connection is restored.
 */
export class RabbitMQMessenger implements IMessengerPort {
  private readonly publisher: RabbitMQEventPublisher;
  private readonly consumers: RegisteredConsumer[] = [];

  private startPromise: Promise<void> | null = null;
  private started = false;
  private boundReconnectHandler: (() => void) | null = null;

  constructor(
    private readonly connection: RabbitMQConnection,
    private readonly exchangeName: string = RabbitMQTopologyAdapter.DEFAULT_EXCHANGE,
  ) {
    this.publisher = new RabbitMQEventPublisher(connection, exchangeName);
  }

  /** Connect, assert topology, and arm the reconnect handler. Idempotent + race-safe. */
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

    if (this.boundReconnectHandler) {
      this.connection.off('connected', this.boundReconnectHandler);
      this.boundReconnectHandler = null;
    }

    await this.cancelAllConsumers();
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

    const registered: RegisteredConsumer = { consumer, consumerTag: null };
    this.consumers.push(registered);

    await this.bindConsumer(registered);
  }

  private async doStart(): Promise<void> {
    await this.connection.connect();
    await this.assertTopology();

    this.boundReconnectHandler = () => {
      void this.handleReconnect();
    };
    this.connection.on('connected', this.boundReconnectHandler);

    this.started = true;
  }

  private async assertTopology(): Promise<void> {
    const topology = new RabbitMQTopologyAdapter(this.connection.getChannel());
    await topology.setup();
  }

  private async bindConsumer(registered: RegisteredConsumer): Promise<void> {
    const channel = this.connection.getChannel();
    const topology = new RabbitMQTopologyAdapter(channel);
    const { exchange, queue, routingKey } = registered.consumer.topology;

    await topology.assertConsumerQueue(registered.consumer.topology);

    const { consumerTag } = await channel.consume(queue, async (msg) => {
      if (!msg) return;

      try {
        const event = decodeTransportEvent(msg.content);
        await registered.consumer.consume(event);
        channel.ack(msg);
      } catch (err) {
        Logger.error(LOG_MESSAGES.MESSENGER.CONSUMER_FAILED_DLQ, {
          exchange,
          queue,
          routingKey,
          error: err instanceof Error ? err.message : String(err),
        });
        // requeue=false => message goes through the queue's deadLetterExchange.
        channel.nack(msg, false, false);
      }
    });

    registered.consumerTag = consumerTag;
  }

  private async cancelAllConsumers(): Promise<void> {
    if (this.consumers.length === 0) return;

    let channel;
    try {
      channel = this.connection.getChannel();
    } catch {
      // Connection already gone — nothing to cancel.
      for (const registered of this.consumers) registered.consumerTag = null;
      return;
    }

    await Promise.allSettled(
      this.consumers.map(async (registered) => {
        if (!registered.consumerTag) return;
        try {
          await channel.cancel(registered.consumerTag);
        } catch (err) {
          Logger.warn(LOG_MESSAGES.RABBITMQ.CONSUMER_CANCEL_FAILED, {
            consumerTag: registered.consumerTag,
            error: err instanceof Error ? err.message : String(err),
          });
        } finally {
          registered.consumerTag = null;
        }
      }),
    );
  }

  private async handleReconnect(): Promise<void> {
    if (!this.started) return;

    try {
      await this.assertTopology();

      for (const registered of this.consumers) {
        registered.consumerTag = null;
        await this.bindConsumer(registered);
      }

      Logger.info(LOG_MESSAGES.RABBITMQ.CONSUMERS_REREGISTERED, {
        count: this.consumers.length,
      });
    } catch (err) {
      Logger.error(LOG_MESSAGES.RABBITMQ.CONSUMERS_REREGISTER_FAILED, {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
}
