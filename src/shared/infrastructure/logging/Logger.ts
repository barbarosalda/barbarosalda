import type { ILoggerPort } from '../../application/ports/logger/ILoggerPort.ts';
import { env } from '../../config/env.ts';
import { ConsoleLoggerAdapter } from './console/ConsoleLoggerAdapter.ts';
import { PinoLoggerAdapter } from './pino/PinoLoggerAdapter.ts';

function createLogger(): ILoggerPort {
  if (env.LOGGER === 'console') {
    return new ConsoleLoggerAdapter(env.LOG_LEVEL);
  }

  return new PinoLoggerAdapter(env.LOG_LEVEL, env.LOG_PRETTY);
}

let instance: ILoggerPort | undefined;

/**
 * Process-wide logger facade typed as `ILoggerPort`.
 *
 * The underlying adapter (Pino or console, driven by env) is built lazily
 * on first call and cached. Because `Logger` *is* an `ILoggerPort`,
 * extending the port (e.g. adding `fatal`/`trace`) requires no changes
 * here — calls forward straight to the adapter.
 */
export const Logger: ILoggerPort = new Proxy({} as ILoggerPort, {
  get(_target, prop, receiver) {
    instance ??= createLogger();
    const value = Reflect.get(instance, prop, receiver);
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});
