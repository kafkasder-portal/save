import { useEffect, useRef, useCallback } from 'react'
import { log } from '@/utils/logger'

interface PerformanceMetrics {
  componentName: string
  renderTime: number
  mountTime: number
  updateCount: number
  memoryUsage?: number
}

interface PerformanceConfig {
  enabled: boolean
  logToConsole: boolean
  sendToAnalytics: boolean
  threshold: number // ms
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics> = new Map()
  private config: PerformanceConfig

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      enabled: true,
      logToConsole: false,
      sendToAnalytics: false,
      threshold: 16, // 60fps threshold
      ...config
    }
  }

  startMeasure(componentName: string): string {
    if (!this.config.enabled) return ''
    
    const measureId = `${componentName}_${Date.now()}`
    performance.mark(`${measureId}_start`)
    
    return measureId
  }

  endMeasure(measureId: string, componentName: string): void {
    if (!this.config.enabled || !measureId) return

    performance.mark(`${measureId}_end`)
    performance.measure(measureId, `${measureId}_start`, `${measureId}_end`)

    const measure = performance.getEntriesByName(measureId)[0]
    const renderTime = measure.duration

    const existing = this.metrics.get(componentName) || {
      componentName,
      renderTime: 0,
      mountTime: 0,
      updateCount: 0
    }

    const updated: PerformanceMetrics = {
      ...existing,
      renderTime: Math.max(existing.renderTime, renderTime),
      updateCount: existing.updateCount + 1
    }

    this.metrics.set(componentName, updated)

    // Log slow renders
    if (renderTime > this.config.threshold) {
      log.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`)
    }

    if (this.config.logToConsole) {
      log.debug(`Performance: ${componentName} rendered in ${renderTime.toFixed(2)}ms`)
    }

    // Clean up performance marks
    performance.clearMarks(`${measureId}_start`)
    performance.clearMarks(`${measureId}_end`)
    performance.clearMeasures(measureId)
  }

  getMetrics(componentName?: string): PerformanceMetrics[] {
    if (componentName) {
      const metric = this.metrics.get(componentName)
      return metric ? [metric] : []
    }
    return Array.from(this.metrics.values())
  }

  getSlowComponents(threshold?: number): PerformanceMetrics[] {
    const t = threshold || this.config.threshold
    return this.getMetrics().filter(metric => metric.renderTime > t)
  }

  reset(): void {
    this.metrics.clear()
  }
}

// Global performance monitor instance
const performanceMonitor = new PerformanceMonitor({
  enabled: import.meta.env.DEV,
  logToConsole: import.meta.env.DEV,
  threshold: 16
})

export const usePerformance = (componentName: string) => {
  const measureIdRef = useRef<string>('')
  const mountTimeRef = useRef<number>(0)
  const updateCountRef = useRef<number>(0)

  // Measure mount time
  useEffect(() => {
    mountTimeRef.current = performance.now()
    const measureId = performanceMonitor.startMeasure(componentName)
    measureIdRef.current = measureId

    return () => {
      performanceMonitor.endMeasure(measureId, componentName)
    }
  }, [componentName])

  // Measure update time
  useEffect(() => {
    updateCountRef.current += 1
    const measureId = performanceMonitor.startMeasure(componentName)
    measureIdRef.current = measureId

    return () => {
      performanceMonitor.endMeasure(measureId, componentName)
    }
  })

  const getMetrics = useCallback(() => {
    return performanceMonitor.getMetrics(componentName)
  }, [componentName])

  const getSlowComponents = useCallback(() => {
    return performanceMonitor.getSlowComponents()
  }, [])

  return {
    getMetrics,
    getSlowComponents,
    reset: performanceMonitor.reset.bind(performanceMonitor)
  }
}

// Web Vitals monitoring
export const useWebVitals = () => {
  useEffect(() => {
    if (!import.meta.env.DEV) return

    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const metric = {
          name: entry.name,
          value: entry.value,
          rating: getRating(entry.name, entry.value),
          delta: entry.value,
          id: entry.id,
          navigationType: entry.navigationType
        }

        log.info('Web Vital:', metric)

        // Send to analytics if configured
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', metric.name, {
            value: Math.round(metric.value),
            event_label: metric.id,
            event_category: 'Web Vitals'
          })
        }
      }
    })

    // Observe different types of metrics
    observer.observe({ entryTypes: ['largest-contentful-paint'] })
    observer.observe({ entryTypes: ['first-input'] })
    observer.observe({ entryTypes: ['layout-shift'] })

    return () => observer.disconnect()
  }, [])
}

// Helper function to determine rating
function getRating(metricName: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds: Record<string, { good: number; poor: number }> = {
    'LCP': { good: 2500, poor: 4000 },
    'FID': { good: 100, poor: 300 },
    'CLS': { good: 0.1, poor: 0.25 }
  }

  const threshold = thresholds[metricName]
  if (!threshold) return 'good'

  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

// Memory usage monitoring
export const useMemoryMonitor = () => {
  useEffect(() => {
    if (!import.meta.env.DEV || !('memory' in performance)) return

    const interval = setInterval(() => {
      const memory = (performance as any).memory
      const usage = {
        used: Math.round(memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
      }

      const usagePercent = (usage.used / usage.limit) * 100

      if (usagePercent > 80) {
        log.warn('High memory usage detected:', usage)
      }

      log.debug('Memory usage:', usage)
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])
}
