import type { IMessengerPort } from '@shared/application/ports/messenger/output/IMessengerPort';
import { RabbitMQConnection } from '@shared/infrastructure/messaging/rabbitMQ/RabbitMQConnectionAdapter';
import { RabbitMQMessenger } from '@shared/infrastructure/messaging/rabbitMQ/RabbitMQMessengerAdapter';

/** RabbitMQ-backed messenger that connects lazily on first use. */
export function createRabbitMQ(): IMessengerPort {
  return new RabbitMQMessenger(new RabbitMQConnection());
}
