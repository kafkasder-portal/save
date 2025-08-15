import { useCallback } from 'react'
import { toast } from 'sonner'
import { log } from '@/utils/logger'

interface ErrorHandlerOptions {
  showToast?: boolean
  logError?: boolean
  fallbackMessage?: string
  context?: string
}

interface ApiError {
  message?: string
  details?: string
  code?: string
  status?: number
}

/**
 * Custom hook for centralized error handling
 * Provides consistent error handling across the application
 */
export const useErrorHandler = (options: ErrorHandlerOptions = {}) => {
  const {
    showToast = true,
    logError = true,
    fallbackMessage = 'Bir hata oluştu',
    context = 'Unknown'
  } = options

  const handleError = useCallback((error: unknown, customMessage?: string): void => {
    // Extract error information
    let errorMessage = customMessage || fallbackMessage
    let errorDetails: any = error

    if (error instanceof Error) {
      errorMessage = customMessage || error.message || fallbackMessage
      errorDetails = {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    } else if (typeof error === 'string') {
      errorMessage = customMessage || error || fallbackMessage
      errorDetails = { message: error }
    } else if (error && typeof error === 'object') {
      const apiError = error as ApiError
      errorMessage = customMessage || apiError.message || apiError.details || fallbackMessage
      errorDetails = error
    }

    // Log error if enabled
    if (logError) {
      log.error(`Error in ${context}: ${errorMessage}`, errorDetails)
    }

    // Show toast if enabled
    if (showToast) {
      toast.error(errorMessage)
    }
  }, [showToast, logError, fallbackMessage, context])

  const handleApiError = useCallback((
    error: unknown, 
    endpoint: string, 
    method: string,
    customMessage?: string
  ): void => {
    const apiContext = `${method} ${endpoint}`
    
    // Log API error specifically
    log.api.error(endpoint, method, error)
    
    // Handle specific API error cases
    if (error && typeof error === 'object') {
      const apiError = error as ApiError
      
      // Handle common API error codes
      switch (apiError.code) {
        case 'PGRST116':
          handleError(error, 'Veritabanı tablosu bulunamadı. Lütfen sistem yöneticisi ile iletişime geçin.')
          return
        case 'PGRST202':
          handleError(error, 'Veritabanı bağlantısı başarısız. Lütfen internet bağlantınızı kontrol edin.')
          return
        case '401':
          handleError(error, 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.')
          return
        case '403':
          handleError(error, 'Bu işlem için yetkiniz bulunmamaktadır.')
          return
        case '404':
          handleError(error, 'İstenen kaynak bulunamadı.')
          return
        case '500':
          handleError(error, 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.')
          return
      }
    }
    
    handleError(error, customMessage)
  }, [handleError])

  const handleValidationError = useCallback((errors: Record<string, string[]>): void => {
    const errorMessages = Object.values(errors).flat()
    const message = errorMessages.length > 0 
      ? `Doğrulama hataları: ${errorMessages.join(', ')}`
      : 'Form doğrulama hatası'
    
    handleError(new Error(message), message)
  }, [handleError])

  const handleNetworkError = useCallback((error: unknown): void => {
    const message = 'Ağ bağlantısı hatası. Lütfen internet bağlantınızı kontrol edin.'
    handleError(error, message)
  }, [handleError])

  const handleTimeoutError = useCallback((error: unknown): void => {
    const message = 'İşlem zaman aşımına uğradı. Lütfen tekrar deneyin.'
    handleError(error, message)
  }, [handleError])

  return {
    handleError,
    handleApiError,
    handleValidationError,
    handleNetworkError,
    handleTimeoutError
  }
}

/**
 * Hook for handling async operations with error handling
 */
export const useAsyncErrorHandler = (options: ErrorHandlerOptions = {}) => {
  const errorHandler = useErrorHandler(options)

  const handleAsync = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    errorMessage?: string
  ): Promise<T | null> => {
    try {
      return await asyncFn()
    } catch (error) {
      errorHandler.handleError(error, errorMessage)
      return null
    }
  }, [errorHandler])

  const handleAsyncWithFallback = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    fallbackValue: T,
    errorMessage?: string
  ): Promise<T> => {
    try {
      return await asyncFn()
    } catch (error) {
      errorHandler.handleError(error, errorMessage)
      return fallbackValue
    }
  }, [errorHandler])

  return {
    handleAsync,
    handleAsyncWithFallback,
    ...errorHandler
  }
}

export default useErrorHandler
