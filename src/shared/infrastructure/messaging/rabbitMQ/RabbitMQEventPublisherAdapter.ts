import type { IMessengerPublisherPort } from '@shared/application/ports/messenger/output/IMessengerPublisherPort';
import type { TransportEvent } from '@shared/domain/messaging/entities/TransportEvent';
import { toTransportEventEnvelope } from '@shared/domain/messaging/entities/TransportEventEnvelope';
import { Logger } from '../../logging/Logger.ts';
import { LOG_MESSAGES } from '@shared/domain/logging/entities/LogMessage';
import type { RabbitMQConnection } from './RabbitMQConnectionAdapter.ts';
import { RabbitMQTopologyAdapter } from './RabbitMQTopologyAdapter.ts';

/**
 * Infrastructure adapter that publishes events to RabbitMQ.
 *
 * Owns wire-format encoding and is responsible for ensuring the connection is
 * open before each publish. Topology assertion is the messenger's job.
 */
export class RabbitMQEventPublisher implements IMessengerPublisherPort {
  constructor(
    private readonly connection: RabbitMQConnection,
    private readonly exchangeName: string = RabbitMQTopologyAdapter.DEFAULT_EXCHANGE,
  ) {}

  async publish(event: TransportEvent): Promise<void> {
    await this.connection.connect();
    this.publishToChannel(event);
  }

  async publishMany(events: TransportEvent[]): Promise<void> {
    await this.connection.connect();
    for (const event of events) {
      this.publishToChannel(event);
    }
  }

  private publishToChannel(event: TransportEvent): void {
    const envelope = toTransportEventEnvelope(event);
    const channel = this.connection.getChannel();
    const routingKey = envelope.type;

    const parsedTimestamp = Date.parse(envelope.occurredAt);
    const flushed = channel.publish(
      this.exchangeName,
      routingKey,
      Buffer.from(JSON.stringify(envelope)),
      {
        contentType: 'application/json',
        persistent: true,
        messageId: envelope.id,
        ...(Number.isFinite(parsedTimestamp) ? { timestamp: parsedTimestamp } : {}),
        ...(envelope.correlationId ? { correlationId: envelope.correlationId } : {}),
      },
    );

    if (!flushed) {
      Logger.warn(LOG_MESSAGES.RABBITMQ.PUBLISH_BUFFER_FULL, {
        exchange: this.exchangeName,
        routingKey,
        messageId: envelope.id,
      });
    }
  }
}
