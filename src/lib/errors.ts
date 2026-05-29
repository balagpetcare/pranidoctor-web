// Phase 4: Custom Error Classes

/**
 * Base application error class
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: string = 'INTERNAL_ERROR',
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Not Found Error - Resource does not exist
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 'NOT_FOUND', 404);
  }
}

/**
 * Validation Error - Input data is invalid
 */
export class ValidationError extends AppError {
  public readonly details?: Record<string, string>;

  constructor(
    message: string = 'Validation failed',
    details?: Record<string, string>
  ) {
    super(message, 'VALIDATION_ERROR', 400);
    this.details = details;
  }
}

/**
 * Unauthorized Error - Authentication required
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'UNAUTHORIZED', 401);
  }
}

/**
 * Forbidden Error - Insufficient permissions
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'FORBIDDEN', 403);
  }
}

/**
 * Conflict Error - Resource already exists or state conflict
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 'CONFLICT', 409);
  }
}

/**
 * Rate Limit Error - Too many requests
 */
export class RateLimitError extends AppError {
  public readonly retryAfter?: number;

  constructor(message: string = 'Rate limit exceeded', retryAfter?: number) {
    super(message, 'RATE_LIMIT', 429);
    this.retryAfter = retryAfter;
  }
}

/**
 * Service Unavailable Error - External service down
 */
export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service temporarily unavailable') {
    super(message, 'SERVICE_UNAVAILABLE', 503);
  }
}

/**
 * Database Error - Database operation failed
 */
export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, 'DATABASE_ERROR', 500, false);
  }
}

/**
 * External API Error - Third-party API call failed
 */
export class ExternalApiError extends AppError {
  public readonly externalStatusCode?: number;

  constructor(
    message: string = 'External API call failed',
    externalStatusCode?: number
  ) {
    super(message, 'EXTERNAL_API_ERROR', 502, false);
    this.externalStatusCode = externalStatusCode;
  }
}
