import type { Topology } from '@shared/domain/messaging/entities/Topology';

/**
 * Contract for broker topology declarations (exchanges, queues, bindings).
 *
 * Rules for implementations:
 * - All methods must be idempotent: repeated calls should be safe (AMQP assert semantics).
 * - Implementations declare infrastructure only; no business validation, HTTP, or I/O beyond the broker channel.
 * - Exchange, queue, and routing-key names are exposed as `Topology` constants
 *   (typically `static readonly` on the class or module-level constants colocated with it),
 *   so consumers and publishers reference a single source of truth.
 * - Construction receives an open channel; callers invoke `setup` after the connection is ready.
 * - `assertConsumerQueue` is a no-op for in-process transports that have no queue concept.
 */
export interface IMessengerTopologyPort {
  setup(): Promise<void>;
  assertConsumerQueue(topology: Topology): Promise<void>;
}
