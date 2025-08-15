-- =====================================================
-- Migration: Add Collaboration Modules
-- Description: Adds tables for Meetings, Internal Messages, and Tasks modules
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- MEETINGS MODULE
-- =====================================================

-- Meetings table
CREATE TABLE public.meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    location VARCHAR(255),
    meeting_type VARCHAR(20) NOT NULL CHECK (meeting_type IN ('physical', 'online', 'hybrid')),
    meeting_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled')),
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meeting attendees table
CREATE TABLE public.meeting_attendees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'accepted', 'declined', 'maybe', 'attended', 'absent')),
    response_date TIMESTAMPTZ,
    notes TEXT,
    UNIQUE(meeting_id, user_id)
);

-- Meeting agenda table
CREATE TABLE public.meeting_agenda (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER,
    order_index INTEGER NOT NULL DEFAULT 0,
    presenter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Meeting minutes table
CREATE TABLE public.meeting_minutes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meeting action items table
CREATE TABLE public.meeting_action_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    due_date TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meeting notifications table
CREATE TABLE public.meeting_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('invitation', 'reminder', 'update', 'cancellation')),
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

-- =====================================================
-- INTERNAL MESSAGES MODULE
-- =====================================================

-- Conversations table
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255),
    conversation_type VARCHAR(10) NOT NULL CHECK (conversation_type IN ('direct', 'group')),
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    description TEXT,
    avatar_url TEXT,
    is_archived BOOLEAN DEFAULT FALSE,
    last_message_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation participants table
CREATE TABLE public.conversation_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(10) NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    is_muted BOOLEAN DEFAULT FALSE,
    last_read_at TIMESTAMPTZ,
    UNIQUE(conversation_id, user_id)
);

-- Internal messages table
CREATE TABLE public.internal_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(10) NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    file_url TEXT,
    file_name VARCHAR(255),
    file_size BIGINT,
    reply_to UUID REFERENCES public.internal_messages(id) ON DELETE SET NULL,
    edited_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Message reactions table
CREATE TABLE public.message_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES public.internal_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    emoji VARCHAR(10) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, user_id, emoji)
);

-- Message notifications table
CREATE TABLE public.message_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    message_id UUID NOT NULL REFERENCES public.internal_messages(id) ON DELETE CASCADE,
    type VARCHAR(15) NOT NULL CHECK (type IN ('new_message', 'mention', 'reply')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

-- =====================================================
-- TASKS MODULE
-- =====================================================

-- Tasks table
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    due_date TIMESTAMPTZ,
    priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(15) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'overdue')),
    category VARCHAR(100),
    estimated_hours DECIMAL(8,2),
    actual_hours DECIMAL(8,2),
    completion_notes TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task comments table
CREATE TABLE public.task_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task attachments table
CREATE TABLE public.task_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task notifications table
CREATE TABLE public.task_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('assignment', 'due_reminder', 'completion', 'comment', 'status_change')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

-- Task activities table
CREATE TABLE public.task_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type VARCHAR(20) NOT NULL CHECK (activity_type IN ('created', 'assigned', 'status_changed', 'commented', 'completed', 'due_date_changed')),
    old_value TEXT,
    new_value TEXT,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Meetings indexes
CREATE INDEX idx_meetings_created_by ON public.meetings(created_by);
CREATE INDEX idx_meetings_start_date ON public.meetings(start_date);
CREATE INDEX idx_meetings_status ON public.meetings(status);
CREATE INDEX idx_meeting_attendees_meeting_id ON public.meeting_attendees(meeting_id);
CREATE INDEX idx_meeting_attendees_user_id ON public.meeting_attendees(user_id);

-- Messages indexes
CREATE INDEX idx_conversations_created_by ON public.conversations(created_by);
CREATE INDEX idx_conversations_updated_at ON public.conversations(updated_at);
CREATE INDEX idx_conversation_participants_conversation_id ON public.conversation_participants(conversation_id);
CREATE INDEX idx_conversation_participants_user_id ON public.conversation_participants(user_id);
CREATE INDEX idx_internal_messages_conversation_id ON public.internal_messages(conversation_id);
CREATE INDEX idx_internal_messages_sender_id ON public.internal_messages(sender_id);
CREATE INDEX idx_internal_messages_created_at ON public.internal_messages(created_at);

