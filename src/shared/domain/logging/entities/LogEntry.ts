import type { LogLevel } from '@shared/domain/Logging/entities/LogLevel';
import type { LogMessage } from '@shared/domain/Logging/entities/LogMessage';
import type { LogMetadata } from '@shared/domain/Logging/entities/LogMetadata';

/**
 * Normalized log payload before it is handed to an adapter.
 */
export type LogEntry = {
  level: LogLevel;
  message: LogMessage;
  metadata?: LogMetadata;
  occurredAt?: Date;
};
