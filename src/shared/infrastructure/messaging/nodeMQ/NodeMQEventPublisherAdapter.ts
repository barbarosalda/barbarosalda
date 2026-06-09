import type { IMessengerPublisherPort } from '@shared/application/ports/messenger/output/IMessengerPublisherPort';
import type { TransportEvent } from '@src/shared/domain/Messaging/entities/TransportEvent';
import { toTransportEventEnvelope } from '@src/shared/domain/Messaging/entities/TransportEventEnvelope';
import type { NodeMQConnection } from '@shared/infrastructure/messaging/nodeMQ/NodeMQConnectionAdapter';
import { NodeMQTopologyAdapter } from '@shared/infrastructure/messaging/nodeMQ/NodeMQTopologyAdapter';

/**
 * Infrastructure adapter that publishes events to an in-process NodeMQ channel.
 *
 * Owns wire-format encoding and is responsible for ensuring the connection is
 * open before each publish. Topology assertion is the messenger's job.
 */
export class NodeMQEventPublisher implements IMessengerPublisherPort {
  constructor(
    private readonly connection: NodeMQConnection,
    private readonly exchangeName: string = NodeMQTopologyAdapter.DEFAULT_EXCHANGE,
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

    channel.publish(this.exchangeName, routingKey, Buffer.from(JSON.stringify(envelope)), {
      contentType: 'application/json',
      persistent: true,
    });
  }
}
