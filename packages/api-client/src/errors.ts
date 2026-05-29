import type { FieldErrorDetail } from './parseApiError';

export class ApiClientError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: FieldErrorDetail[];

  constructor(
    code: string,
    status: number,
    message: string,
    details?: FieldErrorDetail[]
  ) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export class UnauthorizedError extends ApiClientError {
  constructor(
    message: string = 'The email or password you entered is incorrect.',
    details?: FieldErrorDetail[]
  ) {
    super('UNAUTHORIZED', 401, message, details);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends ApiClientError {
  constructor(message: string = 'Access forbidden', details?: FieldErrorDetail[]) {
    super('FORBIDDEN', 403, message, details);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends ApiClientError {
  constructor(message: string = 'Resource not found', details?: FieldErrorDetail[]) {
    super('NOT_FOUND', 404, message, details);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends ApiClientError {
  constructor(message: string = 'Validation failed', details?: FieldErrorDetail[]) {
    super('VALIDATION_ERROR', 400, message, details);
    this.name = 'ValidationError';
  }
}

export class InternalServerError extends ApiClientError {
  constructor(message: string = 'Internal server error', details?: FieldErrorDetail[]) {
    super('INTERNAL_ERROR', 500, message, details);
    this.name = 'InternalServerError';
  }
}

export class ConflictError extends ApiClientError {
  public readonly existingBookId?: string;

  constructor(message: string = 'Resource already exists', existingBookId?: string) {
    super('DUPLICATE_BOOK', 409, message);
    this.name = 'ConflictError';
    this.existingBookId = existingBookId;
  }
}
