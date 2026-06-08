import pino from 'pino';

import type {
  ILoggerPort,
  LogLevel,
  LogMessage,
  LogMetadata,
} from '@shared/application/ports/logger/ILoggerPort';

/**
 * Infrastructure adapter that implements `ILoggerPort` using Pino.
 *
 * It keeps logging-library details behind the `ILoggerPort` contract.
 */
export class PinoLoggerAdapter implements ILoggerPort {
  private readonly logger;

  constructor(level: LogLevel, prettyPrint = false) {
    const usePrettyTransport = prettyPrint;

    this.logger = pino({
      level,
      ...(usePrettyTransport
        ? {
            transport: {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
              },
            },
          }
        : {}),
    });
  }

  fatal(message: LogMessage, metadata?: LogMetadata): void {
    this.logger.fatal(metadata ?? {}, message);
  }

  error(message: LogMessage, metadata?: LogMetadata): void {
    this.logger.error(metadata ?? {}, message);
  }

  warn(message: LogMessage, metadata?: LogMetadata): void {
    this.logger.warn(metadata ?? {}, message);
  }

  info(message: LogMessage, metadata?: LogMetadata): void {
    this.logger.info(metadata ?? {}, message);
  }

  debug(message: LogMessage, metadata?: LogMetadata): void {
    this.logger.debug(metadata ?? {}, message);
  }

  trace(message: LogMessage, metadata?: LogMetadata): void {
    this.logger.trace(metadata ?? {}, message);
  }
}
