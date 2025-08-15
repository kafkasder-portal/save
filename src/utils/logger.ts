/**
 * Centralized logging utility for the application
 * Provides structured logging with different levels and production-safe logging
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

interface LogConfig {
  level: LogLevel
  enableConsole: boolean
  enableRemote: boolean
  remoteEndpoint?: string
}

class Logger {
  private config: LogConfig
  private isDevelopment: boolean

  constructor() {
    this.isDevelopment = import.meta.env.DEV
    this.config = {
      level: this.isDevelopment ? LogLevel.DEBUG : LogLevel.WARN,
      enableConsole: true,
      enableRemote: !this.isDevelopment,
      remoteEndpoint: import.meta.env.VITE_LOG_ENDPOINT
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level}]`
    
    if (data) {
      return `${prefix} ${message} ${JSON.stringify(data, null, 2)}`
    }
    
    return `${prefix} ${message}`
  }

  private log(level: LogLevel, levelName: string, message: string, data?: any): void {
    if (!this.shouldLog(level)) return

    const formattedMessage = this.formatMessage(levelName, message, data)

    if (this.config.enableConsole) {
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(formattedMessage)
          break
        case LogLevel.INFO:
          console.info(formattedMessage)
          break
        case LogLevel.WARN:
          console.warn(formattedMessage)
          break
        case LogLevel.ERROR:
          console.error(formattedMessage)
          break
      }
    }

    if (this.config.enableRemote && this.config.remoteEndpoint) {
      this.sendToRemote(level, message, data).catch(() => {
        // Silently fail remote logging
      })
    }
  }

  private async sendToRemote(level: LogLevel, message: string, data?: any): Promise<void> {
    if (!this.config.remoteEndpoint) return

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          level: LogLevel[level],
          message,
          data,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      })
    } catch (error) {
      // Remote logging failed, but we don't want to break the app
    }
  }

  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, 'DEBUG', message, data)
  }

  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, 'INFO', message, data)
  }

  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, 'WARN', message, data)
  }

  error(message: string, error?: Error | any): void {
    const errorData = error instanceof Error 
      ? { message: error.message, stack: error.stack, name: error.name }
      : error
    
    this.log(LogLevel.ERROR, 'ERROR', message, errorData)
  }

  // Convenience methods for common patterns
  logApiCall(endpoint: string, method: string, data?: any): void {
    this.info(`API ${method} ${endpoint}`, data)
  }

  logApiError(endpoint: string, method: string, error: any): void {
    this.error(`API ${method} ${endpoint} failed`, error)
  }

  logUserAction(action: string, data?: any): void {
    this.info(`User action: ${action}`, data)
  }

  logComponentError(componentName: string, error: Error): void {
    this.error(`Component error in ${componentName}`, error)
  }

  // Configuration methods
  setLevel(level: LogLevel): void {
    this.config.level = level
  }

  setConfig(config: Partial<LogConfig>): void {
    this.config = { ...this.config, ...config }
  }
}

// Export singleton instance
export const logger = new Logger()

// Export convenience functions
export const log = {
  debug: (message: string, data?: any) => logger.debug(message, data),
  info: (message: string, data?: any) => logger.info(message, data),
  warn: (message: string, data?: any) => logger.warn(message, data),
  error: (message: string, error?: any) => logger.error(message, error),
  api: {
    call: (endpoint: string, method: string, data?: any) => logger.logApiCall(endpoint, method, data),
    error: (endpoint: string, method: string, error: any) => logger.logApiError(endpoint, method, error)
  },
  user: (action: string, data?: any) => logger.logUserAction(action, data),
  component: (componentName: string, error: Error) => logger.logComponentError(componentName, error)
}

export default logger
