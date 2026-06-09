import type { IMessengerTopologyPort } from '@shared/application/ports/messenger/input/IMessengerTopologyPort';
import type { Topology } from '@src/shared/domain/Messaging/entities/Topology';
import type { NodeMQTopologyChannelPort } from '@shared/infrastructure/messaging/nodeMQ/NodeMQChannel';

/**
 * Shared infrastructure topology bootstrap for base NodeMQ exchanges.
 *
 * This class defines reusable messaging primitives and should not contain module-specific routing rules.
 */
export class NodeMQTopologyAdapter implements IMessengerTopologyPort {
  /**
   * Default application events exchange.
   */
  static readonly DEFAULT_EXCHANGE = 'app.events';

  constructor(private readonly channel: NodeMQTopologyChannelPort) {}

  /**
   * Setup the base topology and future queues.
   */
  async setup(): Promise<void> {
    await this.setupBaseTopology();
    await this.setupFutureQueues();
  }

  async setupBaseTopology(): Promise<void> {
    await this.channel.assertExchange(NodeMQTopologyAdapter.DEFAULT_EXCHANGE, 'topic', {
      durable: true,
    });
  }

  async setupFutureQueues(): Promise<void> {
    return Promise.resolve();
  }

  async assertConsumerQueue(_topology: Topology): Promise<void> {
    // In-process transport has no queue concept; intentional no-op.
  }
}
