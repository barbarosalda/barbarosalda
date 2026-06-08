import type { LogLevel } from './LogLevel.ts';
import type { LogMessage } from './LogMessage.ts';
import type { LogMetadata } from './LogMetadata.ts';

/**
 * Normalized log payload before it is handed to an adapter.
 */
export type LogEntry = {
  level: LogLevel;
  message: LogMessage;
  metadata?: LogMetadata;
  occurredAt?: Date;
};
