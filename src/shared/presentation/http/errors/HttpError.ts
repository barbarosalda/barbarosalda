/**
 * Base class for all HTTP-layer errors.
 *
 * Carry a stable `statusCode` so middleware can inspect it without
 * coupling to HTTP framework internals.
 */
export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends HttpError {
  constructor(message = 'Not found') {
    super(404, message);
  }
}

export class InternalServerError extends HttpError {
  constructor(message = 'Internal server error') {
    super(500, message);
  }
}
