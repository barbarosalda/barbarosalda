import type { IMessengerPublisherPort } from '@shared/application/ports/messenger/output/IMessengerPublisherPort';
import type { TransportEvent } from '@src/shared/domain/Messaging/entities/TransportEvent';
import { toTransportEventEnvelope } from '@src/shared/domain/Messaging/entities/TransportEventEnvelope';
import { Logger } from '@shared/infrastructure/logging/Logger';
import { LOG_MESSAGES } from '@src/shared/domain/Logging/entities/LogMessage';
import type { RabbitMQConnection } from '@shared/infrastructure/messaging/rabbitMQ/RabbitMQConnectionAdapter';
import { RabbitMQTopologyAdapter } from '@shared/infrastructure/messaging/rabbitMQ/RabbitMQTopologyAdapter';

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
