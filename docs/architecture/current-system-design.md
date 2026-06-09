# Current System Design

This document describes the current TraderLock server architecture. It is intended as the first file an agent should read before changing backend code.

## High-Level Shape

The server is a modular TypeScript backend built around explicit composition:

- `src/app` owns the process-level composition root and lifecycle.
- `src/shared` owns cross-cutting contracts, infrastructure adapters, HTTP composition, auth verification, logging, messaging, database ports, and kernel primitives.
- `src/modules/<module>` owns module business concepts, use cases, contracts, repositories, and module-specific HTTP handlers/routes.
- `prisma/schema.prisma` owns the physical PostgreSQL schema. Prisma Client is generated into `src/generated/prisma`.

Dependency direction should stay one-way:

```text
app -> shared infrastructure + registered modules
modules -> shared ports/domain/kernel
shared -> shared-only concerns
```

`shared` must not depend on a concrete module. A module may depend on shared auth identity, database ports, UnitOfWork, logging, messaging ports, and HTTP route types.

## Application Lifecycle

`src/app/Application.ts` is the singleton composition root. It creates the process-wide infrastructure objects:

- `PrismaDatabaseAdapter`
- `PrismaUnitOfWorkAdapter`
- `AuthProvider`
- `Messenger`
- `Logger`
- validated `env`

Startup order is:

1. log application startup,
2. start database,
3. start messenger,
4. setup registered modules,
5. start HTTP server.

Shutdown reverses this shape:

1. stop HTTP server,
2. stop modules,
3. stop messenger,
4. stop database.

Modules are registered explicitly in `src/shared/config/registeredModules.ts`. Do not add side-effect module registration.

## Module Contract

Each module exposes a composition root named `{module}.module.ts`. For example:

- `src/modules/user/user.module.ts`

A module composition root should:

- implement `IModulePort`,
- receive dependencies through `ModuleSetupContext`,
- instantiate module repositories and use cases,
- expose `ModuleRoute[]` through `routes`,
- avoid business logic.

`ModuleSetupContext` currently provides:

- `database`
- `unitOfWork`
- `messenger`
- `logger`
- `config`

Auth provider is intentionally not part of `ModuleSetupContext`. HTTP auth is applied by shared route registration, not by individual modules.

## HTTP Composition

Production HTTP composition lives in `src/app/server.ts`.

Base middleware order:

1. `requestContextMiddleware`
2. CORS
3. JSON body parser
4. optional Morgan debug logging
5. shared and module routes
6. `notFoundMiddleware`
7. `errorHandlerMiddleware`

The test-friendly app factory is `src/shared/presentation/http/server.ts`. Use `createHttpApp` in tests when you need an Express app without opening a TCP port.

Routes are mounted by `registerRoutes` in `src/shared/presentation/http/routes.ts`.

Each `ModuleRoute` has:

- `path`
- `router`
- `access`, either `public` or `protected`

Protected module routes are automatically wrapped with `requireAuthenticatedUser`. Modules should not manually call auth middleware unless there is a route-specific need that cannot be represented by `access`.

## Auth Design

Authentication belongs to `shared`.

Important files:

- `src/shared/application/ports/auth/IAuthProviderPort.ts`
- `src/shared/infrastructure/auth/AuthProvider.ts`
- `src/shared/infrastructure/auth/cognito/CognitoAuthProviderAdapter.ts`
- `src/shared/infrastructure/auth/dev/DevelopmentAuthProviderAdapter.ts`
- `src/shared/domain/auth/schemas/VerifiedAuthIdentity.ts`
- `src/shared/presentation/http/middleware/requireAuthenticatedUser.ts`
- `src/shared/presentation/http/middleware/getAuthenticatedUser.ts`

The auth flow is:

1. A protected route is declared with `access: 'protected'`.
2. `registerRoutes` mounts `requireAuthenticatedUser` before the module router.
3. `requireAuthenticatedUser` extracts the Bearer token.
4. `AuthProvider` verifies the token with the configured adapter.
5. The verified identity is attached to `request.context.actor`.
6. Module handlers call `getAuthenticatedUser(request)` when they need identity.

`VerifiedAuthIdentity.userId` is the TraderLock user id. For Cognito it is the JWT `sub` claim.

