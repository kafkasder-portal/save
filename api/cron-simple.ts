/**
 * Simple Vercel serverless function for cron jobs
 * This can be used directly with Vercel Cron Jobs
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Basic authentication check
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ') || !process.env.CRON_SECRET) {
      return res.status(401).json({ 
        success: false,
        error: 'Unauthorized' 
      });
    }

    const token = authHeader.split(' ')[1];
    if (token !== process.env.CRON_SECRET) {
      return res.status(401).json({ 
        success: false,
        error: 'Unauthorized' 
      });
    }

    // Log the cron execution
    console.log('Cron job executed at:', new Date().toISOString());

    // Your cron logic here
    const result = {
      message: 'Hello Cron!',
      timestamp: new Date().toISOString(),
      status: 'success'
    };

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Cron error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
