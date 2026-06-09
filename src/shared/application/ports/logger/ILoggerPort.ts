import type { LogMessage } from '@src/shared/domain/Logging/entities/LogMessage';
import type { LogMetadata } from '@src/shared/domain/Logging/entities/LogMetadata';

export { LOG_LEVELS, type LogLevel } from '@src/shared/domain/Logging/entities/LogLevel';
export type { LogEntry } from '@src/shared/domain/Logging/entities/LogEntry';
export type {
  LogMessage,
  StandardLogMessage,
} from '@src/shared/domain/Logging/entities/LogMessage';
export type { LogMetadata } from '@src/shared/domain/Logging/entities/LogMetadata';

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
