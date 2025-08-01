/**
 * Error codes used throughout the EvorBrain application
 * @enum {string}
 */
export enum ErrorCode {
  // Database errors
  DATABASE_CONNECTION = 'DATABASE_CONNECTION',
  DATABASE_QUERY = 'DATABASE_QUERY',
  DATABASE_MIGRATION = 'DATABASE_MIGRATION',

  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  INVALID_ID = 'INVALID_ID',

  // Business logic errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CANNOT_DELETE = 'CANNOT_DELETE',
  CANNOT_UPDATE = 'CANNOT_UPDATE',

  // System errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  CONFIG_ERROR = 'CONFIG_ERROR',
  IO_ERROR = 'IO_ERROR',

  // Auth errors (future use)
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
}

/**
 * Standard error format for the application
 * @interface AppError
 */
export interface AppError {
  code: ErrorCode;
  message: string;
  details?: string;
}

/**
 * Custom error class for EvorBrain application errors
 * Extends the native Error class with additional error code and details
 * @class EvorBrainError
 * @extends {Error}
 */
export class EvorBrainError extends Error {
  code: ErrorCode;
  details?: string;

  /**
   * Creates a new EvorBrainError instance
   * @param error - The AppError object containing code, message, and optional details
   */
  constructor(error: AppError) {
    super(error.message);
    this.name = 'EvorBrainError';
    this.code = error.code;
    this.details = error.details;
  }

  /**
   * Creates an EvorBrainError from a Tauri command error
   * @param error - The error object from a Tauri command
   * @returns A properly typed EvorBrainError instance
   */
  static fromTauriError(error: unknown): EvorBrainError {
    if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
      return new EvorBrainError(error as AppError);
    }

    // Fallback for unknown errors
    return new EvorBrainError({
      code: ErrorCode.INTERNAL_ERROR,
      message: error instanceof Error ? error.message : String(error),
    });
  }

  /**
   * Serializes the error to a JSON-compatible format
   * @returns The error as an AppError object
   */
  toJSON(): AppError {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}
