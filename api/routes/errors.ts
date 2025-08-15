import { Router, type Request, type Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

// Initialize Supabase client with service role for error logging
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

interface ErrorLogRequest {
  id: string
  message: string
  stack?: string
  code?: string
  category: string
  severity: string
  context: {
    userId?: string
    userEmail?: string
    userRole?: string
    component?: string
    action?: string
    url?: string
    timestamp?: string
    userAgent?: string
    sessionId?: string
    additionalData?: Record<string, any>
  }
  timestamp: string
  resolved: boolean
}

// POST /api/errors - Log client-side errors
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const errorData: ErrorLogRequest = req.body

    // Validate required fields
    if (!errorData.message || !errorData.category || !errorData.severity) {
      res.status(400).json({ error: 'Missing required fields: message, category, severity' })
      return
    }

    // Sanitize and prepare error data for storage
    const sanitizedError = {
      error_id: errorData.id,
      message: errorData.message.substring(0, 1000), // Limit message length
      stack_trace: errorData.stack?.substring(0, 5000), // Limit stack trace length
      error_code: errorData.code,
      category: errorData.category,
      severity: errorData.severity,
      user_id: errorData.context.userId,
      user_email: errorData.context.userEmail,
      user_role: errorData.context.userRole,
      component: errorData.context.component,
      action: errorData.context.action,
      url: errorData.context.url,
      user_agent: errorData.context.userAgent,
      session_id: errorData.context.sessionId,
      additional_data: errorData.context.additionalData ? JSON.stringify(errorData.context.additionalData) : null,
      occurred_at: errorData.timestamp,
      resolved: false,
      created_at: new Date().toISOString()
    }

    // Store error in database
    const { error: dbError } = await supabaseAdmin
      .from('error_logs')
      .insert(sanitizedError)

    if (dbError) {
      console.error('Database error while logging client error:', dbError)
      
      // Still return success to client to avoid recursive errors
      res.status(200).json({ 
        message: 'Error logged (with warnings)',
        errorId: errorData.id
      })
      return
    }

    // Check if this is a critical error that needs immediate attention
    if (errorData.severity === 'critical') {
      // Send notification to admins (implement based on your notification system)
      await sendCriticalErrorNotification(sanitizedError)
    }

    res.status(200).json({ 
      message: 'Error logged successfully',
      errorId: errorData.id
    })

  } catch (error) {
    console.error('Error logging endpoint failed:', error)
    
    // Don't throw error back to client to avoid recursive logging
    res.status(200).json({ 
      message: 'Error logging failed silently',
      errorId: req.body.id || 'unknown'
    })
  }
})

// GET /api/errors - Retrieve error logs (admin only)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    // This should be protected by admin auth middleware
    const {
      limit = 100,
      offset = 0,
      category,
      severity,
      resolved,
      user_id,
      start_date,
      end_date
    } = req.query

    let query = supabaseAdmin
      .from('error_logs')
      .select('*')
      .order('occurred_at', { ascending: false })

    // Apply filters
    if (category) {
      query = query.eq('category', category)
    }

    if (severity) {
      query = query.eq('severity', severity)
    }

    if (resolved !== undefined) {
      query = query.eq('resolved', resolved === 'true')
    }

    if (user_id) {
      query = query.eq('user_id', user_id)
    }

    if (start_date) {
      query = query.gte('occurred_at', start_date)
    }

    if (end_date) {
      query = query.lte('occurred_at', end_date)
    }

    // Apply pagination
    query = query.range(Number(offset), Number(offset) + Number(limit) - 1)

    const { data: errors, error: fetchError } = await query

    if (fetchError) {
      console.error('Error fetching error logs:', fetchError)
      res.status(500).json({ error: 'Failed to fetch error logs' })
      return
    }

    res.json({ 
      data: errors || [],
      pagination: {
        limit: Number(limit),
        offset: Number(offset),
        total: errors?.length || 0
      }
    })

  } catch (error) {
    console.error('Error retrieving error logs:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/errors/stats - Get error statistics (admin only)
router.get('/stats', async (req: Request, res: Response): Promise<void> => {
  try {
    const { start_date, end_date } = req.query

    let query = supabaseAdmin
      .from('error_logs')
      .select('category, severity, resolved, occurred_at')

    if (start_date) {
      query = query.gte('occurred_at', start_date)
    }

    if (end_date) {
      query = query.lte('occurred_at', end_date)
    }

    const { data: errors, error: fetchError } = await query

    if (fetchError) {
      console.error('Error fetching error stats:', fetchError)
      res.status(500).json({ error: 'Failed to fetch error statistics' })
      return
    }

    // Calculate statistics
    const stats = {
      total: errors?.length || 0,
      resolved: errors?.filter(e => e.resolved).length || 0,
      unresolved: errors?.filter(e => !e.resolved).length || 0,
      byCategory: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      byDate: {} as Record<string, number>
    }

    errors?.forEach(error => {
      // Count by category
      stats.byCategory[error.category] = (stats.byCategory[error.category] || 0) + 1
      
      // Count by severity
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1
      
      // Count by date (YYYY-MM-DD)
      const date = error.occurred_at.split('T')[0]
      stats.byDate[date] = (stats.byDate[date] || 0) + 1
    })

    res.json({ data: stats })

  } catch (error) {
    console.error('Error calculating error stats:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// PUT /api/errors/:id/resolve - Mark error as resolved (admin only)
router.put('/:id/resolve', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { resolved_by, resolution_notes } = req.body

    const { data: updatedError, error: updateError } = await supabaseAdmin
      .from('error_logs')
      .update({
        resolved: true,
        resolved_at: new Date().toISOString(),
        resolved_by,
        resolution_notes
      })
      .eq('error_id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating error status:', updateError)
      res.status(500).json({ error: 'Failed to update error status' })
      return
    }

    if (!updatedError) {
      res.status(404).json({ error: 'Error not found' })
      return
    }

    res.json({ 
      message: 'Error marked as resolved',
      data: updatedError
    })

  } catch (error) {
    console.error('Error resolving error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// DELETE /api/errors - Clear old error logs (admin only)
router.delete('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { older_than_days = 30 } = req.query

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - Number(older_than_days))

    const { error: deleteError } = await supabaseAdmin
      .from('error_logs')
      .delete()
      .lt('occurred_at', cutoffDate.toISOString())

    if (deleteError) {
      console.error('Error deleting old error logs:', deleteError)
      res.status(500).json({ error: 'Failed to delete old error logs' })
      return
    }

    res.json({ 
      message: `Error logs older than ${older_than_days} days have been deleted`
    })

  } catch (error) {
    console.error('Error deleting old error logs:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Send critical error notification
async function sendCriticalErrorNotification(errorData: any): Promise<void> {
  try {
    // This is a placeholder - implement based on your notification system
    // Could send email, Slack message, SMS, etc.
    
    console.error('CRITICAL ERROR DETECTED:', {
      errorId: errorData.error_id,
      message: errorData.message,
      component: errorData.component,
      userId: errorData.user_id,
      timestamp: errorData.occurred_at
    })

    // Example: Send email notification
    // await sendEmail({
    //   to: 'admin@dernek.com',
    //   subject: 'Critical Error in Dernek Panel',
    //   body: `Critical error detected: ${errorData.message}`
    // })

  } catch (notificationError) {
    console.error('Failed to send critical error notification:', notificationError)
  }
}

export default router;
