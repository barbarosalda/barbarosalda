# Shared Layer Taxonomy

This document defines what belongs in each shared/backend layer so business concepts, supporting entities, and primitives stay clearly separated.

## A. Module Domain Models

Real business models owned by modules.

Examples:
- `src/modules/user/domain/preference/UserPreference.ts`
- module audit snapshot factories such as `toUserPreferenceAuditSnapshot`

Module domain models may depend on shared primitives and shared domain contracts. They should not depend on infrastructure adapters.

## B. Shared Domain Models

Shared business concepts that have meaning across modules.

Examples:
- `src/shared/domain/audit/AuditSnapshot.ts`
- `src/shared/domain/auth/schemas/VerifiedAuthIdentity.ts`

Auth identity is shared because every module that handles user-owned data must agree on the verified identity shape. Module-specific user data, such as preferences, stays in the owning module.

## C. Shared Domain Entities

Small supporting domain pieces, value objects, refs, envelopes, and intents.

Examples:
- `src/shared/domain/audit/schemas/AuditChangeIntent.ts`
- `src/shared/domain/event/schemas/EventIntent.ts`
- `src/shared/domain/operation/schemas/OperationContext.ts`
- `src/shared/domain/auth/errors/AuthTokenInvalidError.ts`

## D. Shared Kernel Primitives

Low-level reusable primitives with no business meaning.

Example:
- `src/shared/kernel/json/JsonValue.ts`

## E. Application Ports

Interfaces used by use cases and adapters.

Examples:
- `src/shared/application/ports/auth/IAuthProviderPort.ts`
- `src/shared/application/ports/database/IUnitOfWorkPort.ts`
- `src/shared/application/ports/audit/IChangeRecorderPort.ts`
- `src/shared/application/ports/events/IEventOutboxPort.ts`
- `src/shared/application/ports/module/IModulePort.ts` (exports `IModulePort` + `ModuleSetupContext`)

## F. Shared Presentation

HTTP composition, common middleware, route registration, and stable HTTP error handling.

Examples:
- `src/shared/presentation/http/routes.ts`
- `src/shared/presentation/http/middleware/requireAuthenticatedUser.ts`
- `src/shared/presentation/http/middleware/getAuthenticatedUser.ts`
- `src/shared/presentation/http/middleware/errorHandler.ts`
- `src/shared/presentation/http/errors/HttpError.ts`

Shared presentation may know about shared ports such as `IAuthProviderPort`. It must not know about module use cases or module domain schemas.

## G. Shared Infrastructure

Concrete adapters for shared ports.

Examples:
- `src/shared/infrastructure/auth/AuthProvider.ts`
- `src/shared/infrastructure/database/prisma/adapters/PrismaUnitOfWorkAdapter.ts`
- `src/shared/infrastructure/messaging/Messenger.ts`
- `src/shared/infrastructure/logging/Logger.ts`

Infrastructure can depend on external libraries. Application and domain code should depend on ports, not concrete infrastructure.

## Rules

- Do not put something in `domain/models` unless it is an actual business model or core shared business concept.
- Do not put something in `shared/kernel` if it has business meaning.
- Do not move concepts into application just because they are used by ports. If they are reusable value objects/intents/context objects, they can live in `domain/entities`.
- Do not move module use-case contracts into `shared` when they include module domain data.
- Do not make `shared` import from `src/modules`.
- Keep auth verification in `shared`; keep module-specific authenticated-user behavior in the module.
- `ModuleSetupContext` is a module setup service dependency context, not a domain model/entity.
- `ModuleSetupContext` is not a standalone port; it is a supporting type exported from `IModulePort.ts`.
- `ModuleSetupContext` belongs in `application/ports/module` because it composes infrastructure-facing contracts for module lifecycle wiring.
- `ModuleSetupContext` may reference application ports and config because it is part of the application module contract.
- `shared/domain` must not import `application` ports or `config`.