-- Tasks indexes
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_assigned_by ON public.tasks(assigned_by);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_tasks_priority ON public.tasks(priority);
CREATE INDEX idx_task_comments_task_id ON public.task_comments(task_id);
CREATE INDEX idx_task_activities_task_id ON public.task_activities(task_id);

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS on all new tables
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_agenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_minutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_activities ENABLE ROW LEVEL SECURITY;

-- Meetings RLS Policies
CREATE POLICY "Users can view meetings they are invited to or created"
    ON public.meetings FOR SELECT
    USING (
        created_by = auth.uid() OR 
        id IN (SELECT meeting_id FROM public.meeting_attendees WHERE user_id = auth.uid())
    );

CREATE POLICY "Users with meetings permissions can insert meetings"
    ON public.meetings FOR INSERT
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "Meeting creators can update their meetings"
    ON public.meetings FOR UPDATE
    USING (created_by = auth.uid());

CREATE POLICY "Meeting creators can delete their meetings"
    ON public.meetings FOR DELETE
    USING (created_by = auth.uid());

-- Meeting attendees policies
CREATE POLICY "Users can view meeting attendees for meetings they have access to"
    ON public.meeting_attendees FOR SELECT
    USING (
        meeting_id IN (
            SELECT id FROM public.meetings WHERE 
            created_by = auth.uid() OR 
            id IN (SELECT meeting_id FROM public.meeting_attendees WHERE user_id = auth.uid())
        )
    );

-- Conversations RLS Policies
CREATE POLICY "Users can view conversations they participate in"
    ON public.conversations FOR SELECT
    USING (
        id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can create conversations"
    ON public.conversations FOR INSERT
    WITH CHECK (created_by = auth.uid());

-- Internal messages RLS Policies
CREATE POLICY "Users can view messages in conversations they participate in"
    ON public.internal_messages FOR SELECT
    USING (
        conversation_id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can send messages to conversations they participate in"
    ON public.internal_messages FOR INSERT
    WITH CHECK (
        sender_id = auth.uid() AND
        conversation_id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid())
    );

-- Tasks RLS Policies
CREATE POLICY "Users can view tasks assigned to them or created by them"
    ON public.tasks FOR SELECT
    USING (assigned_to = auth.uid() OR assigned_by = auth.uid());

CREATE POLICY "Users can create tasks"
    ON public.tasks FOR INSERT
    WITH CHECK (assigned_by = auth.uid());

CREATE POLICY "Users can update tasks they created or are assigned to"
    ON public.tasks FOR UPDATE
    USING (assigned_to = auth.uid() OR assigned_by = auth.uid());

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_meetings_updated_at 
    BEFORE UPDATE ON public.meetings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at 
    BEFORE UPDATE ON public.conversations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_internal_messages_updated_at 
    BEFORE UPDATE ON public.internal_messages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON public.tasks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_comments_updated_at 
    BEFORE UPDATE ON public.task_comments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- =====================================================

-- Function to automatically mark tasks as overdue
CREATE OR REPLACE FUNCTION mark_overdue_tasks()
RETURNS void AS $$
BEGIN
    UPDATE public.tasks 
    SET status = 'overdue' 
    WHERE due_date < NOW() 
    AND status IN ('pending', 'in_progress');
END;
$$ LANGUAGE plpgsql;

-- Function to get task statistics for a user
CREATE OR REPLACE FUNCTION get_user_task_stats(user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total', COUNT(*),
        'pending', COUNT(*) FILTER (WHERE status = 'pending'),
        'in_progress', COUNT(*) FILTER (WHERE status = 'in_progress'),
        'completed', COUNT(*) FILTER (WHERE status = 'completed'),
        'overdue', COUNT(*) FILTER (WHERE status = 'overdue'),
        'completion_rate', COALESCE(
            ROUND(
                COUNT(*) FILTER (WHERE status = 'completed') * 100.0 / 
                NULLIF(COUNT(*) FILTER (WHERE status != 'cancelled'), 0),
                2
            ), 
            0
        )
    )
    INTO result
    FROM public.tasks
    WHERE assigned_to = user_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to update conversation last_message_at
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations 
    SET last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_last_message_trigger
    AFTER INSERT ON public.internal_messages
    FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- This section can be uncommented for testing purposes
/*
INSERT INTO public.conversations (id, name, conversation_type, created_by, description) VALUES
    (uuid_generate_v4(), 'Genel Duyurular', 'group', (SELECT id FROM auth.users LIMIT 1), 'Dernek geneli duyurular için');
*/
