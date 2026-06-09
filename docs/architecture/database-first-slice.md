# Database First Slice Architecture (v1)

## Purpose

This document defines the first durable database implementation slice for TraderLock backend. It sets practical, implementation-oriented boundaries so the team can deliver one vertical slice safely without committing to the full future schema.

This is historical context for the first persistence slice. For the current implemented system design, read `docs/architecture/current-system-design.md` first.

## Database Stack Decision

- **Primary stack for v1:** PostgreSQL + Prisma.
- **Physical DB contract:** Prisma schema + migrations.
- **Module/application contract:** domain Zod models owned by each module.
- **Prisma-to-Zod generation:** may be introduced later, but only inside infrastructure. Generated artifacts must not become module-level contracts.

## First Implementation Slice Scope

Only the following durable tables are active in the current first slice:

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

## Auth Identity Decision

TraderLock currently does not persist a local `users` table. The `user_preferences.user_id` column stores the verified external identity id.

For Cognito, `user_id` is the User Pool `sub` claim from a verified JWT. Clients must never send `user_id`; protected HTTP routes derive it from `request.context.actor.userId`.

Deferred:

- local user profiles,
- `auth_identities` table,
- provider-specific persisted identity tables,
- account/license ownership models beyond preferences.

## IDs and Timestamps

- IDs are prefixed, time-sortable string identifiers stored as `TEXT`.
- IDs are generated in shared code before insert.
- Prefix examples:
  - `upr_...`
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
- Current Prisma schema is implemented for:
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
- User module components are implemented:
  - domain model for `UserPreference` with audit snapshot factory and audit action constants,
  - repository port,
  - Prisma repository adapter,
  - `UserModule` composition root wiring authenticated-user preference use cases.
- `ResolveAuthenticatedUserUseCase` creates default preferences when an authenticated user has none.
- `UpdateAuthenticatedUserPreferencesUseCase` updates preferences and records audit/event intents in one transaction.

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
  - `user_preferences`
  - `audit_logs`
  - `events`

### Current adapter boundaries

- Application/use cases depend on shared ports, not Prisma APIs.
- Prisma imports are limited to infrastructure adapters and Prisma-related integration testing.
- Repositories receive transaction access through `ITransactionPort`; concrete Prisma client access is exposed only where infrastructure mapping/persistence requires it.
- Audit and outbox write intents are captured via recorder ports and flushed by UnitOfWork infrastructure.

### Current first vertical slice behavior

Current implemented behavior for authenticated user preference resolution:

1. verify auth in shared HTTP middleware,
2. derive `userId` from `request.context.actor.userId`,
3. create a `user_preferences` record when missing,
4. record audit change intent(s),
5. enqueue durable event intent(s) where applicable,
6. persist all writes in one database transaction,
7. verify persisted rows through integration tests against real PostgreSQL.

### HTTP slice implemented

The current HTTP slice is implemented for authenticated user preferences:

- `POST /users` is a public compatibility endpoint that returns `410 LOCAL_USER_CREATION_REMOVED`.
- `GET /users/me` is protected and resolves/creates preferences for the authenticated identity.
- `PATCH /users/me/preferences` is protected and updates preferences for the authenticated identity.
- Presentation layer location: `src/modules/user/presentation/http`.
- Shared HTTP registration applies auth middleware to routes with `access: 'protected'`.
- Safe error responses are handled by shared `errorHandlerMiddleware`:
  - validation errors as `400`,
  - unauthorized errors as `401`,
  - not found errors as `404`,
  - unexpected errors as logged `500`.
- No Messenger publish step is part of this slice.
- The use cases create durable `events` rows in the database transaction where they enqueue event intents; transport dispatch via `EventOutboxDispatcher` remains deferred.
- Coverage:
  - unit tests for route behavior and handlers under `tests/modules/user/presentation/http`,
  - opt-in HTTP integration test for `/users/me` flows (`tests/modules/user/integration/UserHttp.integration.test.ts`) using `supertest` with `createHttpApp` without opening a real port.

## Deferred intentionally

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
