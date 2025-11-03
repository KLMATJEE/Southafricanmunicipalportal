/**
 * Error Handling & Recovery Utilities
 * Production-grade error management with logging and recovery
 */

import { sanitizeForLogging } from './validation';

export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export interface ErrorContext {
  userId?: string;
  action?: string;
  component?: string;
  metadata?: any;
}

export class ApplicationError extends Error {
  public readonly code: string;
  public readonly severity: ErrorSeverity;
  public readonly context: ErrorContext;
  public readonly timestamp: string;
  public readonly recoverable: boolean;
  
  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    severity: ErrorSeverity = ErrorSeverity.ERROR,
    context: ErrorContext = {},
    recoverable: boolean = true
  ) {
    super(message);
    this.name = 'ApplicationError';
    this.code = code;
    this.severity = severity;
    this.context = context;
    this.timestamp = new Date().toISOString();
    this.recoverable = recoverable;
    
    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApplicationError);
    }
  }
  
  /**
   * Convert to JSON for logging
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      severity: this.severity,
      context: sanitizeForLogging(this.context),
      timestamp: this.timestamp,
      recoverable: this.recoverable,
      stack: this.stack
    };
  }
}

/**
 * Error logger with compliance requirements
 */
export class ErrorLogger {
  private static logs: ApplicationError[] = [];
  private static maxLogs: number = 1000;
  
  /**
   * Log error with full context
   */
  static log(error: Error | ApplicationError, context: ErrorContext = {}): void {
    const appError = error instanceof ApplicationError
      ? error
      : new ApplicationError(
          error.message,
          'UNHANDLED_ERROR',
          ErrorSeverity.ERROR,
          context
        );
    
    // Add to in-memory log
    this.logs.push(appError);
    
    // Trim logs if exceeds max
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
    
    // Console logging based on severity
    const logData = appError.toJSON();
    
    switch (appError.severity) {
      case ErrorSeverity.CRITICAL:
        console.error('[CRITICAL]', logData);
        // In production, send to monitoring service
        this.sendToMonitoring(appError);
        break;
      case ErrorSeverity.ERROR:
        console.error('[ERROR]', logData);
        break;
      case ErrorSeverity.WARNING:
        console.warn('[WARNING]', logData);
        break;
      case ErrorSeverity.INFO:
        console.info('[INFO]', logData);
        break;
    }
    
    // Store in localStorage for debugging (production: send to backend)
    this.persistError(appError);
  }
  
  /**
   * Persist error to storage
   */
  private static persistError(error: ApplicationError): void {
    try {
      const stored = localStorage.getItem('error_logs');
      const logs = stored ? JSON.parse(stored) : [];
      
      logs.push(error.toJSON());
      
      // Keep only last 100 errors in localStorage
      if (logs.length > 100) {
        logs.shift();
      }
      
      localStorage.setItem('error_logs', JSON.stringify(logs));
    } catch (e) {
      // If localStorage fails, just log to console
      console.error('Failed to persist error:', e);
    }
  }
  
  /**
   * Send critical errors to monitoring service
   */
  private static async sendToMonitoring(error: ApplicationError): Promise<void> {
    try {
      // In production, send to Sentry, LogRocket, or custom monitoring
      // For now, we'll just log
      console.log('Would send to monitoring service:', error.toJSON());
      
      // Example: Send to backend endpoint
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(error.toJSON())
      // });
    } catch (e) {
      console.error('Failed to send error to monitoring:', e);
    }
  }
  
  /**
   * Get recent errors for debugging
   */
  static getRecentErrors(count: number = 10): ApplicationError[] {
    return this.logs.slice(-count);
  }
  
  /**
   * Clear error logs
   */
  static clear(): void {
    this.logs = [];
    localStorage.removeItem('error_logs');
  }
}

/**
 * Circuit breaker pattern for external API calls
 */
export class CircuitBreaker {
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  constructor(
    private readonly threshold: number = 5,
    private readonly timeout: number = 60000, // 1 minute
    private readonly resetTimeout: number = 30000 // 30 seconds
  ) {}
  
