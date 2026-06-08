import type { Topology } from '@shared/domain/messaging/entities/Topology';
import type { TransportEvent } from '@shared/domain/messaging/entities/TransportEvent';

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
