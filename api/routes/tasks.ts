import { Router, type Request, type Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Middleware to extract user from authorization header
const authenticateUser = async (req: Request, res: Response, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization required' });
  }

  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  req.user = user;
  next();
};

// Helper function to log task activity
const logTaskActivity = async (taskId: string, userId: string, action: string, details: any = {}) => {
  try {
    await supabase
      .from('task_activities')
      .insert({
        task_id: taskId,
        user_id: userId,
        action,
        details
      });
  } catch (error) {
    console.error('Error logging task activity:', error);
    // Don't fail the main operation if logging fails
  }
};

// GET /api/tasks - Get all tasks for authenticated user
router.get('/', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { status, priority, assigned_to } = req.query;
    
    let query = supabase
      .from('tasks')
      .select(`
        *,
        assignee:user_profiles!tasks_assigned_to_fkey(full_name),
        assigner:user_profiles!tasks_assigned_by_fkey(full_name),
        comments:task_comments(
          id,
          content,
          created_at,
          user:user_profiles!task_comments_user_id_fkey(full_name)
        ),
        attachments:task_attachments(
          id,
          file_name,
          file_path,
          file_size,
          mime_type,
          uploaded_at,
          uploader:user_profiles!task_attachments_uploaded_by_fkey(full_name)
        ),
        activities:task_activities(
          id,
          action,
          details,
          created_at,
          user:user_profiles!task_activities_user_id_fkey(full_name)
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (priority) {
      query = query.eq('priority', priority);
    }
    if (assigned_to) {
      query = query.eq('assigned_to', assigned_to);
    }

    const { data: tasks, error } = await query;

    if (error) {
      console.error('Error fetching tasks:', error);
      return res.status(500).json({ error: 'Failed to fetch tasks' });
    }

    res.json({ data: tasks || [] });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/tasks/:id - Get single task
router.get('/:id', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { data: task, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assignee:user_profiles!tasks_assigned_to_fkey(full_name, avatar_url),
        assigner:user_profiles!tasks_assigned_by_fkey(full_name, avatar_url),
        comments:task_comments(
          id,
          content,
          created_at,
          updated_at,
          user:user_profiles!task_comments_user_id_fkey(full_name, avatar_url)
        ),
        attachments:task_attachments(
          id,
          file_name,
          file_path,
          file_size,
          mime_type,
          uploaded_at,
          uploader:user_profiles!task_attachments_uploaded_by_fkey(full_name)
        ),
        activities:task_activities(
          id,
          action,
          details,
          created_at,
          user:user_profiles!task_activities_user_id_fkey(full_name)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching task:', error);
      return res.status(500).json({ error: 'Failed to fetch task' });
    }

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ data: task });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/tasks - Create new task
router.post('/', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { title, description, priority = 'medium', assigned_to, due_date } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        title,
        description,
        priority,
        assigned_to,
        assigned_by: req.user.id,
        due_date,
        status: 'pending'
      })
      .select(`
        *,
        assignee:user_profiles!tasks_assigned_to_fkey(full_name),
        assigner:user_profiles!tasks_assigned_by_fkey(full_name)
      `)
      .single();

    if (error) {
      console.error('Error creating task:', error);
      return res.status(500).json({ error: 'Failed to create task' });
    }

    // Log activity
    await logTaskActivity(task.id, req.user.id, 'created', {
      message: 'Task created',
      title: task.title
    });

    res.status(201).json({ data: task });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/tasks/:id - Update task
router.put('/:id', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, priority, status, assigned_to, due_date } = req.body;

    // Get current task for activity logging
    const { data: currentTask } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (!currentTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priority !== undefined) updateData.priority = priority;
    if (assigned_to !== undefined) updateData.assigned_to = assigned_to;
    if (due_date !== undefined) updateData.due_date = due_date;
    
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      } else if (currentTask.status === 'completed' && status !== 'completed') {
        updateData.completed_at = null;
      }
    }

    updateData.updated_at = new Date().toISOString();

    const { data: task, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        assignee:user_profiles!tasks_assigned_to_fkey(full_name),
        assigner:user_profiles!tasks_assigned_by_fkey(full_name)
      `)
      .single();

    if (error) {
      console.error('Error updating task:', error);
      return res.status(500).json({ error: 'Failed to update task' });
    }

    // Log status change activity
    if (status !== undefined && status !== currentTask.status) {
      await logTaskActivity(id, req.user.id, 'status_changed', {
        from: currentTask.status,
        to: status,
        message: `Status changed from ${currentTask.status} to ${status}`
      });
    }

    // Log assignment change
    if (assigned_to !== undefined && assigned_to !== currentTask.assigned_to) {
      await logTaskActivity(id, req.user.id, 'assigned', {
        from: currentTask.assigned_to,
        to: assigned_to,
        message: 'Task assignment changed'
      });
    }

    // Log priority change
    if (priority !== undefined && priority !== currentTask.priority) {
      await logTaskActivity(id, req.user.id, 'priority_changed', {
        from: currentTask.priority,
        to: priority,
        message: `Priority changed from ${currentTask.priority} to ${priority}`
      });
    }

    res.json({ data: task });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('assigned_by', req.user.id); // Only task creator can delete

    if (error) {
      console.error('Error deleting task:', error);
      return res.status(500).json({ error: 'Failed to delete task' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/tasks/:id/comments - Add comment to task
router.post('/:id/comments', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const { data: comment, error } = await supabase
      .from('task_comments')
      .insert({
        task_id: id,
        user_id: req.user.id,
        content
      })
      .select(`
        *,
        user:user_profiles!task_comments_user_id_fkey(full_name, avatar_url)
      `)
      .single();

    if (error) {
      console.error('Error adding comment:', error);
      return res.status(500).json({ error: 'Failed to add comment' });
    }

    // Log activity
    await logTaskActivity(id, req.user.id, 'commented', {
      message: 'Added comment',
      comment_preview: content.substring(0, 100)
    });

    res.status(201).json({ data: comment });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/tasks/:id/comments/:commentId - Update comment
router.put('/:id/comments/:commentId', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const { data: comment, error } = await supabase
      .from('task_comments')
      .update({
        content,
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId)
      .eq('user_id', req.user.id) // Only comment author can update
      .select(`
        *,
        user:user_profiles!task_comments_user_id_fkey(full_name, avatar_url)
      `)
      .single();

    if (error) {
      console.error('Error updating comment:', error);
      return res.status(500).json({ error: 'Failed to update comment' });
    }

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found or not authorized' });
    }

    res.json({ data: comment });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/tasks/:id/comments/:commentId - Delete comment
router.delete('/:id/comments/:commentId', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;

    const { error } = await supabase
      .from('task_comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', req.user.id); // Only comment author can delete

    if (error) {
      console.error('Error deleting comment:', error);
      return res.status(500).json({ error: 'Failed to delete comment' });
    }

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/tasks/:id/attachments - Add attachment to task
router.post('/:id/attachments', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { file_name, file_path, file_size, mime_type } = req.body;

    if (!file_name || !file_path) {
      return res.status(400).json({ error: 'file_name and file_path are required' });
    }

    const { data: attachment, error } = await supabase
      .from('task_attachments')
      .insert({
        task_id: id,
        file_name,
        file_path,
        file_size,
        mime_type,
        uploaded_by: req.user.id
      })
      .select(`
        *,
        uploader:user_profiles!task_attachments_uploaded_by_fkey(full_name)
      `)
      .single();

    if (error) {
      console.error('Error adding attachment:', error);
      return res.status(500).json({ error: 'Failed to add attachment' });
    }

    // Log activity
    await logTaskActivity(id, req.user.id, 'attachment_added', {
      message: 'File attachment added',
      file_name: file_name
    });

    res.status(201).json({ data: attachment });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/tasks/:id/attachments/:attachmentId - Delete attachment
router.delete('/:id/attachments/:attachmentId', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { attachmentId } = req.params;

    // Get attachment info before deleting
    const { data: attachment } = await supabase
      .from('task_attachments')
      .select('file_name, file_path')
      .eq('id', attachmentId)
      .eq('uploaded_by', req.user.id)
      .single();

    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found or not authorized' });
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('task-attachments')
      .remove([attachment.file_path]);

    if (storageError) {
      console.error('Error deleting file from storage:', storageError);
      // Continue with database deletion even if storage deletion fails
    }

    // Delete from database
    const { error } = await supabase
      .from('task_attachments')
      .delete()
      .eq('id', attachmentId)
      .eq('uploaded_by', req.user.id);

    if (error) {
      console.error('Error deleting attachment:', error);
      return res.status(500).json({ error: 'Failed to delete attachment' });
    }

    res.json({ message: 'Attachment deleted successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/tasks/:id/activities - Get task activities
router.get('/:id/activities', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { data: activities, error } = await supabase
      .from('task_activities')
      .select(`
        *,
        user:user_profiles!task_activities_user_id_fkey(full_name, avatar_url)
      `)
      .eq('task_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching activities:', error);
      return res.status(500).json({ error: 'Failed to fetch activities' });
    }

    res.json({ data: activities || [] });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
