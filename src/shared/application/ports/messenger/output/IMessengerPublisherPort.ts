import { TransportEvent } from '@shared/domain/messaging/entities/TransportEvent';

/**
 * Application port for publishing outbound events.
 */
export interface IMessengerPublisherPort {
  publish(event: TransportEvent): Promise<void>;
  publishMany(events: TransportEvent[]): Promise<void>;
}
