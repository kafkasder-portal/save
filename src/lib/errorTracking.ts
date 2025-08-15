import { log } from '@/utils/logger'

interface ErrorContext {
  userId?: string
  sessionId?: string
  url?: string
  userAgent?: string
  timestamp: string
  componentStack?: string
  additionalData?: Record<string, any>
}

interface ErrorReport {
  id: string
  error: Error | string
  context: ErrorContext
  severity: 'low' | 'medium' | 'high' | 'critical'
  handled: boolean
}

class ErrorTracker {
  private errors: ErrorReport[] = []
  private isInitialized = false
  private config = {
    enabled: true,
    maxErrors: 100,
    sendToServer: false,
    logToConsole: import.meta.env.DEV,
    severityThreshold: 'low' as const
  }

  init(config?: Partial<typeof this.config>) {
    if (this.isInitialized) return

    this.config = { ...this.config, ...config }
    
    if (!this.config.enabled) return

    // Global error handlers
    window.addEventListener('error', this.handleGlobalError.bind(this))
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this))

    // React error boundary integration
    if (typeof window !== 'undefined') {
      (window as any).__ERROR_TRACKER__ = this
    }

    this.isInitialized = true
    log.info('Error tracking initialized')
  }

  private handleGlobalError(event: ErrorEvent) {
    const error = new Error(event.message)
    error.stack = event.error?.stack || event.filename

    this.trackError(error, {
      severity: 'high',
      handled: false,
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        additionalData: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      }
    })
  }

  private handleUnhandledRejection(event: PromiseRejectionEvent) {
    const error = event.reason instanceof Error 
      ? event.reason 
      : new Error(String(event.reason))

    this.trackError(error, {
      severity: 'high',
      handled: false,
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        additionalData: {
          type: 'unhandledrejection'
        }
      }
    })
  }

  trackError(
    error: Error | string,
    options: Partial<Omit<ErrorReport, 'id' | 'error' | 'context'>> = {}
  ) {
    if (!this.config.enabled) return

    const errorReport: ErrorReport = {
      id: this.generateErrorId(),
      error: error instanceof Error ? error : new Error(error),
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        ...options.context
      },
      severity: options.severity || 'medium',
      handled: options.handled || false
    }

    // Add to errors array
    this.errors.push(errorReport)
    
    // Maintain max errors limit
    if (this.errors.length > this.config.maxErrors) {
      this.errors.shift()
    }

    // Log error
    this.logError(errorReport)

    // Send to server if configured
    if (this.config.sendToServer) {
      this.sendToServer(errorReport)
    }

    return errorReport.id
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private logError(errorReport: ErrorReport) {
    const { error, context, severity } = errorReport
    
    const logData = {
      id: errorReport.id,
      message: error.message,
      stack: error.stack,
      severity,
      url: context.url,
      timestamp: context.timestamp,
      ...context.additionalData
    }

    switch (severity) {
      case 'critical':
        log.error('Critical Error:', logData)
        break
      case 'high':
        log.error('High Severity Error:', logData)
        break
      case 'medium':
        log.warn('Medium Severity Error:', logData)
        break
      case 'low':
        log.info('Low Severity Error:', logData)
        break
    }

    if (this.config.logToConsole) {
      console.group(`🚨 Error (${severity}): ${error.message}`)
      console.error('Error Details:', logData)
      console.groupEnd()
    }
  }

  private async sendToServer(errorReport: ErrorReport) {
    try {
      // This would be replaced with actual API call
      const response = await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorReport)
      })

      if (!response.ok) {
        log.warn('Failed to send error to server:', response.status)
      }
    } catch (err) {
      log.error('Error sending error report to server:', err)
    }
  }

  getErrors(filter?: Partial<ErrorReport>): ErrorReport[] {
    if (!filter) return [...this.errors]

    return this.errors.filter(error => {
      return Object.entries(filter).every(([key, value]) => {
        return (error as any)[key] === value
      })
    })
  }

  getErrorById(id: string): ErrorReport | undefined {
    return this.errors.find(error => error.id === id)
  }

  clearErrors(): void {
    this.errors = []
    log.info('Error history cleared')
  }

  getErrorStats() {
    const total = this.errors.length
    const bySeverity = this.errors.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const byHandled = this.errors.reduce((acc, error) => {
      acc[error.handled ? 'handled' : 'unhandled'] = 
        (acc[error.handled ? 'handled' : 'unhandled'] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      total,
      bySeverity,
      byHandled,
      recentErrors: this.errors.slice(-10) // Last 10 errors
    }
  }
}

// Global error tracker instance
export const errorTracker = new ErrorTracker()

// React Error Boundary integration
export class ErrorBoundaryError extends Error {
  constructor(
    message: string,
    public componentStack: string,
    public error: Error
  ) {
    super(message)
    this.name = 'ErrorBoundaryError'
  }
}

export const trackReactError = (
  error: Error,
  componentStack: string,
  additionalContext?: Record<string, any>
) => {
  const reactError = new ErrorBoundaryError(
    `React Error Boundary caught: ${error.message}`,
    componentStack,
    error
  )

  errorTracker.trackError(reactError, {
    severity: 'high',
    handled: true,
    context: {
      componentStack,
      additionalData: {
        originalError: error.message,
        originalStack: error.stack,
        ...additionalContext
      }
    }
  })
}

// API Error tracking
export const trackApiError = (
  error: any,
  endpoint: string,
  method: string,
  requestData?: any
) => {
  const apiError = error instanceof Error ? error : new Error(String(error))
  
  errorTracker.trackError(apiError, {
    severity: 'medium',
    handled: true,
    context: {
      additionalData: {
        type: 'api_error',
        endpoint,
        method,
        requestData,
        status: error.status || error.statusCode,
        response: error.response || error.data
      }
    }
  })
}

// Form validation error tracking
export const trackValidationError = (
  field: string,
  value: any,
  validationRule: string,
  formName?: string
) => {
  const validationError = new Error(`Validation failed for ${field}: ${validationRule}`)
  
  errorTracker.trackError(validationError, {
    severity: 'low',
    handled: true,
    context: {
      additionalData: {
        type: 'validation_error',
        field,
        value: typeof value === 'object' ? '[Object]' : String(value),
        validationRule,
        formName
      }
    }
  })
}

// Performance error tracking
export const trackPerformanceError = (
  componentName: string,
  renderTime: number,
  threshold: number
) => {
  const performanceError = new Error(
    `Performance threshold exceeded: ${componentName} took ${renderTime}ms (threshold: ${threshold}ms)`
  )
  
  errorTracker.trackError(performanceError, {
    severity: 'medium',
    handled: true,
    context: {
      additionalData: {
        type: 'performance_error',
        componentName,
        renderTime,
        threshold
      }
    }
  })
}

// Initialize error tracking
if (typeof window !== 'undefined') {
  errorTracker.init()
}
