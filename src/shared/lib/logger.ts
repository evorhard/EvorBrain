/**
 * Logger Utility
 * 
 * Centralized logging system for the application
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  enableInProduction: boolean;
  minLevel: LogLevel;
}

const defaultConfig: LoggerConfig = {
  enableInProduction: false,
  minLevel: 'debug',
};

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private config: LoggerConfig;
  private isDevelopment: boolean;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.isDevelopment = import.meta.env.DEV;
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.isDevelopment && !this.config.enableInProduction) {
      return false;
    }
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.minLevel];
  }

  private formatMessage(level: LogLevel, message: string, context?: string): string {
    const timestamp = new Date().toISOString();
    const prefix = context ? `[${context}]` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${prefix} ${message}`;
  }

  debug(message: string, data?: unknown, context?: string): void {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message, context), data || '');
    }
  }

  info(message: string, data?: unknown, context?: string): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, context), data || '');
    }
  }

  warn(message: string, data?: unknown, context?: string): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, context), data || '');
    }
  }

  error(message: string, error?: unknown, context?: string): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, context), error || '');
    }
  }

  // Create a logger with a specific context
  withContext(context: string): ContextLogger {
    return {
      debug: (message: string, data?: unknown) => this.debug(message, data, context),
      info: (message: string, data?: unknown) => this.info(message, data, context),
      warn: (message: string, data?: unknown) => this.warn(message, data, context),
      error: (message: string, error?: unknown) => this.error(message, error, context),
    };
  }
}

interface ContextLogger {
  debug(message: string, data?: unknown): void;
  info(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, error?: unknown): void;
}

// Export singleton instance
export const logger = new Logger();

// Export context-specific loggers
export const apiLogger = logger.withContext('API');
export const storeLogger = logger.withContext('Store');
export const uiLogger = logger.withContext('UI');