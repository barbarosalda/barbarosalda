TraderLock does not have a local users table.

The field user_id always means:
  Cognito User Pool subject claim, claims.sub, from a verified JWT.

Rules:
- user_id is never accepted from request body.
- user_id is never accepted from query params.
- user_id is never accepted from route params.
- user_id always comes from req.context.actor.userId.
- Cognito owns authentication and identity.
- TraderLock owns application data such as preferences, accounts, licenses, notifications, events, and audit logs.