import { EventEmitter } from 'node:events';

type NodeMQMessage = {
  exchange: string;
  routingKey: string;
  content: Buffer;
  options?: { contentType?: string; persistent?: boolean };
};

type NodeMQMessageHandler = (message: NodeMQMessage) => void | Promise<void>;

/**
 * Channel surface for the in-process NodeMQ transport.
 *
 * Mirrors the subset of `amqplib.Channel` that the NodeMQ adapters need:
 *   - `publish` for fan-out by routing key.
 *   - `subscribe` returning an unsubscribe function (vs. `consume` + tags).
 *   - `assertExchange` purely for parity with the RabbitMQ contract.
 *   - `close` to release any listeners on shutdown.
 *
 * The message and handler shapes are file-private — callers interact with
 * them only by passing function literals to `subscribe`, where the parameter
 * type is inferred.
 */
export interface NodeMQTopologyChannelPort {
  publish(
    exchange: string,
    routingKey: string,
    content: Buffer,
    options?: { contentType?: string; persistent?: boolean },
  ): boolean;
  assertExchange(exchange: string, type: 'topic', options?: { durable?: boolean }): Promise<void>;
  subscribe(exchange: string, routingKey: string, handler: NodeMQMessageHandler): () => void;
  close(): void;
}

export class NodeMQChannel implements NodeMQTopologyChannelPort {
  private readonly emitter = new EventEmitter();
  private readonly exchanges = new Set<string>();

  async assertExchange(exchange: string): Promise<void> {
    this.exchanges.add(exchange);
  }

  publish(
    exchange: string,
    routingKey: string,
    content: Buffer,
    options?: { contentType?: string; persistent?: boolean },
  ): boolean {
    if (!this.exchanges.has(exchange)) {
      throw new Error(`NodeMQ exchange "${exchange}" has not been asserted`);
    }

    const message: NodeMQMessage = { exchange, routingKey, content, options };
    queueMicrotask(() => {
      this.emitter.emit(this.eventName(exchange, routingKey), message);
    });

    return true;
  }

  subscribe(exchange: string, routingKey: string, handler: NodeMQMessageHandler): () => void {
    const eventName = this.eventName(exchange, routingKey);
    this.emitter.on(eventName, handler);

    return () => {
      this.emitter.off(eventName, handler);
    };
  }

  close(): void {
    this.exchanges.clear();
    this.emitter.removeAllListeners();
  }

  private eventName(exchange: string, routingKey: string): string {
    return `${exchange}:${routingKey}`;
  }
}
