# Shared Layer Taxonomy

This document defines what belongs in each shared/backend layer so business concepts, supporting entities, and primitives stay clearly separated.

## A. Module Domain Models

Real business models owned by modules.

Example:
- `src/modules/user/domain/user/User.ts`

## B. Shared Domain Models

Shared business concepts that have meaning across modules.

Example:
- `src/shared/domain/audit/AuditSnapshot.ts`

## C. Shared Domain Entities

Small supporting domain pieces, value objects, refs, envelopes, and intents.

Examples:
- `src/shared/domain/audit/schemas/AuditChangeIntent.ts`
- `src/shared/domain/event/schemas/EventIntent.ts`
- `src/shared/domain/operation/schemas/OperationContext.ts`

## D. Shared Kernel Primitives

Low-level reusable primitives with no business meaning.

Example:
- `src/shared/kernel/json/JsonValue.ts`

## E. Application Ports

Interfaces used by use cases and adapters.

Examples:
- `src/shared/application/ports/database/IUnitOfWorkPort.ts`
- `src/shared/application/ports/audit/IChangeRecorderPort.ts`
- `src/shared/application/ports/events/IEventOutboxPort.ts`
- `src/shared/application/ports/module/IModulePort.ts` (exports `IModulePort` + `ModuleSetupContext`)

## Rules

- Do not put something in `domain/models` unless it is an actual business model or core shared business concept.
- Do not put something in `shared/kernel` if it has business meaning.
- Do not move concepts into application just because they are used by ports. If they are reusable value objects/intents/context objects, they can live in `domain/entities`.
- `ModuleSetupContext` is a module setup service dependency context, not a domain model/entity.
- `ModuleSetupContext` is not a standalone port; it is a supporting type exported from `IModulePort.ts`.
- `ModuleSetupContext` belongs in `application/ports/module` because it composes infrastructure-facing contracts for module lifecycle wiring.
- `ModuleSetupContext` may reference application ports and config because it is part of the application module contract.
- `shared/domain` must not import `application` ports or `config`.
