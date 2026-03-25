/**
 * Logger utility for consistent, structured logging across the backend.
 * Supports different log levels and automatic formatting.
 */

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: Error;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Format log entry for console output
   */
  private format(entry: LogEntry): string {
    const { timestamp, level, message, context } = entry;
    const levelUpper = level.toUpperCase().padEnd(6);
    const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${levelUpper} ${message}${contextStr}`;
  }

  /**
   * Log error with optional context and Error object
   */
  error(message: string, context?: Record<string, unknown>, error?: Error): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      context,
      error,
    };

    console.error(this.format(entry));
    if (error?.stack) console.error(error.stack);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: Record<string, unknown>): void {
    if (this.isDevelopment || process.env.LOG_LEVEL === 'debug') {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: 'warn',
        message,
        context,
      };
      console.warn(this.format(entry));
    }
  }

  /**
   * Log info message
   */
  info(message: string, context?: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      context,
    };
    console.log(this.format(entry));
  }

  /**
   * Log debug message (development only)
   */
  debug(message: string, context?: Record<string, unknown>): void {
    if (this.isDevelopment) {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: 'debug',
        message,
        context,
      };
      console.debug(this.format(entry));
    }
  }
}

export const logger = new Logger();
