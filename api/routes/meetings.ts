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

// GET /api/meetings - Get all meetings for authenticated user
router.get('/', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { data: meetings, error } = await supabase
      .from('meetings')
      .select(`
        *,
        organizer:user_profiles!meetings_organizer_id_fkey(full_name),
        participants:meeting_participants(
          id,
          user_id,
          role,
          response_status,
          attendance_status,
          user:user_profiles!meeting_participants_user_id_fkey(full_name)
        )
      `)
      .order('start_date', { ascending: false });

    if (error) {
      console.error('Error fetching meetings:', error);
      return res.status(500).json({ error: 'Failed to fetch meetings' });
    }

    res.json({ data: meetings || [] });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/meetings/:id - Get single meeting
router.get('/:id', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { data: meeting, error } = await supabase
      .from('meetings')
      .select(`
        *,
        organizer:user_profiles!meetings_organizer_id_fkey(full_name),
        participants:meeting_participants(
          id,
          user_id,
          role,
          response_status,
          attendance_status,
          user:user_profiles!meeting_participants_user_id_fkey(full_name)
        ),
        agenda_items:meeting_agenda_items(
          id,
          title,
          description,
          presenter_id,
          duration_minutes,
          order_index,
          status,
          presenter:user_profiles!meeting_agenda_items_presenter_id_fkey(full_name)
        ),
        notes:meeting_notes(
          id,
          content,
          created_by,
          created_at,
          author:user_profiles!meeting_notes_created_by_fkey(full_name)
        ),
        action_items:meeting_action_items(
          id,
          title,
          description,
          assigned_to,
          due_date,
          status,
          assigned_user:user_profiles!meeting_action_items_assigned_to_fkey(full_name)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching meeting:', error);
      return res.status(500).json({ error: 'Failed to fetch meeting' });
    }

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    res.json({ data: meeting });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/meetings - Create new meeting
router.post('/', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { title, description, start_date, end_date, location, meeting_type, meeting_link, participants = [] } = req.body;

    if (!title || !start_date || !end_date) {
      return res.status(400).json({ error: 'Title, start_date, and end_date are required' });
    }

    // Create meeting
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .insert({
        title,
        description,
        start_date,
        end_date,
        location,
        meeting_type: meeting_type || 'physical',
        meeting_link,
        organizer_id: req.user.id
      })
      .select()
      .single();

    if (meetingError) {
      console.error('Error creating meeting:', meetingError);
      return res.status(500).json({ error: 'Failed to create meeting' });
    }

    // Add participants if provided
    if (participants.length > 0) {
      const participantData = participants.map((participant: any) => ({
        meeting_id: meeting.id,
        user_id: participant.user_id,
        role: participant.role || 'attendee'
      }));

      const { error: participantError } = await supabase
        .from('meeting_participants')
        .insert(participantData);

      if (participantError) {
        console.error('Error adding participants:', participantError);
        // Don't fail the request, just log the error
      }
    }

    res.status(201).json({ data: meeting });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/meetings/:id - Update meeting
router.put('/:id', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, start_date, end_date, location, meeting_type, meeting_link, status } = req.body;

    const { data: meeting, error } = await supabase
      .from('meetings')
      .update({
        title,
        description,
        start_date,
        end_date,
        location,
        meeting_type,
        meeting_link,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organizer_id', req.user.id) // Only organizer can update
      .select()
      .single();

    if (error) {
      console.error('Error updating meeting:', error);
      return res.status(500).json({ error: 'Failed to update meeting' });
    }

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found or not authorized' });
    }

    res.json({ data: meeting });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/meetings/:id - Delete meeting
router.delete('/:id', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('meetings')
      .delete()
      .eq('id', id)
      .eq('organizer_id', req.user.id); // Only organizer can delete

    if (error) {
      console.error('Error deleting meeting:', error);
      return res.status(500).json({ error: 'Failed to delete meeting' });
    }

    res.json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/meetings/:id/participants - Add participant to meeting
router.post('/:id/participants', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { user_id, role = 'attendee' } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    // Check if user is organizer
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('organizer_id')
      .eq('id', id)
      .single();

    if (meetingError || !meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    if (meeting.organizer_id !== req.user.id) {
      return res.status(403).json({ error: 'Only meeting organizer can add participants' });
    }

    const { data: participant, error } = await supabase
      .from('meeting_participants')
      .insert({
        meeting_id: id,
        user_id,
        role
      })
      .select(`
        *,
        user:user_profiles!meeting_participants_user_id_fkey(full_name)
      `)
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return res.status(409).json({ error: 'User is already a participant' });
      }
      console.error('Error adding participant:', error);
      return res.status(500).json({ error: 'Failed to add participant' });
    }

    res.status(201).json({ data: participant });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/meetings/:id/participants/:participantId - Update participant response
router.put('/:id/participants/:participantId', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { participantId } = req.params;
    const { response_status, attendance_status } = req.body;

    const updateData: any = {};
    if (response_status) {
      updateData.response_status = response_status;
      updateData.responded_at = new Date().toISOString();
    }
    if (attendance_status) {
      updateData.attendance_status = attendance_status;
    }

    const { data: participant, error } = await supabase
      .from('meeting_participants')
      .update(updateData)
      .eq('id', participantId)
      .eq('user_id', req.user.id) // Users can only update their own participation
      .select()
      .single();

    if (error) {
      console.error('Error updating participant:', error);
      return res.status(500).json({ error: 'Failed to update participant' });
    }

    if (!participant) {
      return res.status(404).json({ error: 'Participant not found or not authorized' });
    }

    res.json({ data: participant });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/meetings/:id/agenda - Add agenda item
router.post('/:id/agenda', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, presenter_id, duration_minutes, order_index } = req.body;

    if (!title || order_index === undefined) {
      return res.status(400).json({ error: 'title and order_index are required' });
    }

    // Check if user is organizer
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('organizer_id')
      .eq('id', id)
      .single();

    if (meetingError || !meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    if (meeting.organizer_id !== req.user.id) {
      return res.status(403).json({ error: 'Only meeting organizer can add agenda items' });
    }

    const { data: agendaItem, error } = await supabase
      .from('meeting_agenda_items')
      .insert({
        meeting_id: id,
        title,
        description,
        presenter_id,
        duration_minutes,
        order_index
      })
      .select(`
        *,
        presenter:user_profiles!meeting_agenda_items_presenter_id_fkey(full_name)
      `)
      .single();

    if (error) {
      console.error('Error adding agenda item:', error);
      return res.status(500).json({ error: 'Failed to add agenda item' });
    }

    res.status(201).json({ data: agendaItem });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/meetings/:id/notes - Add meeting note
router.post('/:id/notes', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'content is required' });
    }

    const { data: note, error } = await supabase
      .from('meeting_notes')
      .insert({
        meeting_id: id,
        content,
        created_by: req.user.id
      })
      .select(`
        *,
        author:user_profiles!meeting_notes_created_by_fkey(full_name)
      `)
      .single();

    if (error) {
      console.error('Error adding note:', error);
      return res.status(500).json({ error: 'Failed to add note' });
    }

    res.status(201).json({ data: note });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/meetings/:id/action-items - Add action item
router.post('/:id/action-items', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, assigned_to, due_date } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'title is required' });
    }

    const { data: actionItem, error } = await supabase
      .from('meeting_action_items')
      .insert({
        meeting_id: id,
        title,
        description,
        assigned_to,
        due_date
      })
      .select(`
        *,
        assigned_user:user_profiles!meeting_action_items_assigned_to_fkey(full_name)
      `)
      .single();

    if (error) {
      console.error('Error adding action item:', error);
      return res.status(500).json({ error: 'Failed to add action item' });
    }

    res.status(201).json({ data: actionItem });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
