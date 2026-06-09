import { TransportEvent } from '@src/shared/domain/Messaging/entities/TransportEvent';

/**
 * Application port for publishing outbound events.
 */
export interface IMessengerPublisherPort {
  publish(event: TransportEvent): Promise<void>;
  publishMany(events: TransportEvent[]): Promise<void>;
}
