import type { IMessengerPort } from '@shared/application/ports/messenger/output/IMessengerPort';
import { NodeMQConnection } from '@shared/infrastructure/messaging/nodeMQ/NodeMQConnectionAdapter';
import { NodeMQMessenger } from '@shared/infrastructure/messaging/nodeMQ/NodeMQMessengerAdapter';

/** NodeMQ-backed messenger that connects lazily on first use. */
export function createNodeMQ(): IMessengerPort {
  return new NodeMQMessenger(new NodeMQConnection());
}
