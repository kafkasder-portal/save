// Error severity levels
export const ErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
} as const;

export type ErrorSeverity = typeof ErrorSeverity[keyof typeof ErrorSeverity];

// Error categories
export const ErrorCategory = {
  VALIDATION: 'validation',
  NETWORK: 'network',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  SERVER: 'server',
  CLIENT: 'client',
  SYSTEM: 'system',
  UNKNOWN: 'unknown'
} as const;

export type ErrorCategory = typeof ErrorCategory[keyof typeof ErrorCategory];

// Error context interface
export interface ErrorContext {
  url?: string;
  timestamp?: string;
  userAgent?: string;
  sessionId?: string;
  component?: string;
  action?: string;
  additionalData?: Record<string, any>;
}

// Error log interface
export interface ErrorLog {
  id: string;
  message: string;
  stack?: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  context: ErrorContext;
  timestamp: string;
  userId?: string;
  resolved?: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  notes?: string;
}

// Error statistics interface
export interface ErrorStats {
  total: number;
  byCategory: Record<ErrorCategory, number>;
  bySeverity: Record<ErrorSeverity, number>;
  byDate: Record<string, number>;
  unresolved: number;
  resolved: number;
}
