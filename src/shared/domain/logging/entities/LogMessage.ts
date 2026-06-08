/**
 * Reusable log messages for runtime and infrastructure events.
 *
 * Keep these stable so logs stay searchable across adapters and deployments.
 */
export const LOG_MESSAGES = {
  APPLICATION: {
    STARTING: 'Starting application',
    SHUTDOWN_SIGNAL_RECEIVED: 'Received shutdown signal',
    SHUTDOWN_COMPLETE: 'Shutdown complete',
    FATAL_STARTUP_FAILURE: 'Fatal startup failure',
    FATAL_SHUTDOWN_FAILURE: 'Fatal shutdown failure',
    HTTP_SERVER_LISTENING: 'HTTP server listening',
    HTTP_UNHANDLED_ERROR: 'Unhandled HTTP error',
    HTTP_SERVER_START_FAILED: 'HTTP server start failed',
    HTTP_SERVER_STOP_FAILED: 'HTTP server stop failed',
    MODULE_SETUP: 'Module setup',
    MODULE_SETUP_FAILED: 'Module setup failed',
    MODULE_SHUTDOWN: 'Module shutdown',
    MODULE_SHUTDOWN_FAILED: 'Module shutdown failed',
  },
  DATABASE: {
    STARTED: 'Database started',
    START_FAILED: 'Database startup failed',
    DISCONNECT_FAILED: 'Database disconnect failed',
  },
  MESSENGER: {
    START_FAILED: 'Messenger startup failed',
    STOP_FAILED: 'Messenger stop failed',
    CONSUMER_FAILED: 'Messenger consumer failed',
    CONSUMER_FAILED_DLQ: 'Messenger consumer failed; routing to DLQ',
    CONSUMER_UNSUBSCRIBE_FAILED: 'Failed to unsubscribe NodeMQ consumer',
  },
  PROCESS: {
    UNCAUGHT_EXCEPTION: 'Uncaught exception',
    UNHANDLED_REJECTION: 'Unhandled rejection',
  },
  RABBITMQ: {
    CHANNEL_ERROR: 'RabbitMQ channel error',
    PUBLISH_BUFFER_FULL: 'RabbitMQ write buffer full; message may be delayed',
    CONNECTION_ERROR: 'RabbitMQ connection error',
    CONSUMER_CANCEL_FAILED: 'Failed to cancel RabbitMQ consumer',
    CONSUMERS_REREGISTERED: 'Re-registered RabbitMQ consumers after reconnect',
    CONSUMERS_REREGISTER_FAILED: 'Failed to re-register RabbitMQ consumers after reconnect',
    RECONNECT_SCHEDULED: 'Scheduling RabbitMQ reconnect',
    RECONNECT_SUCCEEDED: 'RabbitMQ reconnected',
    RECONNECT_FAILED: 'RabbitMQ reconnect attempt failed',
  },
} as const;

type LeafValues<T> = T extends string ? T : T extends Record<string, unknown> ? LeafValues<T[keyof T]> : never;

export type StandardLogMessage = LeafValues<typeof LOG_MESSAGES>;
export type LogMessage = StandardLogMessage | (string & {});
