# Local Infrastructure (Databases)

This project requires only PostgreSQL for local infrastructure right now.

## Node version recommendation

- Node 22+ is recommended for Prisma 7 compatibility.
- Node 20 may still work, but it can emit `@prisma/streams-local` engine warnings during npm installs.

## Start development PostgreSQL (port 5432)

```bash
npm run db:up
```

Alternative:

```bash
docker compose up -d postgres
```

## Start test PostgreSQL (port 5433)

```bash
npm run db:test:up
```

Alternative:

```bash
docker compose up -d postgres_test
```

The `postgres_test` service uses `tmpfs`, so it is disposable and data is lost when the container stops.

## Apply migrations to test DB

Use the test environment URL and deploy migrations before running DB integration tests:

```bash
npm run prisma:migrate:test
```

This runs `prisma migrate deploy` against `.env.test`.

## Stop PostgreSQL services

```bash
npm run db:down
```

## Follow PostgreSQL logs

Development DB:

```bash
npm run db:logs
```

Test DB:

```bash
npm run db:test:logs
```

## Database URLs

Development URL in `.env`:

```bash
DATABASE_URL=postgresql://traderlock:traderlock@localhost:5432/traderlock_dev?schema=public
```

Test URL in `.env.test`:

```bash
DATABASE_URL=postgresql://traderlock:traderlock@localhost:5433/traderlock_test?schema=public
```

## App runtime

- The Node app still runs locally via existing npm scripts (`npm run dev`, `npm test`, etc.).
- RabbitMQ integration is intentionally deferred.
- Messenger should remain on NodeMQ/default (`MESSENGER=node` or unset).

## Test strategy with local infrastructure

- `npm test` runs unit tests only and does not require Docker.
- `npm run test:integration` is opt-in, loads `.env.test`, and requires `postgres_test` to be running.
- Integration tests are module-local under `tests/modules/<module>/integration/` (for example `tests/modules/user/integration/UserHttp.integration.test.ts`).
- HTTP integration tests use `supertest` against `createHttpApp` and do not open a real HTTP port.
- Running `vitest` directly against integration files without loading `.env.test` may fail the DB safety guard when `DATABASE_URL` is not the test DB URL.
- Recommended DB integration flow:

```bash
npm run db:test:up
npm run prisma:migrate:test
npm run test:integration
```
