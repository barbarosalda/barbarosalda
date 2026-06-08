import type { Channel } from 'amqplib';

import type { IMessengerTopologyPort } from '@shared/application/ports/messenger/input/IMessengerTopologyPort';
import type { Topology } from '@shared/domain/messaging/entities/Topology';

/**
 * Shared infrastructure topology bootstrap for base RabbitMQ exchanges.
 *
 * Declares reusable messaging primitives:
 *   - `app.events`     — main topic exchange for application events.
 *   - `app.events.dlx` — dead-letter exchange where failed messages are routed.
 *
 * Module-specific routing rules (queue names, bindings) live with the
 * consumer that owns them, not here.
 */
export class RabbitMQTopologyAdapter implements IMessengerTopologyPort {
  /** Default application events exchange. */
  static readonly DEFAULT_EXCHANGE = 'app.events';

  /** Dead-letter exchange used by all consumer queues by default. */
  static readonly DEAD_LETTER_EXCHANGE = 'app.events.dlx';

  constructor(private readonly channel: Channel) {}

  async setup(): Promise<void> {
    await this.channel.assertExchange(RabbitMQTopologyAdapter.DEFAULT_EXCHANGE, 'topic', {
      durable: true,
    });
    await this.channel.assertExchange(RabbitMQTopologyAdapter.DEAD_LETTER_EXCHANGE, 'topic', {
      durable: true,
    });
  }

  /**
   * Assert a consumer queue and its companion dead-letter queue, then bind
   * both to their respective exchanges. Idempotent.
   *
   * The DLQ uses the convention `${queue}.dlq` and is bound to the DLX with
   * the same routing key as the main queue so each main queue has a
   * dedicated DLQ for inspection / replay.
   */
  async assertConsumerQueue(topology: Topology): Promise<void> {
    const { exchange, queue, routingKey } = topology;
    const dlq = `${queue}.dlq`;

    await this.channel.assertQueue(dlq, {
      durable: true,
    });
    await this.channel.bindQueue(dlq, RabbitMQTopologyAdapter.DEAD_LETTER_EXCHANGE, routingKey);

    await this.channel.assertQueue(queue, {
      durable: true,
      deadLetterExchange: RabbitMQTopologyAdapter.DEAD_LETTER_EXCHANGE,
      deadLetterRoutingKey: routingKey,
    });
    await this.channel.bindQueue(queue, exchange, routingKey);
  }
}
