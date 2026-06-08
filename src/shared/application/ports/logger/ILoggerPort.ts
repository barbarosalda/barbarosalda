import type { LogMessage } from '@shared/domain/logging/entities/LogMessage';
import type { LogMetadata } from '@shared/domain/logging/entities/LogMetadata';

export { LOG_LEVELS, type LogLevel } from '@shared/domain/logging/entities/LogLevel';
export type { LogEntry } from '@shared/domain/logging/entities/LogEntry';
export type {
  LogMessage,
  StandardLogMessage,
} from '@shared/domain/logging/entities/LogMessage';
export type { LogMetadata } from '@shared/domain/logging/entities/LogMetadata';

/**
 * Contract for structured logging used across runtime components.
 */
export interface ILoggerPort {
  fatal(message: LogMessage, metadata?: LogMetadata): void;
  error(message: LogMessage, metadata?: LogMetadata): void;
  warn(message: LogMessage, metadata?: LogMetadata): void;
  info(message: LogMessage, metadata?: LogMetadata): void;
  debug(message: LogMessage, metadata?: LogMetadata): void;
  trace(message: LogMessage, metadata?: LogMetadata): void;
}
