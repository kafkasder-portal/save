-- Row Level Security Policies for all tables
-- This migration creates comprehensive RLS policies for secure data access

-- MEETING MODULE POLICIES
-- =======================

-- Meetings policies
CREATE POLICY "Users can view meetings they organize or participate in" ON meetings
    FOR SELECT USING (
        organizer_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM meeting_participants mp 
            WHERE mp.meeting_id = meetings.id AND mp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create meetings" ON meetings
    FOR INSERT WITH CHECK (organizer_id = auth.uid());

CREATE POLICY "Meeting organizers can update their meetings" ON meetings
    FOR UPDATE USING (organizer_id = auth.uid());

CREATE POLICY "Meeting organizers can delete their meetings" ON meetings
    FOR DELETE USING (organizer_id = auth.uid());

-- Meeting participants policies
CREATE POLICY "Users can view participants of meetings they're involved in" ON meeting_participants
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM meetings m 
            WHERE m.id = meeting_participants.meeting_id 
            AND (m.organizer_id = auth.uid() OR EXISTS (
                SELECT 1 FROM meeting_participants mp2
                WHERE mp2.meeting_id = m.id AND mp2.user_id = auth.uid()
            ))
        )
    );

CREATE POLICY "Meeting organizers can manage participants" ON meeting_participants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM meetings m 
            WHERE m.id = meeting_participants.meeting_id AND m.organizer_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own participation status" ON meeting_participants
    FOR UPDATE USING (user_id = auth.uid());

-- Meeting agenda items policies
CREATE POLICY "Users can view agenda for meetings they're involved in" ON meeting_agenda_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM meetings m 
            WHERE m.id = meeting_agenda_items.meeting_id 
            AND (m.organizer_id = auth.uid() OR EXISTS (
                SELECT 1 FROM meeting_participants mp
                WHERE mp.meeting_id = m.id AND mp.user_id = auth.uid()
            ))
        )
    );

CREATE POLICY "Meeting organizers can manage agenda items" ON meeting_agenda_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM meetings m 
            WHERE m.id = meeting_agenda_items.meeting_id AND m.organizer_id = auth.uid()
        )
    );

-- Meeting notes policies
CREATE POLICY "Users can view notes for meetings they're involved in" ON meeting_notes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM meetings m 
            WHERE m.id = meeting_notes.meeting_id 
            AND (m.organizer_id = auth.uid() OR EXISTS (
                SELECT 1 FROM meeting_participants mp
                WHERE mp.meeting_id = m.id AND mp.user_id = auth.uid()
            ))
        )
    );

CREATE POLICY "Meeting participants can create notes" ON meeting_notes
    FOR INSERT WITH CHECK (
        created_by = auth.uid() AND
        EXISTS (
            SELECT 1 FROM meetings m 
            WHERE m.id = meeting_notes.meeting_id 
            AND (m.organizer_id = auth.uid() OR EXISTS (
                SELECT 1 FROM meeting_participants mp
                WHERE mp.meeting_id = m.id AND mp.user_id = auth.uid()
            ))
        )
    );

CREATE POLICY "Note creators can update their notes" ON meeting_notes
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Note creators can delete their notes" ON meeting_notes
    FOR DELETE USING (created_by = auth.uid());

-- Meeting action items policies
CREATE POLICY "Users can view action items for meetings they're involved in" ON meeting_action_items
    FOR SELECT USING (
        assigned_to = auth.uid() OR
        EXISTS (
            SELECT 1 FROM meetings m 
            WHERE m.id = meeting_action_items.meeting_id 
            AND (m.organizer_id = auth.uid() OR EXISTS (
                SELECT 1 FROM meeting_participants mp
                WHERE mp.meeting_id = m.id AND mp.user_id = auth.uid()
            ))
        )
    );

CREATE POLICY "Meeting organizers can manage action items" ON meeting_action_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM meetings m 
            WHERE m.id = meeting_action_items.meeting_id AND m.organizer_id = auth.uid()
        )
    );

CREATE POLICY "Assigned users can update their action items" ON meeting_action_items
    FOR UPDATE USING (assigned_to = auth.uid());

-- TASK MODULE POLICIES
-- ====================

-- Tasks policies
CREATE POLICY "Users can view tasks assigned to them or created by them" ON tasks
    FOR SELECT USING (assigned_to = auth.uid() OR assigned_by = auth.uid());

CREATE POLICY "Users can create tasks" ON tasks
    FOR INSERT WITH CHECK (assigned_by = auth.uid());

CREATE POLICY "Task creators and assignees can update tasks" ON tasks
    FOR UPDATE USING (assigned_to = auth.uid() OR assigned_by = auth.uid());

