import { EventEmitter } from 'node:events';

import amqp, { type Channel, type ChannelModel } from 'amqplib';

import { env } from '@shared/config/env';
import { LOG_MESSAGES } from '@shared/domain/logging/entities/LogMessage';
import { Logger } from '../../logging/Logger.ts';

export interface RabbitMQConnectionEvents {
  /** Emitted whenever a fresh connection + channel are ready (initial or reconnected). */
  connected: () => void;
  /** Emitted when the underlying connection or channel is lost. */
  disconnected: (reason: string) => void;
}

export interface RabbitMQConnectionOptions {
  /** Initial backoff delay between reconnect attempts, in ms. */
  initialBackoffMs?: number;
  /** Cap for exponential backoff, in ms. */
  maxBackoffMs?: number;
}

/**
 * Infrastructure adapter that owns RabbitMQ connection and channel lifecycle.
 *
 * Responsibilities:
 *   - Idempotent, race-safe `connect()` (single in-flight promise).
 *   - Automatic reconnection with capped exponential backoff when the broker
 *     drops the connection while the adapter is still considered "open".
 *   - Emits `'connected'` / `'disconnected'` events so higher-level adapters
 *     (messenger, consumers) can re-bootstrap their topology after a reconnect.
 *
 * Knows nothing about exchanges, queues, or business routing — those are
 * declared by the topology / messenger adapters.
 */
export class RabbitMQConnection extends EventEmitter {
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;

  private connectPromise: Promise<void> | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;

  /** When true, the adapter wants to be connected; reconnects are scheduled on close. */
  private wantOpen = false;

  private readonly initialBackoffMs: number;
  private readonly maxBackoffMs: number;

  constructor(options: RabbitMQConnectionOptions = {}) {
    super();
    this.initialBackoffMs = options.initialBackoffMs ?? 1_000;
    this.maxBackoffMs = options.maxBackoffMs ?? 30_000;
  }

  /** Open the connection and channel. Idempotent and race-safe. */
  async connect(): Promise<void> {
    this.wantOpen = true;

    if (this.connection && this.channel) {
      return;
    }

    if (!this.connectPromise) {
      this.connectPromise = this.doConnect().finally(() => {
        this.connectPromise = null;
      });
    }

    return this.connectPromise;
  }

  /**
   * Close the connection and stop any pending reconnect attempts. Idempotent.
   *
   * After `disconnect()`, the adapter will not reconnect on its own; call
   * `connect()` again to re-open.
   */
  async disconnect(): Promise<void> {
    this.wantOpen = false;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.channel) {
      try {
        await this.channel.close();
      } catch {
        // best-effort close
      }
      this.channel = null;
    }

    if (this.connection) {
      try {
        await this.connection.close();
      } catch {
        // best-effort close
      }
      this.connection = null;
    }
  }

  /** Returns `true` when the connection and channel are both live. */
  isConnected(): boolean {
    return this.connection !== null && this.channel !== null;
  }

  /**
   * Returns the live channel. Throws if the adapter is not currently open.
   *
   * Callers should not cache the returned channel across `'disconnected'` /
   * `'connected'` cycles.
   */
  getChannel(): Channel {
    if (!this.channel) {
      throw new Error('RabbitMQ channel is not initialized. Call connect() first.');
    }
    return this.channel;
  }

  private async doConnect(): Promise<void> {
    const url = env.RABBITMQ_URL;
    if (!url) {
      throw new Error('RABBITMQ_URL is not set');
    }

    this.connection = await amqp.connect(url);
    this.channel = await this.connection.createChannel();

    this.connection.on('error', (err) => {
      Logger.error(LOG_MESSAGES.RABBITMQ.CONNECTION_ERROR, { error: err.message });
    });
    this.connection.on('close', () => this.handleClose('connection closed'));

    this.channel.on('error', (err) => {
      Logger.error(LOG_MESSAGES.RABBITMQ.CHANNEL_ERROR, { error: err.message });
    });
    this.channel.on('close', () => this.handleClose('channel closed'));

    this.emit('connected');
  }

  private handleClose(reason: string): void {
    const wasOpen = this.connection !== null || this.channel !== null;
    this.connection = null;
    this.channel = null;

    if (!wasOpen) {
      return;
    }

    this.emit('disconnected', reason);

    if (!this.wantOpen) {
      return;
    }

    this.scheduleReconnect(this.initialBackoffMs);
  }

  private scheduleReconnect(delayMs: number): void {
    if (!this.wantOpen || this.reconnectTimer) {
      return;
    }

    Logger.warn(LOG_MESSAGES.RABBITMQ.RECONNECT_SCHEDULED, { delayMs });

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      void this.attemptReconnect(delayMs);
    }, delayMs);
  }

  private async attemptReconnect(previousDelayMs: number): Promise<void> {
    if (!this.wantOpen) return;

    try {
      await this.connect();
      Logger.info(LOG_MESSAGES.RABBITMQ.RECONNECT_SUCCEEDED);
    } catch (err) {
      const nextDelay = Math.min(previousDelayMs * 2, this.maxBackoffMs);
      Logger.error(LOG_MESSAGES.RABBITMQ.RECONNECT_FAILED, {
        error: err instanceof Error ? err.message : String(err),
        nextDelayMs: nextDelay,
      });
      this.scheduleReconnect(nextDelay);
    }
  }
}
