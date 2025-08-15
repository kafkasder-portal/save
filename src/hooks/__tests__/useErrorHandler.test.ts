import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useErrorHandler } from '../useErrorHandler'
import { toast } from 'sonner'
import { log } from '@/utils/logger'

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  }
}))

vi.mock('@/utils/logger', () => ({
  log: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    api: {
      error: vi.fn()
    }
  }
}))

describe('useErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should handle Error objects', () => {
    const { result } = renderHook(() => useErrorHandler())
    const testError = new Error('Test error message')

    act(() => {
      result.current.handleError(testError)
    })

    expect(log.error).toHaveBeenCalledWith('Error in Unknown: Test error message', {
      name: 'Error',
      message: 'Test error message',
      stack: testError.stack
    })
    expect(toast.error).toHaveBeenCalledWith('Test error message')
  })

  it('should handle string errors', () => {
    const { result } = renderHook(() => useErrorHandler())
    const testError = 'String error message'

    act(() => {
      result.current.handleError(testError)
    })

    expect(log.error).toHaveBeenCalledWith('Error in Unknown: String error message', {
      message: 'String error message'
    })
    expect(toast.error).toHaveBeenCalledWith('String error message')
  })

  it('should handle API error objects', () => {
    const { result } = renderHook(() => useErrorHandler())
    const apiError = {
      message: 'API error message',
      details: 'API error details',
      code: 'API_ERROR',
      status: 400
    }

    act(() => {
      result.current.handleError(apiError)
    })

    expect(log.error).toHaveBeenCalledWith('Error in Unknown: API error message', apiError)
    expect(toast.error).toHaveBeenCalledWith('API error message')
  })

  it('should use custom context', () => {
    const { result } = renderHook(() => useErrorHandler({ context: 'TestComponent' }))
    const testError = new Error('Test error')

    act(() => {
      result.current.handleError(testError)
    })

    expect(log.error).toHaveBeenCalledWith('Error in TestComponent: Test error', expect.any(Object))
  })

  it('should use custom fallback message', () => {
    const { result } = renderHook(() => useErrorHandler({ 
      fallbackMessage: 'Custom fallback message' 
    }))
    const testError = null

    act(() => {
      result.current.handleError(testError)
    })

    expect(toast.error).toHaveBeenCalledWith('Custom fallback message')
  })

  it('should not show toast when disabled', () => {
    const { result } = renderHook(() => useErrorHandler({ showToast: false }))
    const testError = new Error('Test error')

    act(() => {
      result.current.handleError(testError)
    })

    expect(log.error).toHaveBeenCalled()
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('should not log when disabled', () => {
    const { result } = renderHook(() => useErrorHandler({ logError: false }))
    const testError = new Error('Test error')

    act(() => {
      result.current.handleError(testError)
    })

    expect(log.error).not.toHaveBeenCalled()
    expect(toast.error).toHaveBeenCalled()
  })

  it('should handle API errors with specific endpoint info', () => {
    const { result } = renderHook(() => useErrorHandler())
    const apiError = { message: 'API error', code: 'NETWORK_ERROR' }

    act(() => {
      result.current.handleApiError(apiError, '/api/test', 'GET')
    })

    expect(log.api.error).toHaveBeenCalledWith('/api/test', 'GET', apiError)
    expect(toast.error).toHaveBeenCalledWith('API error')
  })

  it('should handle custom messages', () => {
    const { result } = renderHook(() => useErrorHandler())
    const testError = new Error('Original error')

    act(() => {
      result.current.handleError(testError, 'Custom error message')
    })

    expect(toast.error).toHaveBeenCalledWith('Custom error message')
  })
})
