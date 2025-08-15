import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { redis } from '../middleware/rateLimit';

const router = Router();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Health check endpoint
router.get('/health', async (req, res) => {
  const startTime = Date.now();
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    checks: {
      database: 'unknown',
      redis: 'unknown',
      memory: 'unknown',
      disk: 'unknown'
    },
    responseTime: 0
  };

  try {
    // Check database connection
    try {
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      if (error) {
        healthCheck.checks.database = 'error';
        healthCheck.status = 'degraded';
      } else {
        healthCheck.checks.database = 'healthy';
      }
    } catch (error) {
      healthCheck.checks.database = 'error';
      healthCheck.status = 'degraded';
    }

    // Check Redis connection
    try {
      await redis.ping();
      healthCheck.checks.redis = 'healthy';
    } catch (error) {
      healthCheck.checks.redis = 'error';
      healthCheck.status = 'degraded';
    }

    // Check memory usage
    const memUsage = process.memoryUsage();
    const memUsageMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024)
    };

    if (memUsageMB.heapUsed > 512) { // 512MB threshold
      healthCheck.checks.memory = 'warning';
      if (healthCheck.status === 'healthy') {
        healthCheck.status = 'degraded';
      }
    } else {
      healthCheck.checks.memory = 'healthy';
    }

    // Add memory usage to response
    healthCheck.memoryUsage = memUsageMB;

    // Check disk space (if available)
    try {
      const fs = await import('fs/promises');
      const stats = await fs.stat('/');
      const freeSpace = stats.blocks * 512; // Approximate free space in bytes
      const freeSpaceGB = Math.round(freeSpace / 1024 / 1024 / 1024);
      
      if (freeSpaceGB < 1) { // Less than 1GB
        healthCheck.checks.disk = 'warning';
        if (healthCheck.status === 'healthy') {
          healthCheck.status = 'degraded';
        }
      } else {
        healthCheck.checks.disk = 'healthy';
      }
      
      healthCheck.diskSpace = {
        freeSpaceGB,
        totalSpaceGB: Math.round((stats.blocks * 512) / 1024 / 1024 / 1024)
      };
    } catch (error) {
      healthCheck.checks.disk = 'unknown';
    }

    // Calculate response time
    healthCheck.responseTime = Date.now() - startTime;

    // Determine overall status
    const errorChecks = Object.values(healthCheck.checks).filter(check => check === 'error').length;
    const warningChecks = Object.values(healthCheck.checks).filter(check => check === 'warning').length;

    if (errorChecks > 0) {
      healthCheck.status = 'unhealthy';
      res.status(503);
    } else if (warningChecks > 0) {
      healthCheck.status = 'degraded';
      res.status(200);
    } else {
      healthCheck.status = 'healthy';
      res.status(200);
    }

    res.json(healthCheck);

  } catch (error) {
    healthCheck.status = 'unhealthy';
    healthCheck.error = error instanceof Error ? error.message : 'Unknown error';
    healthCheck.responseTime = Date.now() - startTime;
    
    res.status(503).json(healthCheck);
  }
});

// Detailed health check (for monitoring systems)
router.get('/health/detailed', async (req, res) => {
  const detailedHealth = {
    timestamp: new Date().toISOString(),
    system: {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      pid: process.pid,
      uptime: process.uptime()
    },
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      SUPABASE_URL: process.env.SUPABASE_URL ? 'configured' : 'not configured'
    },
    services: {}
  };

  try {
    // Database detailed check
    try {
      const startTime = Date.now();
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      detailedHealth.services.database = {
        status: error ? 'error' : 'healthy',
        responseTime: Date.now() - startTime,
        error: error?.message
      };
    } catch (error) {
      detailedHealth.services.database = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Redis detailed check
    try {
      const startTime = Date.now();
      await redis.ping();
      detailedHealth.services.redis = {
        status: 'healthy',
        responseTime: Date.now() - startTime
      };
    } catch (error) {
      detailedHealth.services.redis = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    res.json(detailedHealth);
  } catch (error) {
    res.status(500).json({
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Readiness probe (for Kubernetes)
router.get('/ready', async (req, res) => {
  try {
    // Check if database is accessible
    const { error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      return res.status(503).json({ status: 'not ready', reason: 'database unavailable' });
    }

    // Check if Redis is accessible
    try {
      await redis.ping();
    } catch (error) {
      return res.status(503).json({ status: 'not ready', reason: 'redis unavailable' });
    }

    res.json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ 
      status: 'not ready', 
      reason: error instanceof Error ? error.message : 'unknown error' 
    });
  }
});

// Liveness probe (for Kubernetes)
router.get('/live', (req, res) => {
  res.json({ status: 'alive', timestamp: new Date().toISOString() });
});

export default router;
