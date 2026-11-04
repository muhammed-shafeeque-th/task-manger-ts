export enum ErrorStatusCode {
  BadRequest400Error = 400,
  Unauthorized401Error = 401,
  NotFound404Error = 404,
  Conflict409Error = 409,
  InternalServer500Error = 500,
}

export enum ErrorCode {
  MongoDuplicateError = 11000,
}
export enum ErrorType {
  JsonParseFailed = "entity.parse.failed",
}

export class AppError extends Error {
  constructor(
    public readonly statusCode: ErrorStatusCode | number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request", details?: unknown) {
    super(ErrorStatusCode.BadRequest400Error, message, details);
  }
}
export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(ErrorStatusCode.Unauthorized401Error, message);
  }
}
export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(ErrorStatusCode.NotFound404Error, message);
  }
}
export class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(ErrorStatusCode.Conflict409Error, message);
  }
}
