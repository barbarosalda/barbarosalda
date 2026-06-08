import { config } from 'dotenv';
import { z } from 'zod';

config();

const booleanFromEnv = z.union([z.boolean(), z.string()]).transform((value) => {
  if (typeof value === 'boolean') {
    return value;
  }

  return value.toLowerCase() === 'true';
});

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(3000),
    DATABASE_URL: z.string().min(1),
    AUTH_PROVIDER: z.enum(['cognito', 'dev']).default('cognito'),
    COGNITO_REGION: z.string().min(1).optional(),
    COGNITO_USER_POOL_ID: z.string().min(1).optional(),
    COGNITO_CLIENT_ID: z.string().min(1).optional(),
    COGNITO_ISSUER: z.string().url().optional(),
    /**
     * Comma-separated list of allowed CORS origins (e.g. "https://app.example.com,https://admin.example.com").
     * Leave unset or empty to allow all origins (development only).
     */
    CORS_ORIGINS: z
      .string()
      .default('')
      .transform((v) => v.split(',').map((s) => s.trim()).filter(Boolean)),
    RABBITMQ_URL: z.string().min(1).optional(),
    MESSENGER: z.enum(['rabbitmq', 'node']).optional(),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
    LOG_PRETTY: booleanFromEnv.default(false),
    LOGGER: z.enum(['pino', 'console']).default('pino'),
  })
  .superRefine((data, ctx) => {
    if (data.AUTH_PROVIDER === 'dev' && data.NODE_ENV === 'production') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'AUTH_PROVIDER=dev is forbidden when NODE_ENV=production',
        path: ['AUTH_PROVIDER'],
      });
    }

    if (data.AUTH_PROVIDER === 'cognito') {
      if (!data.COGNITO_REGION) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'COGNITO_REGION is required when AUTH_PROVIDER is cognito',
          path: ['COGNITO_REGION'],
        });
      }

      if (!data.COGNITO_USER_POOL_ID) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'COGNITO_USER_POOL_ID is required when AUTH_PROVIDER is cognito',
          path: ['COGNITO_USER_POOL_ID'],
        });
      }

      if (!data.COGNITO_CLIENT_ID) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'COGNITO_CLIENT_ID is required when AUTH_PROVIDER is cognito',
          path: ['COGNITO_CLIENT_ID'],
        });
      }
    }

    if (data.MESSENGER === 'rabbitmq' && !data.RABBITMQ_URL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'RABBITMQ_URL is required when MESSENGER is rabbitmq',
        path: ['RABBITMQ_URL'],
      });
    }

  });

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  throw new Error(`Invalid environment configuration: ${parsedEnv.error.message}`);
}

/**
 * Validated runtime environment configuration.
 */
export const env = parsedEnv.data;