CREATE POLICY "Task creators can delete tasks" ON tasks
    FOR DELETE USING (assigned_by = auth.uid());

-- Task comments policies
CREATE POLICY "Users can view comments on their tasks" ON task_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tasks t 
            WHERE t.id = task_comments.task_id 
            AND (t.assigned_to = auth.uid() OR t.assigned_by = auth.uid())
        )
    );

CREATE POLICY "Users can comment on their tasks" ON task_comments
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM tasks t 
            WHERE t.id = task_comments.task_id 
            AND (t.assigned_to = auth.uid() OR t.assigned_by = auth.uid())
        )
    );

CREATE POLICY "Comment creators can update their comments" ON task_comments
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Comment creators can delete their comments" ON task_comments
    FOR DELETE USING (user_id = auth.uid());

-- Task attachments policies
CREATE POLICY "Users can view attachments on their tasks" ON task_attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tasks t 
            WHERE t.id = task_attachments.task_id 
            AND (t.assigned_to = auth.uid() OR t.assigned_by = auth.uid())
        )
    );

CREATE POLICY "Users can upload attachments to their tasks" ON task_attachments
    FOR INSERT WITH CHECK (
        uploaded_by = auth.uid() AND
        EXISTS (
            SELECT 1 FROM tasks t 
            WHERE t.id = task_attachments.task_id 
            AND (t.assigned_to = auth.uid() OR t.assigned_by = auth.uid())
        )
    );

CREATE POLICY "Uploaders can update their attachments" ON task_attachments
    FOR UPDATE USING (uploaded_by = auth.uid());

CREATE POLICY "Uploaders can delete their attachments" ON task_attachments
    FOR DELETE USING (uploaded_by = auth.uid());

-- Task activities policies (read-only for users, system can insert)
CREATE POLICY "Users can view activities on their tasks" ON task_activities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tasks t 
            WHERE t.id = task_activities.task_id 
            AND (t.assigned_to = auth.uid() OR t.assigned_by = auth.uid())
        )
    );

CREATE POLICY "System can log task activities" ON task_activities
    FOR INSERT WITH CHECK (true);

-- MESSAGING MODULE POLICIES
-- =========================

-- Conversations policies
CREATE POLICY "Users can view conversations they participate in" ON conversations
    FOR SELECT USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM conversation_participants cp 
            WHERE cp.conversation_id = conversations.id AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create conversations" ON conversations
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Conversation creators can update conversations" ON conversations
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Conversation creators can delete conversations" ON conversations
    FOR DELETE USING (created_by = auth.uid());

-- Conversation participants policies
CREATE POLICY "Users can view participants in their conversations" ON conversation_participants
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM conversation_participants cp2 
            WHERE cp2.conversation_id = conversation_participants.conversation_id 
            AND cp2.user_id = auth.uid()
        )
    );

CREATE POLICY "Conversation creators can add participants" ON conversation_participants
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM conversations c 
            WHERE c.id = conversation_participants.conversation_id 
            AND c.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can update their own participation" ON conversation_participants
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Conversation creators and users themselves can remove participants" ON conversation_participants
    FOR DELETE USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM conversations c 
            WHERE c.id = conversation_participants.conversation_id 
            AND c.created_by = auth.uid()
        )
    );

-- Internal messages policies
CREATE POLICY "Users can view messages in their conversations" ON internal_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants cp 
            WHERE cp.conversation_id = internal_messages.conversation_id 
            AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can send messages to their conversations" ON internal_messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM conversation_participants cp 
            WHERE cp.conversation_id = internal_messages.conversation_id 
            AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own messages" ON internal_messages
    FOR UPDATE USING (sender_id = auth.uid());

CREATE POLICY "Users can delete their own messages" ON internal_messages
    FOR DELETE USING (sender_id = auth.uid());

-- Message reactions policies
CREATE POLICY "Users can view reactions on messages they can see" ON message_reactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM internal_messages im
            JOIN conversation_participants cp ON cp.conversation_id = im.conversation_id
            WHERE im.id = message_reactions.message_id 
            AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can react to messages they can see" ON message_reactions
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM internal_messages im
            JOIN conversation_participants cp ON cp.conversation_id = im.conversation_id
            WHERE im.id = message_reactions.message_id 
            AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own reactions" ON message_reactions
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own reactions" ON message_reactions
    FOR DELETE USING (user_id = auth.uid());

-- Functions to update timestamps
-- ==============================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at columns
CREATE TRIGGER update_meetings_updated_at
    BEFORE UPDATE ON meetings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meeting_action_items_updated_at
    BEFORE UPDATE ON meeting_action_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_comments_updated_at
    BEFORE UPDATE ON task_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_internal_messages_updated_at
    BEFORE UPDATE ON internal_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