Clients must never send `user_id` in the body, query string, or route params. Server code must derive user id from `request.context.actor.userId`.

`AUTH_PROVIDER=dev` uses a deterministic development identity and is forbidden in production by env validation.

## User Module

The current user module does not own a local user identity table. It owns user preferences keyed by the verified auth identity.

Current user HTTP behavior:

- `POST /users` is public and returns `410 LOCAL_USER_CREATION_REMOVED`.
- `GET /users/me` is protected and resolves the authenticated user preference row, creating default preferences if missing.
- `PATCH /users/me/preferences` is protected and updates the authenticated user's preferences.

`src/modules/user/presentation/http/routes.ts` returns two route entries for the same `/users` path:

- a public router for removed local-user creation compatibility,
- a protected router for authenticated `/me` routes.

Keep public routes before protected routes when both mount the same path.

The user module owns:

- preference domain model and audit snapshot factory,
- use-case contracts such as `ResolveAuthenticatedUserContract.ts`,
- preference repository port,
- Prisma preference repository adapter,
- HTTP handlers for user-specific routes.

The user module consumes `VerifiedAuthIdentity` from shared, but the use-case contracts remain in the user module because they include user-domain concepts such as `UserPreferenceSchema`.

## Persistence and UnitOfWork

PostgreSQL is the durable store. Prisma is isolated to infrastructure adapters and generated code.

Current persistent models:

- `user_preferences`
- `events`
- `audit_logs`

There is no local `users` table in the current schema. User identity is external and comes from verified auth.

Use cases should write through repositories and `IUnitOfWorkPort`. The `PrismaUnitOfWorkAdapter`:

1. validates `OperationContext`,
2. opens a Prisma transaction,
3. creates transaction-scoped change and event recorders,
4. runs the use-case work,
5. flushes audit changes,
6. flushes durable events,
7. commits or rolls back atomically.

Modules record audit/event intents through `tx.changes.record(...)` and `tx.events.enqueue(...)`; they do not insert directly into `audit_logs` or `events`.

## Messaging

`Messenger` is a shared process-wide facade implementing `IMessengerPort`.

The default messenger is NodeMQ. RabbitMQ is available behind `MESSENGER=rabbitmq` and requires `RABBITMQ_URL`.

Durable event rows are written by UnitOfWork. Transport dispatch is not the source of truth.

## Error Handling

Global HTTP error handling lives in `src/shared/presentation/http/middleware/errorHandler.ts`.

It handles:

- `z.ZodError` as `400`,
- `HttpError` subclasses using their status code,
- unexpected errors as logged `500`.

Auth-specific unauthorized errors use `AuthUnauthorizedHttpError`, which extends `HttpError` with status `401`.

Prefer adding shared `HttpError` subclasses for stable HTTP error semantics instead of route-local error handlers.

## Environment

Validated env lives in `src/shared/config/env.ts`.

Important settings:

- `DATABASE_URL`
- `AUTH_PROVIDER`, either `cognito` or `dev`
- `COGNITO_REGION`
- `COGNITO_USER_POOL_ID`
- `COGNITO_CLIENT_ID`
- `COGNITO_TOKEN_USE`
- `CORS_ORIGINS`
- `MESSENGER`
- `RABBITMQ_URL`
- `LOG_LEVEL`
- `LOGGER`

When `AUTH_PROVIDER=cognito`, Cognito settings are required. When `AUTH_PROVIDER=dev`, production startup is rejected.

## Testing and Validation

Common validation commands:

```bash
npm run typecheck
npm run lint
npm test
```

Database integration flow:

```bash
npm run db:test:up
npm run prisma:migrate:test
npm run test:integration
```

Use package scripts from `trader-lock-server`. Running `npx vitest` from the workspace root can miss package alias configuration.

## Rules for Future Agents

- Read this document before large backend changes.
- Keep auth verification in `shared`, not in modules.
- Keep module use-case contracts in the module when they include module domain data.
- Do not introduce a local users table unless the product decision changes.
- Do not accept `user_id` from clients.
- Do not import Prisma into application/use-case code.
- Do not make `shared` import from `src/modules`.
- Register new modules explicitly in `src/shared/config/registeredModules.ts`.
- Prefer route `access` metadata over manual auth middleware inside module routes.
