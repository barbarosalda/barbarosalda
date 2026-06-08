import {
  LOG_LEVELS,
  type ILoggerPort,
  type LogLevel,
  type LogMessage,
  type LogMetadata,
} from '@shared/application/ports/logger/ILoggerPort';

/**
 * Infrastructure adapter that implements `ILoggerPort` using `console`.
 *
 * Honors the configured level so behaviour matches `PinoLoggerAdapter`.
 * Levels are ordered by `LOG_LEVELS`: silent < fatal < error < warn < info < debug < trace.
 */
export class ConsoleLoggerAdapter implements ILoggerPort {
  private readonly threshold: number;

  constructor(level: LogLevel = 'info') {
    this.threshold = LOG_LEVELS.indexOf(level);
  }

  fatal(message: LogMessage, metadata?: LogMetadata): void {
    if (!this.isEnabled('fatal')) return;
    console.error(`[FATAL] ${message}`, metadata);
  }

  error(message: LogMessage, metadata?: LogMetadata): void {
    if (!this.isEnabled('error')) return;
    console.error(message, metadata);
  }

  warn(message: LogMessage, metadata?: LogMetadata): void {
    if (!this.isEnabled('warn')) return;
    console.warn(message, metadata);
  }

  info(message: LogMessage, metadata?: LogMetadata): void {
    if (!this.isEnabled('info')) return;
    console.info(message, metadata);
  }

  debug(message: LogMessage, metadata?: LogMetadata): void {
    if (!this.isEnabled('debug')) return;
    console.debug(message, metadata);
  }

  trace(message: LogMessage, metadata?: LogMetadata): void {
    if (!this.isEnabled('trace')) return;
    console.debug(`[TRACE] ${message}`, metadata);
  }

  private isEnabled(level: LogLevel): boolean {
    return LOG_LEVELS.indexOf(level) <= this.threshold;
  }
}
