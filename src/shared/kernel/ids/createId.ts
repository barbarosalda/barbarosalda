import { monotonicFactory } from 'ulid';

const createMonotonicUlid = monotonicFactory();

export function createId(prefix: string): string {
  const normalizedPrefix = prefix.trim();
  if (!normalizedPrefix) {
    throw new Error('ID prefix must be a non-empty string');
  }

  return `${normalizedPrefix}_${createMonotonicUlid()}`;
}
