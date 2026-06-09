# Auth and Users

TraderLock does not have a local users table in the current backend schema.

`user_id` always means the verified external identity id:

- for Cognito, the User Pool subject claim, `claims.sub`;
- for local development, the deterministic dev-auth fixture user id.

## Ownership

- Cognito owns authentication and identity in deployed environments.
- `shared` owns auth verification, auth provider adapters, and verified identity types.
- Modules own application data keyed by the verified identity.
- TraderLock owns preferences, accounts, licenses, notifications, events, audit logs, and other product data.

## Rules

- `user_id` is never accepted from request body.
- `user_id` is never accepted from query params.
- `user_id` is never accepted from route params.
- `user_id` always comes from `request.context.actor.userId`.
- Protected routes must use shared route `access: 'protected'` metadata or shared auth middleware.
- Module handlers should call `getAuthenticatedUser(request)` when they need the verified identity.

## Current Flow

1. A module route declares `access: 'protected'`.
2. `registerRoutes` in `src/shared/presentation/http/routes.ts` mounts `requireAuthenticatedUser`.
3. `requireAuthenticatedUser` verifies the Bearer token through `IAuthProviderPort`.
4. The verified identity is stored on `request.context.actor`.
5. Module handlers pass that identity to module use cases.

## Current User Endpoints

- `POST /users` returns `410 LOCAL_USER_CREATION_REMOVED`.
- `GET /users/me` resolves the authenticated user's preferences and creates defaults if needed.
- `PATCH /users/me/preferences` updates the authenticated user's preferences.

`GET /users/me` is the replacement for local user creation/bootstrap. Clients authenticate first, then call `/users/me`.

## Important Files

- `src/shared/domain/auth/schemas/VerifiedAuthIdentity.ts`
- `src/shared/application/ports/auth/IAuthProviderPort.ts`
- `src/shared/infrastructure/auth/AuthProvider.ts`
- `src/shared/presentation/http/middleware/requireAuthenticatedUser.ts`
- `src/shared/presentation/http/middleware/getAuthenticatedUser.ts`
- `src/modules/user/presentation/http/routes.ts`
- `src/modules/user/application/use-cases/ResolveAuthenticatedUserUseCase.ts`