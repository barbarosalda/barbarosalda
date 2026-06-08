# Database First Slice Architecture (v1)

## Purpose

This document defines the first durable database implementation slice for TraderLock backend. It sets practical, implementation-oriented boundaries so the team can deliver one vertical slice safely without committing to the full future schema.

This is an architecture decision and execution guide only. Runtime code, Prisma schema files, and Docker app packaging are intentionally out of scope here.

## Database Stack Decision

- **Primary stack for v1:** PostgreSQL + Prisma.
- **Physical DB contract:** Prisma schema + migrations.
- **Module/application contract:** domain Zod models owned by each module.
- **Prisma-to-Zod generation:** may be introduced later, but only inside infrastructure. Generated artifacts must not become module-level contracts.

## First Implementation Slice Scope

Only the following tables are included in the first slice:

- `users`
- `user_preferences`
- `events`
- `audit_logs`

The full TraderLock schema is explicitly deferred.

## Clean Architecture Boundaries

- **Shared layer**
  - Owns base contracts and cross-cutting primitives only (for example context, json primitives, id conventions, audit base types).
  - Does not own concrete module entities.
- **Module layer**
  - Owns concrete domain models, repository ports, and use-case contracts.
  - Exposes module-specific schemas/types in camelCase.
- **Infrastructure layer**
  - Owns concrete repository implementations, UnitOfWork adapters, and mapping logic.
  - Translates domain/application objects to persistence models.

### Naming Conventions Across Boundaries

- Database columns and tables use `snake_case`.
- TypeScript/domain/application models use `camelCase`.
- Infrastructure mappers perform explicit translation in both directions.

## Repository + UnitOfWork Contract

ORM replaceability is constrained to the repository + UnitOfWork boundary.

- Use repository interfaces in module/application code.
- Use explicit transaction passing through `ITransactionPort`.
- Every UnitOfWork execution requires an `OperationContext`.
- Repositories and use cases may call:
  - `tx.changes.record(...)`
  - `tx.events.enqueue(...)`

This keeps business orchestration independent from Prisma while still allowing strong transaction semantics.

## Audit Design

- `audit_logs` is append-only.
- Modules must not insert directly into `audit_logs`.
- Repositories/use cases record `AuditChangeIntent` during transaction work.
- UnitOfWork flushes audit intents into `audit_logs` before commit.
- If audit persistence fails, the entire transaction rolls back.
- Audit snapshots must conform to shared `AuditSnapshot`.

Each model file may export:

- its own audit snapshot schema,
- its own snapshot factory,
- model-specific audit action constants.

This allows strict per-model audit shape while preserving a shared base audit contract.

## Events Design (Durable Workflow/Outbox Foundation)

- `events` table is the durable source for workflow/outbox.
- Messenger is transport-only and not the source of truth.
- NodeMQ remains default transport for now.
- RabbitMQ is deferred.
- `EventOutboxDispatcher` is deferred until the first UnitOfWork + audit + events slice is proven.
- First slice guarantee: `tx.events.enqueue(...)` persists durable event rows in the same transaction.
- `events` rows are append-mostly; only processing metadata can be updated post-insert.

## Auth Field Decision for `users`

Add neutral external identity fields now:

- `external_auth_provider`
- `external_auth_user_id`

Add a unique constraint on (`external_auth_provider`, `external_auth_user_id`).

Deferred:

- auth flow implementation,
- auth provider SDK integration,
- `auth_identities` table,
- provider-specific fields such as `clerk_user_id` or `auth0_user_id`.

## IDs and Timestamps

- IDs are prefixed, time-sortable string identifiers stored as `TEXT`.
- IDs are generated in shared code before insert.
- Prefix examples:
  - `user_...`
  - `pref_...`
  - `evt_...`
  - `aud_...`

Timestamp ownership:

- Database/Prisma controls `created_at` and `updated_at`.
- Domain exposes `createdAt` and `updatedAt`.
- Audit snapshots serialize date values as ISO strings.

## JSON Field Policy

- Application/domain uses shared `JsonValueSchema`.
- Persistence stores JSON as Prisma `Json` mapped to PostgreSQL `JSONB`.
- First-slice JSON field examples:
  - `metadata_json`
  - `payload_json`
  - `raw_payload_json`
  - `before_json`
  - `after_json`
  - `diff_json`

## Module Composition Rule

Each module has a composition root file: `{module}.module.ts`.

Example:

- `src/modules/user/user.module.ts`

Responsibilities of module composition files:

- wire repositories,
- wire use cases,
- wire controllers,
- wire consumers,
- wire lifecycle hooks.

Constraints:

- no business logic in composition files,
- modules receive shared dependencies through `ModuleSetupContext`,
- modules do not import shared infrastructure singletons directly.

## Local Infrastructure Decision

- Use Docker Compose only for PostgreSQL at this stage.
- Do not Dockerize the Node application yet.
- Keep Messenger on NodeMQ by default.
- RabbitMQ may be added later behind a Docker Compose profile.

## First Vertical Slice Target (Acceptance Criteria)

The first real implementation must prove all of the following in one transactional flow:

1. create user,
2. create user preferences,
3. record audit log via `tx.changes.record(...)`,
4. enqueue durable event via `tx.events.enqueue(...)`,
5. commit all writes in one transaction,
6. roll back all writes if audit/event persistence fails.

## Out of scope for this slice

- auth implementation,
- RabbitMQ,
- `EventOutboxDispatcher`,
- full rule/risk engine,
- billing/licenses,
- trading integrations,
- full TraderLock database schema,
- Prisma-to-Zod generator.

