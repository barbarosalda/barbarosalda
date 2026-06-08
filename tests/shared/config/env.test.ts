import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const ORIGINAL_ENV = { ...process.env };

function setRequiredBaseEnv(): void {
  process.env['DATABASE_URL'] = 'postgresql://traderlock:traderlock@localhost:5432/traderlock_dev?schema=public';
}

describe('env configuration', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it('accepts cognito-shaped auth env config', async () => {
    setRequiredBaseEnv();
    process.env['NODE_ENV'] = 'test';
    process.env['AUTH_PROVIDER'] = 'cognito';
    process.env['COGNITO_REGION'] = 'eu-west-1';
    process.env['COGNITO_USER_POOL_ID'] = 'eu-west-1_example';
    process.env['COGNITO_CLIENT_ID'] = 'example-client-id';

    const envModule = await import('@shared/config/env.ts');

    expect(envModule.env.AUTH_PROVIDER).toBe('cognito');
    expect(envModule.env.COGNITO_REGION).toBe('eu-west-1');
    expect(envModule.env.COGNITO_USER_POOL_ID).toBe('eu-west-1_example');
    expect(envModule.env.COGNITO_CLIENT_ID).toBe('example-client-id');
  });

  it('accepts dev auth without cognito env vars', async () => {
    setRequiredBaseEnv();
    process.env['NODE_ENV'] = 'test';
    process.env['AUTH_PROVIDER'] = 'dev';
    delete process.env['COGNITO_REGION'];
    delete process.env['COGNITO_USER_POOL_ID'];
    delete process.env['COGNITO_CLIENT_ID'];
    delete process.env['COGNITO_ISSUER'];

    const envModule = await import('@shared/config/env.ts');

    expect(envModule.env.AUTH_PROVIDER).toBe('dev');
  });

  it('rejects dev auth in production', async () => {
    setRequiredBaseEnv();
    process.env['NODE_ENV'] = 'production';
    process.env['AUTH_PROVIDER'] = 'dev';

    await expect(import('@shared/config/env.ts')).rejects.toThrow(
      'AUTH_PROVIDER=dev is forbidden when NODE_ENV=production',
    );
  });
});
