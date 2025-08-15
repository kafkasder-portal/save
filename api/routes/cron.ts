import { Router, Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

/**
 * Middleware to authenticate cron jobs
 * Verifies the Bearer token matches CRON_SECRET
 */
const authenticateCron = (req: Request, res: Response, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Check if authorization header exists and has correct format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        error: 'Authorization header required' 
      });
    }

    // Check if CRON_SECRET is configured
    if (!process.env.CRON_SECRET) {
      console.error('CRON_SECRET environment variable not configured');
      return res.status(500).json({ 
        success: false,
        error: 'Server configuration error' 
      });
    }

    // Extract and verify token
    const token = authHeader.split(' ')[1];
    if (token !== process.env.CRON_SECRET) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid authentication token' 
      });
    }

    next();
  } catch (error) {
    console.error('Cron authentication error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Authentication failed' 
    });
  }
};

/**
 * Test cron endpoint
 * GET /api/cron/test
 */
router.get('/test', authenticateCron, (req: Request, res: Response) => {
  try {
    console.log('Cron test endpoint called at:', new Date().toISOString());
    
    res.status(200).json({
      success: true,
      message: 'Hello Cron!',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    console.error('Cron test error:', error);
    res.status(500).json({
      success: false,
      error: 'Cron test failed'
    });
  }
});

/**
 * Cleanup tasks cron job
 * POST /api/cron/cleanup
 */
router.post('/cleanup', authenticateCron, async (req: Request, res: Response) => {
  try {
    console.log('Running cleanup tasks at:', new Date().toISOString());
    
    // Add your cleanup logic here
    const tasks = [
      'Clear temporary files',
      'Clean up expired sessions',
      'Archive old logs',
      'Update statistics'
    ];

    // Simulate cleanup work
    const results = tasks.map(task => ({
      task,
      status: 'completed',
      timestamp: new Date().toISOString()
    }));

    console.log('Cleanup completed:', results);

    res.status(200).json({
      success: true,
      message: 'Cleanup completed successfully',
      data: {
        tasksRun: results.length,
        results,
        duration: process.uptime()
      }
    });
  } catch (error) {
    console.error('Cleanup cron error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Cleanup failed'
    });
  }
});

/**
 * Database maintenance cron job
 * POST /api/cron/maintenance
 */
router.post('/maintenance', authenticateCron, async (req: Request, res: Response) => {
  try {
    console.log('Running database maintenance at:', new Date().toISOString());
    
    // Add your database maintenance logic here
    const maintenanceTasks = [
      'Vacuum database',
      'Update indexes',
      'Analyze table statistics',
      'Clean orphaned records'
    ];

    // Simulate maintenance work
    const results = maintenanceTasks.map(task => ({
      task,
      status: 'completed',
      timestamp: new Date().toISOString()
    }));

    console.log('Maintenance completed:', results);

    res.status(200).json({
      success: true,
      message: 'Database maintenance completed successfully',
      data: {
        tasksRun: results.length,
        results,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Maintenance cron error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Maintenance failed'
    });
  }
});

/**
 * Health check for cron jobs
 * GET /api/cron/health
 */
router.get('/health', authenticateCron, (req: Request, res: Response) => {
  try {
    const cronHealth = {
      status: 'healthy',
      cron_secret_configured: !!process.env.CRON_SECRET,
      timestamp: new Date().toISOString(),
      server_uptime: process.uptime(),
      memory_usage: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100
      }
    };

    res.status(200).json({
      success: true,
      data: cronHealth
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Cron health check failed'
    });
  }
});

export default router;
