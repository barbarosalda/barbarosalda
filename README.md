# TraderLock Node Server

A TypeScript Node.js server using a lean DDD / hexagonal shape with explicit application lifecycle booting.

## Lifecycle

The application boots in this order:

1. Validate environment config.
2. Start the database.
3. Start the messenger.
4. Setup registered modules.
5. Build and start the HTTP server.

The application shuts down in reverse order:

1. Stop HTTP server.
2. Shutdown only modules that completed setup.
3. Stop messenger.
4. Stop database.

This keeps startup failures safe: if a module fails during setup, only the infrastructure and modules that already started are cleaned up.

## Module registration

Modules are registered in:

```txt
src/shared/config/registeredModules.ts
```

A module must implement:

```ts
interface IModulePort {
  readonly name: string;
  readonly routes: ModuleRoute[];
  isReady(): boolean;
  setup(context: ModuleSetupContext): Promise<void>;
  shutdown(): Promise<void>;
}
```

The production HTTP server mounts routes only after module setup is complete.

## Commands

```bash
npm install
npm run typecheck
npm run lint
npm test
npm run build
npm run dev
```

## Local infrastructure

```bash
npm run db:up
npm run prisma:migrate:dev
npm run dev
```

Use `MESSENGER=node` for local development. Use `MESSENGER=rabbitmq` only when RabbitMQ is running and `RABBITMQ_URL` is configured.
