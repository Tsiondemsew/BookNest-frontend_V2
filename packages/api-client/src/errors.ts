// Base API Error
export class ApiClientError extends Error {
  public readonly code: string;
  public readonly status: number;

  constructor(code: string, status: number, message: string) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.status = status;
  }
}

// Specific error types
export class UnauthorizedError extends ApiClientError {
  constructor() {
    super('UNAUTHORIZED', 401, 'Unauthorized access');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends ApiClientError {
  constructor() {
    super('FORBIDDEN', 403, 'Access forbidden');
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends ApiClientError {
  constructor(message: string = 'Resource not found') {
    super('NOT_FOUND', 404, message);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends ApiClientError {
  constructor(message: string = 'Validation failed') {
    super('VALIDATION_ERROR', 422, message);
    this.name = 'ValidationError';
  }
}

export class InternalServerError extends ApiClientError {
  constructor(message: string = 'Internal server error') {
    super('INTERNAL_ERROR', 500, message);
    this.name = 'InternalServerError';
  }
}