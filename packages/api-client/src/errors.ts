export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export class UnauthorizedError extends ApiError {
  constructor() {
    super(401, 'Unauthorized');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends ApiError {
  constructor() {
    super(403, 'Forbidden');
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends ApiError {
  constructor() {
    super(404, 'Not Found');
    this.name = 'NotFoundError';
  }
}

export class NetworkError extends Error {
  constructor() {
    super('Network error');
    this.name = 'NetworkError';
  }
}

export class OfflineError extends Error {
  constructor() {
    super('You are offline. Request queued for later.');
    this.name = 'OfflineError';
  }
}