  /**
   * Execute function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>, fallback?: () => T): Promise<T> {
    // Check circuit state
    if (this.state === 'open') {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;
      
      if (timeSinceLastFailure > this.resetTimeout) {
        this.state = 'half-open';
      } else {
        if (fallback) {
          return fallback();
        }
        throw new ApplicationError(
          'Circuit breaker is open - service temporarily unavailable',
          'CIRCUIT_BREAKER_OPEN',
          ErrorSeverity.WARNING,
          { state: this.state, failures: this.failures }
        );
      }
    }
    
    try {
      const result = await Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), this.timeout)
        )
      ]);
      
      // Success - reset if in half-open state
      if (this.state === 'half-open') {
        this.state = 'closed';
        this.failures = 0;
      }
      
      return result;
    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();
      
      // Open circuit if threshold exceeded
      if (this.failures >= this.threshold) {
        this.state = 'open';
        
        ErrorLogger.log(
          new ApplicationError(
            'Circuit breaker opened due to repeated failures',
            'CIRCUIT_BREAKER_OPENED',
            ErrorSeverity.CRITICAL,
            { failures: this.failures, threshold: this.threshold }
          )
        );
      }
      
      if (fallback) {
        return fallback();
      }
      
      throw error;
    }
  }
  
  /**
   * Reset circuit breaker
   */
  reset(): void {
    this.failures = 0;
    this.state = 'closed';
    this.lastFailureTime = 0;
  }
  
  /**
   * Get current state
   */
  getState(): { state: string; failures: number; lastFailure: number } {
    return {
      state: this.state,
      failures: this.failures,
      lastFailure: this.lastFailureTime
    };
  }
}

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffFactor = 2,
    onRetry
  } = options;
  
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        initialDelay * Math.pow(backoffFactor, attempt),
        maxDelay
      );
      
      // Call retry callback
      if (onRetry) {
        onRetry(attempt + 1, lastError);
      }
      
      ErrorLogger.log(
        new ApplicationError(
          `Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`,
          'RETRY_ATTEMPT',
          ErrorSeverity.WARNING,
          { attempt, delay, error: lastError.message }
        )
      );
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new ApplicationError(
    `Failed after ${maxRetries} retries: ${lastError!.message}`,
    'MAX_RETRIES_EXCEEDED',
    ErrorSeverity.ERROR,
    { maxRetries, lastError: lastError!.message }
  );
}

/**
 * Safe JSON parse with error handling
 */
export function safeJSONParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch (error) {
    ErrorLogger.log(
      new ApplicationError(
        'Failed to parse JSON',
        'JSON_PARSE_ERROR',
        ErrorSeverity.WARNING,
        { json: json.substring(0, 100) }
      )
    );
    return fallback;
  }
}

/**
 * Async error boundary wrapper
 */
export function withErrorBoundary<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context: ErrorContext = {}
): (...args: T) => Promise<R | undefined> {
  return async (...args: T): Promise<R | undefined> => {
    try {
      return await fn(...args);
    } catch (error) {
      ErrorLogger.log(
        error instanceof Error ? error : new Error(String(error)),
        { ...context, args: sanitizeForLogging(args) }
      );
      return undefined;
    }
  };
}

/**
 * Global error handler setup
 */
export function setupGlobalErrorHandlers(): void {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    ErrorLogger.log(
      new ApplicationError(
        event.reason?.message || 'Unhandled promise rejection',
        'UNHANDLED_REJECTION',
        ErrorSeverity.ERROR,
        { reason: event.reason }
      )
    );
    
    event.preventDefault();
  });
  
  // Handle global errors
  window.addEventListener('error', (event) => {
    ErrorLogger.log(
      new ApplicationError(
        event.message,
        'GLOBAL_ERROR',
        ErrorSeverity.ERROR,
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      )
    );
  });
}

// Initialize global error handlers
if (typeof window !== 'undefined') {
  setupGlobalErrorHandlers();
}
