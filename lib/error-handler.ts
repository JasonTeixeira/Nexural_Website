/**
 * ERROR HANDLER UTILITY
 * Centralized error handling and reporting to Sentry
 * Provides consistent error logging and user-friendly messages
 */

import * as Sentry from '@sentry/nextjs'

// =============================================================================
// ERROR TYPES
// =============================================================================

export enum ErrorType {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT',
  DATABASE = 'DATABASE',
  EXTERNAL_API = 'EXTERNAL_API',
  NETWORK = 'NETWORK',
  UNKNOWN = 'UNKNOWN',
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// =============================================================================
// ERROR CONTEXT
// =============================================================================

export interface ErrorContext {
  userId?: string
  email?: string
  action?: string
  component?: string
  route?: string
  additionalData?: Record<string, any>
}

// =============================================================================
// CUSTOM ERROR CLASS
// =============================================================================

export class AppError extends Error {
  public type: ErrorType
  public severity: ErrorSeverity
  public userMessage: string
  public context?: ErrorContext
  public statusCode?: number

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    userMessage?: string,
    context?: ErrorContext,
    statusCode?: number
  ) {
    super(message)
    this.name = 'AppError'
    this.type = type
    this.severity = severity
    this.userMessage = userMessage || this.getDefaultUserMessage(type)
    this.context = context
    this.statusCode = statusCode
  }

  private getDefaultUserMessage(type: ErrorType): string {
    const messages: Record<ErrorType, string> = {
      [ErrorType.VALIDATION]: 'Please check your input and try again.',
      [ErrorType.AUTHENTICATION]: 'Please log in to continue.',
      [ErrorType.AUTHORIZATION]: 'You don\'t have permission to perform this action.',
      [ErrorType.NOT_FOUND]: 'The requested resource was not found.',
      [ErrorType.RATE_LIMIT]: 'Too many requests. Please try again later.',
      [ErrorType.DATABASE]: 'A database error occurred. Please try again.',
      [ErrorType.EXTERNAL_API]: 'An external service error occurred. Please try again.',
      [ErrorType.NETWORK]: 'Network error. Please check your connection.',
      [ErrorType.UNKNOWN]: 'An unexpected error occurred. Please try again.',
    }
    return messages[type]
  }
}

// =============================================================================
// ERROR HANDLER
// =============================================================================

