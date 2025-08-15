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

// GET /api/conversations - Get all conversations for authenticated user
router.get('/conversations', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        *,
        creator:user_profiles!conversations_created_by_fkey(full_name, avatar_url),
        participants:conversation_participants(
          id,
          user_id,
          role,
          joined_at,
          last_read_at,
          is_muted,
          user:user_profiles!conversation_participants_user_id_fkey(full_name, avatar_url)
        ),
        last_message:internal_messages(
          id,
          content,
          message_type,
          created_at,
          sender:user_profiles!internal_messages_sender_id_fkey(full_name)
        )
      `)
      .order('last_message_at', { ascending: false, nullsFirst: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return res.status(500).json({ error: 'Failed to fetch conversations' });
    }

    // Filter to only show conversations where user is a participant
    const filteredConversations = conversations?.filter(conv => 
      conv.participants?.some((p: any) => p.user_id === req.user.id)
    ) || [];

    res.json({ data: filteredConversations });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/conversations/:id - Get single conversation with messages
router.get('/conversations/:id', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    // First check if user is a participant
    const { data: participation, error: participationError } = await supabase
      .from('conversation_participants')
      .select('id')
      .eq('conversation_id', id)
      .eq('user_id', req.user.id)
      .single();

    if (participationError || !participation) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get conversation details
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .select(`
        *,
        creator:user_profiles!conversations_created_by_fkey(full_name, avatar_url),
        participants:conversation_participants(
          id,
          user_id,
          role,
          joined_at,
          last_read_at,
          is_muted,
          user:user_profiles!conversation_participants_user_id_fkey(full_name, avatar_url)
        )
      `)
      .eq('id', id)
      .single();

    if (conversationError || !conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Get messages
    const { data: messages, error: messagesError } = await supabase
      .from('internal_messages')
      .select(`
        *,
        sender:user_profiles!internal_messages_sender_id_fkey(full_name, avatar_url),
        reply_to_message:internal_messages!internal_messages_reply_to_fkey(
          id,
          content,
          sender:user_profiles!internal_messages_sender_id_fkey(full_name)
        ),
        reactions:message_reactions(
          id,
          emoji,
          user_id,
          created_at,
          user:user_profiles!message_reactions_user_id_fkey(full_name)
        )
      `)
      .eq('conversation_id', id)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }

    // Update user's last read timestamp
    await supabase
      .from('conversation_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', id)
      .eq('user_id', req.user.id);

    res.json({ 
      data: {
        ...conversation,
        messages: messages || []
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/conversations - Create new conversation
router.post('/conversations', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { title, description, type = 'group', is_private = false, participants = [] } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Create conversation
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .insert({
        title,
        description,
        type,
        is_private,
        created_by: req.user.id
      })
      .select()
      .single();

    if (conversationError) {
      console.error('Error creating conversation:', conversationError);
      return res.status(500).json({ error: 'Failed to create conversation' });
    }

    // Add creator as admin participant
    const participantData = [
      {
        conversation_id: conversation.id,
        user_id: req.user.id,
        role: 'admin'
      }
    ];

    // Add other participants
    if (participants.length > 0) {
      const otherParticipants = participants.map((participant: any) => ({
        conversation_id: conversation.id,
        user_id: participant.user_id,
        role: participant.role || 'member'
      }));
      participantData.push(...otherParticipants);
    }

    const { error: participantError } = await supabase
      .from('conversation_participants')
      .insert(participantData);

    if (participantError) {
      console.error('Error adding participants:', participantError);
      // Don't fail the request, just log the error
    }

    res.status(201).json({ data: conversation });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/conversations/:id - Update conversation
router.put('/conversations/:id', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, is_archived } = req.body;

    const { data: conversation, error } = await supabase
      .from('conversations')
      .update({
        title,
        description,
        is_archived,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('created_by', req.user.id) // Only creator can update
      .select()
      .single();

    if (error) {
      console.error('Error updating conversation:', error);
      return res.status(500).json({ error: 'Failed to update conversation' });
    }

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found or not authorized' });
    }

    res.json({ data: conversation });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/conversations/:id/participants - Add participant to conversation
router.post('/conversations/:id/participants', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { user_id, role = 'member' } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    // Check if current user has permission to add participants
    const { data: userParticipation, error: permissionError } = await supabase
      .from('conversation_participants')
      .select('role')
      .eq('conversation_id', id)
      .eq('user_id', req.user.id)
      .single();

    if (permissionError || !userParticipation || userParticipation.role === 'member') {
      return res.status(403).json({ error: 'Only admins and moderators can add participants' });
    }

    const { data: participant, error } = await supabase
      .from('conversation_participants')
      .insert({
        conversation_id: id,
        user_id,
        role
      })
      .select(`
        *,
        user:user_profiles!conversation_participants_user_id_fkey(full_name, avatar_url)
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

// DELETE /api/conversations/:id/participants/:userId - Remove participant
router.delete('/conversations/:id/participants/:userId', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id, userId } = req.params;

    // Users can remove themselves, or admins can remove others
    const canRemove = userId === req.user.id;
    
    if (!canRemove) {
      // Check if current user is admin
      const { data: userParticipation } = await supabase
        .from('conversation_participants')
        .select('role')
        .eq('conversation_id', id)
        .eq('user_id', req.user.id)
        .single();

      if (!userParticipation || userParticipation.role !== 'admin') {
        return res.status(403).json({ error: 'Only admins can remove other participants' });
      }
    }

    const { error } = await supabase
      .from('conversation_participants')
      .delete()
      .eq('conversation_id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error removing participant:', error);
      return res.status(500).json({ error: 'Failed to remove participant' });
    }

    res.json({ message: 'Participant removed successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/conversations/:id/messages - Send message to conversation
router.post('/conversations/:id/messages', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content, message_type = 'text', file_path, file_name, file_size, reply_to } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Check if user is a participant
    const { data: participation, error: participationError } = await supabase
      .from('conversation_participants')
      .select('id')
      .eq('conversation_id', id)
      .eq('user_id', req.user.id)
      .single();

    if (participationError || !participation) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { data: message, error } = await supabase
      .from('internal_messages')
      .insert({
        conversation_id: id,
        sender_id: req.user.id,
        content,
        message_type,
        file_path,
        file_name,
        file_size,
        reply_to
      })
      .select(`
        *,
        sender:user_profiles!internal_messages_sender_id_fkey(full_name, avatar_url),
        reply_to_message:internal_messages!internal_messages_reply_to_fkey(
          id,
          content,
          sender:user_profiles!internal_messages_sender_id_fkey(full_name)
        )
      `)
      .single();

    if (error) {
      console.error('Error sending message:', error);
      return res.status(500).json({ error: 'Failed to send message' });
    }

    // Update conversation's last message timestamp
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', id);

    res.status(201).json({ data: message });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/messages/:messageId - Update message
router.put('/messages/:messageId', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const { data: message, error } = await supabase
      .from('internal_messages')
      .update({
        content,
        is_edited: true,
        edited_at: new Date().toISOString()
      })
      .eq('id', messageId)
      .eq('sender_id', req.user.id) // Only sender can edit
      .select(`
        *,
        sender:user_profiles!internal_messages_sender_id_fkey(full_name, avatar_url)
      `)
      .single();

    if (error) {
      console.error('Error updating message:', error);
      return res.status(500).json({ error: 'Failed to update message' });
    }

    if (!message) {
      return res.status(404).json({ error: 'Message not found or not authorized' });
    }

    res.json({ data: message });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/messages/:messageId - Delete message
router.delete('/messages/:messageId', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;

    // Get message info before deleting (for file cleanup)
    const { data: message } = await supabase
      .from('internal_messages')
      .select('file_path, message_type')
      .eq('id', messageId)
      .eq('sender_id', req.user.id)
      .single();

    if (!message) {
      return res.status(404).json({ error: 'Message not found or not authorized' });
    }

    // Delete file from storage if it exists
    if (message.file_path && message.message_type === 'file') {
      const { error: storageError } = await supabase.storage
        .from('message-files')
        .remove([message.file_path]);

      if (storageError) {
        console.error('Error deleting file from storage:', storageError);
        // Continue with message deletion even if file deletion fails
      }
    }

    // Delete message from database
    const { error } = await supabase
      .from('internal_messages')
      .delete()
      .eq('id', messageId)
      .eq('sender_id', req.user.id);

    if (error) {
      console.error('Error deleting message:', error);
      return res.status(500).json({ error: 'Failed to delete message' });
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/messages/:messageId/reactions - Add reaction to message
router.post('/messages/:messageId/reactions', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({ error: 'Emoji is required' });
    }

    const { data: reaction, error } = await supabase
      .from('message_reactions')
      .insert({
        message_id: messageId,
        user_id: req.user.id,
        emoji
      })
      .select(`
        *,
        user:user_profiles!message_reactions_user_id_fkey(full_name, avatar_url)
      `)
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return res.status(409).json({ error: 'You have already reacted with this emoji' });
      }
      console.error('Error adding reaction:', error);
      return res.status(500).json({ error: 'Failed to add reaction' });
    }

    res.status(201).json({ data: reaction });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/messages/:messageId/reactions/:reactionId - Remove reaction
router.delete('/messages/:messageId/reactions/:reactionId', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { reactionId } = req.params;

    const { error } = await supabase
      .from('message_reactions')
      .delete()
      .eq('id', reactionId)
      .eq('user_id', req.user.id); // Only user who reacted can remove

    if (error) {
      console.error('Error removing reaction:', error);
      return res.status(500).json({ error: 'Failed to remove reaction' });
    }

    res.json({ message: 'Reaction removed successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/conversations/:id/unread-count - Get unread message count
router.get('/conversations/:id/unread-count', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get user's last read timestamp
    const { data: participation } = await supabase
      .from('conversation_participants')
      .select('last_read_at')
      .eq('conversation_id', id)
      .eq('user_id', req.user.id)
      .single();

    if (!participation) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Count messages after last read timestamp
    let query = supabase
      .from('internal_messages')
      .select('id', { count: 'exact', head: true })
      .eq('conversation_id', id)
      .neq('sender_id', req.user.id); // Don't count own messages

    if (participation.last_read_at) {
      query = query.gt('created_at', participation.last_read_at);
    }

    const { count, error } = await query;

    if (error) {
      console.error('Error getting unread count:', error);
      return res.status(500).json({ error: 'Failed to get unread count' });
    }

    res.json({ data: { unread_count: count || 0 } });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
