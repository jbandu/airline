/**
 * Error Logging and Monitoring Utility
 *
 * Provides comprehensive error tracking, logging, and monitoring capabilities
 * for database operations and general application errors.
 */

export interface ErrorLog {
  id: string;
  timestamp: string;
  type: 'database' | 'network' | 'validation' | 'runtime' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details?: any;
  stack?: string;
  context?: {
    user?: string;
    route?: string;
    operation?: string;
    table?: string;
    query?: string;
  };
}

class ErrorLogger {
  private static instance: ErrorLogger;
  private logs: ErrorLog[] = [];
  private maxLogs = 1000;
  private storageKey = 'airline_error_logs';

  private constructor() {
    this.loadFromStorage();
  }

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  /**
   * Log a database error
   */
  logDatabaseError(
    message: string,
    error: any,
    context?: {
      table?: string;
      operation?: string;
      query?: string;
      user?: string;
    }
  ): void {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      type: 'database',
      severity: this.determineSeverity(error),
      message,
      details: this.sanitizeError(error),
      stack: error?.stack,
      context: {
        ...context,
        route: window.location.pathname,
      },
    };

    this.addLog(errorLog);
    this.consoleLog(errorLog);
  }

  /**
   * Log a validation error
   */
  logValidationError(
    message: string,
    details: any,
    context?: {
      field?: string;
      expectedType?: string;
      actualType?: string;
    }
  ): void {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      type: 'validation',
      severity: 'medium',
      message,
      details: { ...details, ...context },
      context: {
        route: window.location.pathname,
      },
    };

    this.addLog(errorLog);
    this.consoleLog(errorLog);
  }

  /**
   * Log a general error
   */
  logError(
    message: string,
    error: any,
    type: ErrorLog['type'] = 'runtime',
    severity: ErrorLog['severity'] = 'medium'
  ): void {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      type,
      severity,
      message,
      details: this.sanitizeError(error),
      stack: error?.stack,
      context: {
        route: window.location.pathname,
      },
    };

    this.addLog(errorLog);
    this.consoleLog(errorLog);
  }

  /**
   * Get all logs
   */
  getLogs(filter?: {
    type?: ErrorLog['type'];
    severity?: ErrorLog['severity'];
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): ErrorLog[] {
    let filtered = [...this.logs];

    if (filter?.type) {
      filtered = filtered.filter(log => log.type === filter.type);
    }

    if (filter?.severity) {
      filtered = filtered.filter(log => log.severity === filter.severity);
    }

    if (filter?.startDate) {
      filtered = filtered.filter(log => log.timestamp >= filter.startDate!);
    }

    if (filter?.endDate) {
      filtered = filtered.filter(log => log.timestamp <= filter.endDate!);
    }

    if (filter?.limit) {
      filtered = filtered.slice(0, filter.limit);
    }

    return filtered.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Get error statistics
   */
  getStats(): {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    recentErrors: number;
    criticalErrors: number;
  } {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    let recentErrors = 0;
    let criticalErrors = 0;

    this.logs.forEach(log => {
      byType[log.type] = (byType[log.type] || 0) + 1;
      bySeverity[log.severity] = (bySeverity[log.severity] || 0) + 1;

      if (new Date(log.timestamp) >= oneHourAgo) {
        recentErrors++;
      }

      if (log.severity === 'critical') {
        criticalErrors++;
      }
    });

    return {
      total: this.logs.length,
      byType,
      bySeverity,
      recentErrors,
      criticalErrors,
    };
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
    this.saveToStorage();
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  private addLog(log: ErrorLog): void {
    this.logs.unshift(log);

    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    this.saveToStorage();
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private determineSeverity(error: any): ErrorLog['severity'] {
    const errorMessage = error?.message?.toLowerCase() || '';

    if (
      errorMessage.includes('permission') ||
      errorMessage.includes('authentication') ||
      errorMessage.includes('authorization')
    ) {
      return 'critical';
    }

    if (
      errorMessage.includes('network') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('connection')
    ) {
      return 'high';
    }

    if (
      errorMessage.includes('not found') ||
      errorMessage.includes('invalid')
    ) {
      return 'medium';
    }

    return 'low';
  }

  private sanitizeError(error: any): any {
    if (error === null || error === undefined) {
      return null;
    }

    if (typeof error === 'string') {
      return { message: error };
    }

    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        code: (error as any).code,
        details: (error as any).details,
        hint: (error as any).hint,
      };
    }

    try {
      return JSON.parse(JSON.stringify(error));
    } catch {
      return { message: String(error) };
    }
  }

  private consoleLog(log: ErrorLog): void {
    const prefix = `[${log.type.toUpperCase()}] [${log.severity.toUpperCase()}]`;

    if (log.severity === 'critical' || log.severity === 'high') {
      console.error(prefix, log.message, log.details);
    } else if (log.severity === 'medium') {
      console.warn(prefix, log.message, log.details);
    } else {
      console.log(prefix, log.message, log.details);
    }

    if (log.stack) {
      console.log('Stack trace:', log.stack);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.logs));
    } catch (error) {
      console.error('Failed to save error logs to storage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load error logs from storage:', error);
      this.logs = [];
    }
  }
}

// Export singleton instance
export const errorLogger = ErrorLogger.getInstance();

// Convenience functions
export function logDatabaseError(
  message: string,
  error: any,
  context?: Parameters<ErrorLogger['logDatabaseError']>[2]
): void {
  errorLogger.logDatabaseError(message, error, context);
}

export function logValidationError(
  message: string,
  details: any,
  context?: Parameters<ErrorLogger['logValidationError']>[2]
): void {
  errorLogger.logValidationError(message, details, context);
}

export function logError(
  message: string,
  error: any,
  type?: ErrorLog['type'],
  severity?: ErrorLog['severity']
): void {
  errorLogger.logError(message, error, type, severity);
}
