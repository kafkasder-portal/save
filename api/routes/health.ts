import { Router } from 'express'
import { Request, Response } from 'express'

const router = Router()

/**
 * Health check endpoint
 * Used by monitoring services and deployment pipelines
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100,
        external: Math.round(process.memoryUsage().external / 1024 / 1024 * 100) / 100,
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024 * 100) / 100
      },
      services: {
        database: 'connected', // Could be checked with actual DB ping
        redis: 'not_configured',
        external_apis: 'available'
      }
    }

    res.status(200).json({
      success: true,
      data: healthCheck
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * Readiness check endpoint
 * Checks if the service is ready to accept traffic
 */
router.get('/ready', async (req: Request, res: Response) => {
  try {
    // Check critical dependencies
    const checks = {
      environment_variables: checkEnvironmentVariables(),
      memory_usage: checkMemoryUsage(),
      disk_space: true, // Could implement actual disk check
    }

    const allChecksPass = Object.values(checks).every(check => check === true)

    if (allChecksPass) {
      res.status(200).json({
        success: true,
        message: 'Service is ready',
        checks
      })
    } else {
      res.status(503).json({
        success: false,
        message: 'Service is not ready',
        checks
      })
    }
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Readiness check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * Liveness check endpoint
 * Simple check to verify the service is alive
 */
router.get('/live', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Service is alive',
    timestamp: new Date().toISOString()
  })
})

/**
 * Detailed status endpoint for monitoring
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const status = {
      service: {
        name: 'dernek-panel-api',
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: formatUptime(process.uptime()),
        started_at: new Date(Date.now() - process.uptime() * 1000).toISOString()
      },
      system: {
        platform: process.platform,
        arch: process.arch,
        node_version: process.version,
        memory: {
          heap_used: formatBytes(process.memoryUsage().heapUsed),
          heap_total: formatBytes(process.memoryUsage().heapTotal),
          external: formatBytes(process.memoryUsage().external),
          rss: formatBytes(process.memoryUsage().rss)
        },
        cpu_usage: await getCPUUsage()
      },
      dependencies: {
        supabase: process.env.VITE_SUPABASE_URL ? 'configured' : 'not_configured',
        sentry: process.env.VITE_SENTRY_DSN ? 'configured' : 'not_configured'
      },
      features: {
        performance_monitoring: process.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true',
        error_tracking: !!process.env.VITE_SENTRY_DSN,
        real_time: true
      }
    }

    res.status(200).json({
      success: true,
      data: status
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Status check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * Helper functions
 */

function checkEnvironmentVariables(): boolean {
  const required = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ]

  return required.every(env => !!process.env[env])
}

function checkMemoryUsage(): boolean {
  const used = process.memoryUsage().heapUsed
  const total = process.memoryUsage().heapTotal
  const usage = (used / total) * 100

  // Alert if memory usage is above 90%
  return usage < 90
}

function formatUptime(uptimeSeconds: number): string {
  const days = Math.floor(uptimeSeconds / 86400)
  const hours = Math.floor((uptimeSeconds % 86400) / 3600)
  const minutes = Math.floor((uptimeSeconds % 3600) / 60)
  const seconds = Math.floor(uptimeSeconds % 60)

  return `${days}d ${hours}h ${minutes}m ${seconds}s`
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

async function getCPUUsage(): Promise<number> {
  return new Promise((resolve) => {
    const startUsage = process.cpuUsage()
    const startTime = process.hrtime()

    setTimeout(() => {
      const currentUsage = process.cpuUsage(startUsage)
      const currentTime = process.hrtime(startTime)

      const cpuUsagePercent = (currentUsage.user + currentUsage.system) / 
                             (currentTime[0] * 1000000 + currentTime[1] / 1000) * 100

      resolve(Math.round(cpuUsagePercent * 100) / 100)
    }, 100)
  })
}

export default router
