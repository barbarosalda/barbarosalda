import {
  NodeMQChannel,
  type NodeMQTopologyChannelPort,
} from '@shared/infrastructure/messaging/nodeMQ/NodeMQChannel';

/**
 * In-process connection adapter with the same lifecycle shape as RabbitMQ.
 *
 * It should only manage technical connectivity and channel lifecycle.
 */
export class NodeMQConnection {
  private readonly channel = new NodeMQChannel();
  private connectPromise: Promise<void> | null = null;
  private connected = false;

  /** Idempotent and race-safe. */
  async connect(): Promise<void> {
    if (this.connected) return;
    if (!this.connectPromise) {
      this.connectPromise = Promise.resolve().then(() => {
        this.connected = true;
      });
    }
    return this.connectPromise.finally(() => {
      this.connectPromise = null;
    });
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.channel.close();
  }

  isConnected(): boolean {
    return this.connected;
  }

  getChannel(): NodeMQTopologyChannelPort {
    if (!this.connected) {
      throw new Error('NodeMQ channel is not initialized. Call connect() first.');
    }
    return this.channel;
  }
}
