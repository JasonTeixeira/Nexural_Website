'use client'

/**
 * ENHANCED ERROR BOUNDARY
 * Catches React errors and reports them to Sentry
 * Provides user-friendly error UI with recovery options
 */

import React, { Component, ErrorInfo, ReactNode } from 'react'
import * as Sentry from '@sentry/nextjs'
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  eventId: string | null
}

export class ErrorBoundaryEnhanced extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    eventId: null,
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    // Report to Sentry
    Sentry.withScope((scope) => {
      scope.setContext('errorInfo', {
        componentStack: errorInfo.componentStack,
      })
      
      // Set tags for filtering in Sentry
      scope.setTag('error_boundary', 'true')
      scope.setLevel('error')
      
      const eventId = Sentry.captureException(error)
      this.setState({ eventId })
    })

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    })
  }

  private resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    })
  }

  private reloadPage = () => {
    window.location.reload()
  }

  private goHome = () => {
    window.location.href = '/'
  }

  private reportFeedback = () => {
    if (this.state.eventId) {
      // Open Sentry feedback form
      Sentry.showReportDialog({ eventId: this.state.eventId })
    }
  }

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-lg w-full bg-white shadow-lg rounded-lg p-8">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 text-center mb-4">
              Oops! Something went wrong
            </h1>

            <p className="text-gray-600 text-center mb-6">
              We're sorry for the inconvenience. Our team has been notified and is working on fixing this issue.
            </p>

            {/* Error Details (only in development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-gray-100 rounded-lg overflow-auto max-h-48">
                <p className="text-sm font-mono text-red-600 mb-2">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo?.componentStack && (
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            {/* Event ID (for support reference) */}
            {this.state.eventId && (
              <div className="mb-6 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900 text-center">
                  Error ID: <span className="font-mono font-semibold">{this.state.eventId}</span>
                </p>
                <p className="text-xs text-blue-700 text-center mt-1">
                  Please include this ID when contacting support
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Try Again */}
              <button
                onClick={this.resetError}
                className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Try Again
              </button>

              {/* Reload Page */}
              <button
                onClick={this.reloadPage}
                className="w-full flex items-center justify-center px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Reload Page
              </button>

              {/* Go Home */}
              <button
                onClick={this.goHome}
                className="w-full flex items-center justify-center px-4 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border-2 border-gray-300 transition-colors"
              >
                <Home className="w-5 h-5 mr-2" />
                Go to Homepage
              </button>

              {/* Report Feedback */}
              {this.state.eventId && (
                <button
                  onClick={this.reportFeedback}
                  className="w-full flex items-center justify-center px-4 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border-2 border-gray-300 transition-colors"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Send Feedback
                </button>
              )}
            </div>

            {/* Support Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                Need help? Contact us at{' '}
                <a
                  href="mailto:support@nexural.io"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  support@nexural.io
                </a>
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * HOC to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function ComponentWithErrorBoundary(props: P) {
    return (
      <ErrorBoundaryEnhanced fallback={fallback}>
        <Component {...props} />
      </ErrorBoundaryEnhanced>
    )
  }
}

export default ErrorBoundaryEnhanced
