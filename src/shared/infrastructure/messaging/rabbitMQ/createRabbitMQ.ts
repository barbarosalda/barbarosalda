import type { IMessengerPort } from '@shared/application/ports/messenger/output/IMessengerPort';
import { RabbitMQConnection } from './RabbitMQConnectionAdapter.ts';
import { RabbitMQMessenger } from './RabbitMQMessengerAdapter.ts';

/** RabbitMQ-backed messenger that connects lazily on first use. */
export function createRabbitMQ(): IMessengerPort {
  return new RabbitMQMessenger(new RabbitMQConnection());
}