## Implemented state

### Completed files/components

- PostgreSQL + Prisma 7 are active in the first DB slice (`package.json`, `prisma/`, `docker-compose.yml`).
- Prisma Client generation is configured and output to `src/generated/prisma`.
- Prisma usage is constrained to infrastructure and Prisma-focused integration testing.
- First migration is implemented for:
  - `users`
  - `user_preferences`
  - `events`
  - `audit_logs`
- Shared contracts are implemented and used by the first slice:
  - `OperationContext`
  - `AuditSnapshot`
  - `AuditChangeIntent`
  - `EventIntent`
  - `JsonValue`
- `ModuleSetupContext` is defined in `src/shared/application/ports/module/IModulePort.ts`.
- Core DB adapters are implemented:
  - `PrismaDatabaseAdapter` (`IDatabasePort`)
  - `PrismaUnitOfWorkAdapter` (`IUnitOfWorkPort`)
  - `PrismaTransactionAdapter` (`ITransactionPort`, exposes concrete `getClient()` for infrastructure mappers/adapters)
- Generic transaction recorders are implemented:
  - `ChangeRecorder`
  - `EventOutboxRecorder`
- User first-slice module components are implemented:
  - domain models for `User` and `UserPreference` with audit snapshot factories and audit action constants,
  - repository ports,
  - Prisma repository adapters,
  - `UserModule` composition root wiring `CreateUserWithPreferencesUseCase`.
- `CreateUserWithPreferencesUseCase` records both audit intents and event intents in one transaction.

### Current startup/lifecycle state

- Local app lifecycle remains host-native Node (`npm run dev`, `npm test`), not containerized.
- Docker Compose is used only for PostgreSQL services at this stage:
  - `postgres` for development,
  - `postgres_test` for DB integration tests.
- UnitOfWork lifecycle for the first slice is active:
  - open transaction,
  - run use-case/repository work,
  - flush audit/event intents,
  - commit or roll back atomically.

### Current test strategy

- `npm test` remains unit-only and does not require Docker.
- DB integration tests are opt-in through `npm run test:integration`.
- Integration test flow:
  1. load `.env.test`,
  2. run `prisma migrate deploy` against `postgres_test`,
  3. execute `vitest.integration.config.ts`.
- The first integration slice proves durable persistence in one real DB transaction for:
  - `users`
  - `user_preferences`
  - `audit_logs`
  - `events`

### Current adapter boundaries

- Application/use cases depend on shared ports, not Prisma APIs.
- Prisma imports are limited to infrastructure adapters and Prisma-related integration testing.
- Repositories receive transaction access through `ITransactionPort`; concrete Prisma client access is exposed only where infrastructure mapping/persistence requires it.
- Audit and outbox write intents are captured via recorder ports and flushed by UnitOfWork infrastructure.

### Current first vertical slice behavior

Current implemented behavior for `CreateUserWithPreferencesUseCase`:

1. create `users` record,
2. create `user_preferences` record,
3. record audit change intent(s),
4. enqueue event intent(s),
5. persist all writes in one database transaction,
6. verify persisted rows through integration test against real PostgreSQL.

### HTTP slice implemented

The first HTTP write slice is now implemented for user creation:

- Route: `POST /users`.
- Presentation layer location: `src/modules/user/presentation/http`.
- Flow:
  1. route registration from `src/modules/user/presentation/http/routes.ts`,
  2. request parsing + use-case delegation in `src/modules/user/presentation/http/handlers/createUserWithPreferencesHttpHandler.ts`,
  3. auth resolution + use-case delegation in `src/modules/user/presentation/http/handlers/resolveAuthenticatedUserHttpHandler.ts`,
  4. safe error responses from `userHttpErrorHandler` (validation `400`, unauthorized `401`, domain access errors `403`, unexpected `500`).
- For `POST /users`, auth is optional and `actorUserId` may be `null`.
- No Messenger publish step is part of this slice.
- The use case still creates one durable `events` row in the database transaction; transport dispatch via `EventOutboxDispatcher` remains deferred.
- Coverage:
  - unit tests for endpoint handler/error handler/route behavior (`tests/modules/user/presentation/http/handlers/createUserWithPreferencesHttpHandler.test.ts`, `tests/modules/user/presentation/http/errors/userHttpErrors.test.ts`, `tests/modules/user/presentation/http/routes.test.ts`),
  - opt-in HTTP integration test for `POST /users` (`tests/modules/user/integration/UserHttp.integration.test.ts`) using `supertest` with `createHttpApp` (no real port bind).

## Deferred intentionally

- auth implementation,
- Messenger consumers,
- `EventOutboxDispatcher`,
- RabbitMQ transport integration,
- full TraderLock schema rollout,
- Prisma-to-Zod generated infrastructure schemas,
- rollback integration test for failed preference creation,
- generated Prisma Client CI policy decision.

## How to validate the first slice

Run in order:

```bash
npm run prisma:generate
npm run typecheck
npm test
npm run db:test:up
npm run test:integration
npx prisma validate
```

Validation notes:

- `npm test` is unit-only and does not require Docker.
- `npm run test:integration` requires the `postgres_test` service.
- Integration tests are module-local under `tests/modules/<module>/integration/`.
- `npm run test:integration` loads `.env.test`; running integration files directly with `vitest` may fail the DB safety guard if `DATABASE_URL` is not the test DB URL.
- Integration tests intentionally run as opt-in to keep default feedback loops fast.
