import { IDatabasePort } from '@src/shared/application/ports/database/IDatabasePort';
import { PrismaDatabaseAdapter } from './prisma/adapters/PrismaDatabaseAdapter.ts';

function createDatabase(): IDatabasePort {
  return new PrismaDatabaseAdapter();
}

let instance: IDatabasePort | undefined;

/**
 * Process-wide database facade typed as `IDatabasePort`.
 *
 * The underlying adapter (Prisma) is built lazily
 * on first call and cached.
 */
export const Database: IDatabasePort = new Proxy({} as IDatabasePort, {
  get(_target, prop, receiver) {
    instance ??= createDatabase();
    const value = Reflect.get(instance, prop, receiver);
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});
