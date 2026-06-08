import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@src': fileURLToPath(new URL('./src', import.meta.url)),
      '@modules': fileURLToPath(new URL('./src/modules', import.meta.url)),
      '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
      '@bootstrap': fileURLToPath(new URL('./src/bootstrap', import.meta.url)),
      '@generated': fileURLToPath(new URL('./src/generated', import.meta.url)),
      '@tests': fileURLToPath(new URL('./tests', import.meta.url)),
    },
  },
  test: {
    include: ['tests/modules/**/integration/**/*.test.ts'],
    environment: 'node',
    globals: false,
    reporters: 'default',
    clearMocks: true,
  },
});
