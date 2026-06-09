import type { Topology } from '@src/shared/domain/Messaging/entities/Topology';
import type { TransportEvent } from '@src/shared/domain/Messaging/entities/TransportEvent';

/**
 * Module-side contract for handling transport events.
 *
 * The `topology` is the single source of truth for where the consumer
 * binds in the broker (exchange + queue + routing key). Adapters use it
 * for both AMQP-style brokers (queue assert + binding) and pubsub-style
 * brokers (subscription by routing key).
 */
export interface IMessengerConsumerPort {
  topology: Topology;
  consume(event: TransportEvent): void | Promise<void>;
}
