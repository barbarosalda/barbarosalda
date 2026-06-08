import type { IMessengerPort } from '@shared/application/ports/messenger/output/IMessengerPort';
import { NodeMQConnection } from './NodeMQConnectionAdapter.ts';
import { NodeMQMessenger } from './NodeMQMessengerAdapter.ts';

/** NodeMQ-backed messenger that connects lazily on first use. */
export function createNodeMQ(): IMessengerPort {
  return new NodeMQMessenger(new NodeMQConnection());
}