export class ErrorHandler {
  /**
   * Report error to Sentry with context
   */
  static report(
    error: Error | AppError,
    context?: ErrorContext,
    severity?: ErrorSeverity
  ): string | null {
    // Don't report in development (optional - change if needed)
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorHandler]', error, context)
      return null
    }

    // Prepare Sentry context
    Sentry.withScope((scope) => {
      // Set severity
      const level = severity || (error instanceof AppError ? error.severity : ErrorSeverity.MEDIUM)
      scope.setLevel(this.mapSeverityToLevel(level))

      // Set user context
      if (context?.userId || context?.email) {
        scope.setUser({
          id: context.userId,
          email: context.email,
        })
      }

      // Set tags
      if (error instanceof AppError) {
        scope.setTag('error_type', error.type)
        scope.setTag('status_code', error.statusCode?.toString() || 'unknown')
      }

      if (context?.action) {
        scope.setTag('action', context.action)
      }

      if (context?.component) {
        scope.setTag('component', context.component)
      }

      if (context?.route) {
        scope.setTag('route', context.route)
      }

      // Set extra context
      if (context?.additionalData) {
        scope.setContext('additionalData', context.additionalData)
      }

      // Capture exception
      const eventId = Sentry.captureException(error)
      return eventId
    })

    return null
  }

  /**
   * Map severity to Sentry level
   */
  private static mapSeverityToLevel(severity: ErrorSeverity): Sentry.SeverityLevel {
    const mapping: Record<ErrorSeverity, Sentry.SeverityLevel> = {
      [ErrorSeverity.LOW]: 'info',
      [ErrorSeverity.MEDIUM]: 'warning',
      [ErrorSeverity.HIGH]: 'error',
      [ErrorSeverity.CRITICAL]: 'fatal',
    }
    return mapping[severity]
  }

  /**
   * Handle API error - log and return user-friendly message
   */
  static handleApiError(
    error: unknown,
    action: string,
    userId?: string
  ): { message: string; statusCode: number } {
    let appError: AppError

    if (error instanceof AppError) {
      appError = error
    } else if (error instanceof Error) {
      appError = new AppError(
        error.message,
        ErrorType.UNKNOWN,
        ErrorSeverity.MEDIUM,
        undefined,
        { action, userId }
      )
    } else {
      appError = new AppError(
        'Unknown error occurred',
        ErrorType.UNKNOWN,
        ErrorSeverity.MEDIUM,
        undefined,
        { action, userId }
      )
    }

    // Report to Sentry
    this.report(appError, { action, userId })

    return {
      message: appError.userMessage,
      statusCode: appError.statusCode || 500,
    }
  }

  /**
   * Log warning (non-error issues)
   */
  static logWarning(message: string, context?: ErrorContext): void {
    console.warn('[Warning]', message, context)

    if (process.env.NODE_ENV !== 'development') {
      Sentry.withScope((scope) => {
        scope.setLevel('warning')
        
        if (context?.userId || context?.email) {
          scope.setUser({
            id: context.userId,
            email: context.email,
          })
        }

        if (context?.additionalData) {
          scope.setContext('warningData', context.additionalData)
        }

        Sentry.captureMessage(message)
      })
    }
  }

  /**
   * Log info (for tracking important events)
   */
  static logInfo(message: string, context?: ErrorContext): void {
    console.info('[Info]', message, context)

    if (process.env.NODE_ENV !== 'development') {
      Sentry.withScope((scope) => {
        scope.setLevel('info')
        
        if (context?.userId || context?.email) {
          scope.setUser({
            id: context.userId,
            email: context.email,
          })
        }

        if (context?.additionalData) {
          scope.setContext('infoData', context.additionalData)
        }

        Sentry.captureMessage(message)
      })
    }
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Create a validation error
 */
export function createValidationError(
  message: string,
  userMessage?: string,
  context?: ErrorContext
): AppError {
  return new AppError(
    message,
    ErrorType.VALIDATION,
    ErrorSeverity.LOW,
    userMessage,
    context,
    400
  )
}

/**
 * Create an authentication error
 */
export function createAuthError(
  message: string,
  userMessage?: string,
  context?: ErrorContext
): AppError {
  return new AppError(
    message,
    ErrorType.AUTHENTICATION,
    ErrorSeverity.MEDIUM,
    userMessage,
    context,
    401
  )
}

/**
 * Create an authorization error
 */
export function createAuthzError(
  message: string,
  userMessage?: string,
  context?: ErrorContext
): AppError {
  return new AppError(
    message,
    ErrorType.AUTHORIZATION,
    ErrorSeverity.MEDIUM,
    userMessage,
    context,
    403
  )
}

/**
 * Create a not found error
 */
export function createNotFoundError(
  resource: string,
  userMessage?: string,
  context?: ErrorContext
): AppError {
  return new AppError(
    `${resource} not found`,
    ErrorType.NOT_FOUND,
    ErrorSeverity.LOW,
    userMessage || `${resource} not found`,
    context,
    404
  )
}

/**
 * Create a rate limit error
 */
export function createRateLimitError(
  userMessage?: string,
  context?: ErrorContext
): AppError {
  return new AppError(
    'Rate limit exceeded',
    ErrorType.RATE_LIMIT,
    ErrorSeverity.LOW,
    userMessage,
    context,
    429
  )
}

/**
 * Create a database error
 */
export function createDatabaseError(
  message: string,
  context?: ErrorContext
): AppError {
  return new AppError(
    message,
    ErrorType.DATABASE,
    ErrorSeverity.HIGH,
    'A database error occurred. Our team has been notified.',
    context,
    500
  )
}

/**
 * Create an external API error
 */
export function createExternalApiError(
  service: string,
  message: string,
  context?: ErrorContext
): AppError {
  return new AppError(
    `${service} API error: ${message}`,
    ErrorType.EXTERNAL_API,
    ErrorSeverity.MEDIUM,
    'An external service is temporarily unavailable. Please try again later.',
    context,
    503
  )
}

// =============================================================================
// ASYNC ERROR WRAPPER
// =============================================================================

/**
 * Wrap async function with error handling
 * Usage: const result = await withErrorHandling(() => someAsyncFunction(), 'someAction')
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  action: string,
  context?: ErrorContext
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    ErrorHandler.report(
      error instanceof Error ? error : new Error(String(error)),
      { ...context, action }
    )
    throw error
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default ErrorHandler
