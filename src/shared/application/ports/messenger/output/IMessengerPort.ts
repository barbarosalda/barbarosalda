import type { IMessengerConsumerPort } from '@shared/application/ports/messenger/input/IMessengerConsumerPort';
import type { IMessengerPublisherPort } from '@shared/application/ports/messenger/output/IMessengerPublisherPort';

/**
 * Application port for the process-wide messenger.
 *
 * Bundles publishing, consumer registration, and connection lifecycle so
 * callers depend on a single abstraction instead of passing publishers
 * around.
 *
 * Channel surface — design note:
 *   Earlier iterations defined an `IMessengerChannelPort` and an
 *   `IMessengerConnectionPort` to abstract over the underlying channel.
 *   In practice, every transport (RabbitMQ topic exchange + DLX, NodeMQ's
 *   in-memory pub/sub) needs a different channel surface (assertQueue +
 *   bindQueue + consume + ack/nack vs. subscribe + unsubscribe), so the
 *   port was always too narrow and adapters silently relied on their
 *   concrete channel types.
 *
 *   We chose to **not** generalise the channel: the application layer
 *   depends only on `IMessengerPort`, and each infra adapter owns its
 *   concrete connection + channel internally. New transports implement
 *   `IMessengerPort` from scratch instead of plugging into a shared
 *   channel interface.
 */
export interface IMessengerPort extends IMessengerPublisherPort {
  /** Connect to the broker and assert the base topology. Idempotent. */
  start(): Promise<void>;

  /** Disconnect from the broker and release any consumers. Idempotent. */
  stop(): Promise<void>;

  /**
   * Register a consumer using its declared `topology`
   * (exchange + queue + routing key). Implementations are responsible
   * for asserting any required broker primitives (queue, binding,
   * subscription) before delivering events to `consumer.consume`.
   */
  registerConsumer(consumer: IMessengerConsumerPort): Promise<void>;

  /**
   * Returns `true` when the messenger has started and its underlying
   * transport is connected and ready to publish / consume.
   * Used by readiness probes.
   */
  isReady(): boolean;
}
