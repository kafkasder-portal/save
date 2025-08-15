import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const startTime = Date.now()
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    version: process.env.npm_package_version || '1.0.0',
    checks: {
      database: 'unknown',
      memory: 'unknown'
    },
    responseTime: 0
  }

  try {
    // Check database connection
    try {
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1)
      
      if (error) {
        healthCheck.checks.database = 'error'
        healthCheck.status = 'degraded'
      } else {
        healthCheck.checks.database = 'healthy'
      }
    } catch (error) {
      healthCheck.checks.database = 'error'
      healthCheck.status = 'degraded'
    }

    // Check memory usage (if available)
    if (process.memoryUsage) {
      const memUsage = process.memoryUsage()
      const memUsageMB = {
        rss: Math.round(memUsage.rss / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024)
      }

      if (memUsageMB.heapUsed > 512) {
        healthCheck.checks.memory = 'warning'
        if (healthCheck.status === 'healthy') {
          healthCheck.status = 'degraded'
        }
      } else {
        healthCheck.checks.memory = 'healthy'
      }

      healthCheck.memoryUsage = memUsageMB
    }

    // Calculate response time
    healthCheck.responseTime = Date.now() - startTime

    // Determine overall status
    const errorChecks = Object.values(healthCheck.checks).filter(check => check === 'error').length
    const warningChecks = Object.values(healthCheck.checks).filter(check => check === 'warning').length

    if (errorChecks > 0) {
      healthCheck.status = 'unhealthy'
      res.status(503)
    } else if (warningChecks > 0) {
      healthCheck.status = 'degraded'
      res.status(200)
    } else {
      healthCheck.status = 'healthy'
      res.status(200)
    }

    res.json(healthCheck)

  } catch (error) {
    healthCheck.status = 'unhealthy'
    healthCheck.error = error instanceof Error ? error.message : 'Unknown error'
    healthCheck.responseTime = Date.now() - startTime
    
    res.status(503).json(healthCheck)
  }
}
