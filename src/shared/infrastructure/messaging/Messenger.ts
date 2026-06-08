import type { IMessengerPort } from '../../application/ports/messenger/output/IMessengerPort.ts';
import { env } from '../../config/env.ts';
import { createNodeMQ } from './nodeMQ/createNodeMQ.ts';
import { createRabbitMQ } from './rabbitMQ/createRabbitMQ.ts';

function createMessenger(): IMessengerPort {
  if (env.MESSENGER === 'rabbitmq') {
    return createRabbitMQ();
  }

  return createNodeMQ();
}

/**
 * Internal lifecycle controller for the process-wide messenger.
 */
class MessengerLifecycle {
  private static instance: IMessengerPort | undefined;
  private static starting: Promise<void> | undefined;
  private static stopping: Promise<void> | undefined;

  static async start(): Promise<void> {
    if (MessengerLifecycle.instance !== undefined) return;

    if (MessengerLifecycle.starting !== undefined) {
      await MessengerLifecycle.starting;
      return;
    }

    MessengerLifecycle.starting = (async () => {
      const messenger = createMessenger();
      await messenger.start();
      MessengerLifecycle.instance = messenger;
    })().finally(() => {
      MessengerLifecycle.starting = undefined;
    });

    await MessengerLifecycle.starting;
  }

  static async stop(): Promise<void> {
    if (MessengerLifecycle.stopping !== undefined) {
      await MessengerLifecycle.stopping;
      return;
    }

    const messenger = MessengerLifecycle.instance;
    if (messenger === undefined) return;

    MessengerLifecycle.stopping = messenger.stop().finally(() => {
      MessengerLifecycle.instance = undefined;
      MessengerLifecycle.stopping = undefined;
    });

    await MessengerLifecycle.stopping;
  }

  static isReady(): boolean {
    return MessengerLifecycle.instance?.isReady() ?? false;
  }

  static require(prop: string | symbol): IMessengerPort {
    if (MessengerLifecycle.instance === undefined) {
      throw new Error(`Messenger.${String(prop)} accessed before Messenger.start() completed`);
    }

    return MessengerLifecycle.instance;
  }
}

/**
 * Process-wide messenger facade typed as `IMessengerPort`.
 */
export const Messenger: IMessengerPort = new Proxy({} as IMessengerPort, {
  get(_target, prop, receiver) {
    if (prop === 'start') return MessengerLifecycle.start;
    if (prop === 'stop') return MessengerLifecycle.stop;
    if (prop === 'isReady') return MessengerLifecycle.isReady;

    const instance = MessengerLifecycle.require(prop);
    const value = Reflect.get(instance, prop, receiver);
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});
