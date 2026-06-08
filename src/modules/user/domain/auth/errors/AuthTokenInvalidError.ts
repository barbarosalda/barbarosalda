export class AuthTokenInvalidError extends Error {
  constructor(message = 'Authentication token is invalid') {
    super(message);
    this.name = 'AuthTokenInvalidError';
  }
}
