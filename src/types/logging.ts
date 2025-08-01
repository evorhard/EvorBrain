export enum LogLevel {
  Error = 'error',
  Warn = 'warn',
  Info = 'info',
  Debug = 'debug',
  Trace = 'trace',
}

export interface LogEntry {
  timestamp: string; // ISO 8601 datetime
  level: LogLevel;
  message: string;
  context?: string;
  error_details?: string;
}

export interface GetLogsRequest {
  count?: number;
  level_filter?: LogLevel;
}
