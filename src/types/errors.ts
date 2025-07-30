export enum ErrorCode {
  // Database errors
  DATABASE_CONNECTION = "DATABASE_CONNECTION",
  DATABASE_QUERY = "DATABASE_QUERY",
  DATABASE_MIGRATION = "DATABASE_MIGRATION",
  
  // Validation errors
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_INPUT = "INVALID_INPUT",
  INVALID_ID = "INVALID_ID",
  
  // Business logic errors
  NOT_FOUND = "NOT_FOUND",
  ALREADY_EXISTS = "ALREADY_EXISTS",
  CANNOT_DELETE = "CANNOT_DELETE",
  CANNOT_UPDATE = "CANNOT_UPDATE",
  
  // System errors
  INTERNAL_ERROR = "INTERNAL_ERROR",
  CONFIG_ERROR = "CONFIG_ERROR",
  IO_ERROR = "IO_ERROR",
  
  // Auth errors (future use)
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
}

export interface AppError {
  code: ErrorCode;
  message: string;
  details?: string;
}

export class EvorBrainError extends Error {
  code: ErrorCode;
  details?: string;

  constructor(error: AppError) {
    super(error.message);
    this.name = 'EvorBrainError';
    this.code = error.code;
    this.details = error.details;
  }

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

  toJSON(): AppError {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}