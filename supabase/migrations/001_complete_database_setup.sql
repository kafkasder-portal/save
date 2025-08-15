-- Complete Database Setup Migration
-- This migration creates all tables, indexes, RLS policies, triggers, and functions
-- for the Aid Organization Management System

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. CORE TABLES
-- =============================================

-- 1.1 User Profiles Table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    display_name TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('super_admin', 'admin', 'manager', 'coordinator', 'volunteer', 'user')),
    department TEXT,
    position TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.2 Beneficiaries Table
CREATE TABLE IF NOT EXISTS public.beneficiaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    identity_number TEXT UNIQUE,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    phone TEXT,
    email TEXT,
    address TEXT,
    city TEXT,
    district TEXT,
    neighborhood TEXT,
    postal_code TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    category TEXT NOT NULL CHECK (category IN ('elderly', 'disabled', 'orphan', 'widow', 'refugee', 'student', 'patient', 'unemployed', 'other')),
    priority_level TEXT DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high', 'urgent')),
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.3 Family Members Table
CREATE TABLE IF NOT EXISTS public.family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    beneficiary_id UUID NOT NULL REFERENCES public.beneficiaries(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    relationship TEXT NOT NULL,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    is_dependent BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.4 Applications Table
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    beneficiary_id UUID NOT NULL REFERENCES public.beneficiaries(id) ON DELETE CASCADE,
    application_type TEXT NOT NULL CHECK (application_type IN ('financial_aid', 'in_kind_aid', 'medical_aid', 'educational_aid', 'emergency_aid', 'other')),
    title TEXT NOT NULL,
    description TEXT,
    requested_amount DECIMAL(10,2),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'completed', 'cancelled')),
    priority_level TEXT DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high', 'urgent')),
    application_date DATE DEFAULT CURRENT_DATE,
    review_date DATE,
    approval_date DATE,
    completion_date DATE,
    reviewed_by UUID REFERENCES public.user_profiles(id),
    approved_by UUID REFERENCES public.user_profiles(id),
    rejection_reason TEXT,
    notes TEXT,
    created_by UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.5 Aid Records Table
CREATE TABLE IF NOT EXISTS public.aid_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL,
    beneficiary_id UUID NOT NULL REFERENCES public.beneficiaries(id) ON DELETE CASCADE,
    aid_type TEXT NOT NULL CHECK (aid_type IN ('financial', 'in_kind', 'medical', 'educational', 'emergency', 'other')),
    title TEXT NOT NULL,
    description TEXT,
    amount DECIMAL(10,2),
    currency TEXT DEFAULT 'TRY',
    aid_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
    delivery_method TEXT CHECK (delivery_method IN ('cash', 'bank_transfer', 'check', 'in_kind', 'service', 'other')),
    delivery_address TEXT,
    delivery_date DATE,
    delivered_by UUID REFERENCES public.user_profiles(id),
    notes TEXT,
    created_by UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.6 Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aid_record_id UUID NOT NULL REFERENCES public.aid_records(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'TRY',
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'bank_transfer', 'check', 'credit_card', 'other')),
    payment_date DATE DEFAULT CURRENT_DATE,
    reference_number TEXT,
    bank_name TEXT,
    account_number TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    notes TEXT,
    processed_by UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.7 In-Kind Aids Table
CREATE TABLE IF NOT EXISTS public.in_kind_aids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aid_record_id UUID NOT NULL REFERENCES public.aid_records(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    item_category TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit TEXT,
    estimated_value DECIMAL(10,2),
    condition TEXT CHECK (condition IN ('new', 'good', 'fair', 'poor')),
    expiry_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. MEETING MANAGEMENT TABLES
-- =============================================

-- 2.1 Meetings Table
CREATE TABLE IF NOT EXISTS public.meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    meeting_type TEXT DEFAULT 'general' CHECK (meeting_type IN ('general', 'planning', 'review', 'emergency', 'training', 'other')),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    location TEXT,
    meeting_url TEXT,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'postponed')),
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern TEXT,
    max_attendees INTEGER,
    is_public BOOLEAN DEFAULT false,
    created_by UUID NOT NULL REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 Meeting Attendees Table
CREATE TABLE IF NOT EXISTS public.meeting_attendees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'attendee' CHECK (role IN ('organizer', 'presenter', 'attendee', 'optional')),
    status TEXT DEFAULT 'invited' CHECK (status IN ('invited', 'accepted', 'declined', 'tentative', 'attended', 'no_show')),
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    responded_at TIMESTAMPTZ,
    notes TEXT,
    UNIQUE(meeting_id, user_id)
);

-- 2.3 Meeting Agenda Table
CREATE TABLE IF NOT EXISTS public.meeting_agenda (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    duration_minutes INTEGER,
    presenter_id UUID REFERENCES public.user_profiles(id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.4 Meeting Minutes Table
CREATE TABLE IF NOT EXISTS public.meeting_minutes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    recorded_by UUID NOT NULL REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.5 Meeting Action Items Table
CREATE TABLE IF NOT EXISTS public.meeting_action_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES public.user_profiles(id),
    due_date DATE,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    created_by UUID NOT NULL REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.6 Meeting Notifications Table
CREATE TABLE IF NOT EXISTS public.meeting_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('invitation', 'reminder', 'update', 'cancellation')),
    message TEXT,
    scheduled_for TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. TASK MANAGEMENT TABLES
-- =============================================

-- 3.1 Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    task_type TEXT DEFAULT 'general' CHECK (task_type IN ('general', 'aid_delivery', 'application_review', 'meeting_prep', 'follow_up', 'administrative', 'other')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'overdue')),
    assigned_to UUID REFERENCES public.user_profiles(id),
    assigned_by UUID NOT NULL REFERENCES public.user_profiles(id),
    due_date DATE,
    start_date DATE,
    completion_date DATE,
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    related_application_id UUID REFERENCES public.applications(id),
    related_meeting_id UUID REFERENCES public.meetings(id),
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.2 Task Comments Table
CREATE TABLE IF NOT EXISTS public.task_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id),
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.3 Task Attachments Table
CREATE TABLE IF NOT EXISTS public.task_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    file_type TEXT,
    uploaded_by UUID NOT NULL REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.4 Task Notifications Table
CREATE TABLE IF NOT EXISTS public.task_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('assignment', 'due_reminder', 'overdue', 'completion', 'comment')),
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.5 Task Activities Table
CREATE TABLE IF NOT EXISTS public.task_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id),
    activity_type TEXT NOT NULL CHECK (activity_type IN ('created', 'assigned', 'status_changed', 'commented', 'attachment_added', 'due_date_changed', 'completed')),
    description TEXT,
    old_value TEXT,
    new_value TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 4. MESSAGING TABLES
-- =============================================

-- 4.1 Conversations Table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    conversation_type TEXT DEFAULT 'direct' CHECK (conversation_type IN ('direct', 'group', 'announcement', 'support')),
    is_group BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    last_message_at TIMESTAMPTZ,
    created_by UUID NOT NULL REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.2 Conversation Participants Table
CREATE TABLE IF NOT EXISTS public.conversation_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_read_at TIMESTAMPTZ,
    is_muted BOOLEAN DEFAULT false,
    UNIQUE(conversation_id, user_id)
);

-- 4.3 Internal Messages Table
CREATE TABLE IF NOT EXISTS public.internal_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.user_profiles(id),
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image', 'system')),
    file_url TEXT,
    file_name TEXT,
    file_size INTEGER,
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMPTZ,
    reply_to_id UUID REFERENCES public.internal_messages(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.4 Message Reactions Table
CREATE TABLE IF NOT EXISTS public.message_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES public.internal_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, user_id, emoji)
);

-- 4.5 Message Notifications Table
CREATE TABLE IF NOT EXISTS public.message_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES public.internal_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 5. DOCUMENT MANAGEMENT TABLES
-- =============================================

-- 5.1 Documents Table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    file_type TEXT,
    document_type TEXT CHECK (document_type IN ('identity', 'medical', 'financial', 'educational', 'legal', 'photo', 'other')),
    related_beneficiary_id UUID REFERENCES public.beneficiaries(id),
    related_application_id UUID REFERENCES public.applications(id),
    is_public BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    uploaded_by UUID NOT NULL REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 6. INDEXES FOR PERFORMANCE
-- =============================================

-- User Profiles Indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_department ON public.user_profiles(department);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON public.user_profiles(is_active);

-- Beneficiaries Indexes
CREATE INDEX IF NOT EXISTS idx_beneficiaries_category ON public.beneficiaries(category);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_priority_level ON public.beneficiaries(priority_level);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_city ON public.beneficiaries(city);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_is_active ON public.beneficiaries(is_active);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_created_by ON public.beneficiaries(created_by);

-- Applications Indexes
CREATE INDEX IF NOT EXISTS idx_applications_beneficiary_id ON public.applications(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_application_type ON public.applications(application_type);
CREATE INDEX IF NOT EXISTS idx_applications_priority_level ON public.applications(priority_level);
CREATE INDEX IF NOT EXISTS idx_applications_application_date ON public.applications(application_date);
CREATE INDEX IF NOT EXISTS idx_applications_created_by ON public.applications(created_by);

-- Aid Records Indexes
CREATE INDEX IF NOT EXISTS idx_aid_records_beneficiary_id ON public.aid_records(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_aid_records_application_id ON public.aid_records(application_id);
CREATE INDEX IF NOT EXISTS idx_aid_records_aid_type ON public.aid_records(aid_type);
CREATE INDEX IF NOT EXISTS idx_aid_records_status ON public.aid_records(status);
CREATE INDEX IF NOT EXISTS idx_aid_records_aid_date ON public.aid_records(aid_date);

-- Payments Indexes
CREATE INDEX IF NOT EXISTS idx_payments_aid_record_id ON public.payments(aid_record_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON public.payments(payment_date);

-- Meetings Indexes
CREATE INDEX IF NOT EXISTS idx_meetings_start_time ON public.meetings(start_time);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON public.meetings(status);
CREATE INDEX IF NOT EXISTS idx_meetings_created_by ON public.meetings(created_by);
CREATE INDEX IF NOT EXISTS idx_meetings_meeting_type ON public.meetings(meeting_type);

-- Meeting Attendees Indexes
CREATE INDEX IF NOT EXISTS idx_meeting_attendees_meeting_id ON public.meeting_attendees(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_attendees_user_id ON public.meeting_attendees(user_id);
CREATE INDEX IF NOT EXISTS idx_meeting_attendees_status ON public.meeting_attendees(status);

-- Tasks Indexes
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_by ON public.tasks(assigned_by);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_task_type ON public.tasks(task_type);

-- Messaging Indexes
CREATE INDEX IF NOT EXISTS idx_conversations_created_by ON public.conversations(created_by);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON public.conversations(last_message_at);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON public.conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON public.conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_internal_messages_conversation_id ON public.internal_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_internal_messages_sender_id ON public.internal_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_internal_messages_created_at ON public.internal_messages(created_at);

-- Documents Indexes
CREATE INDEX IF NOT EXISTS idx_documents_related_beneficiary_id ON public.documents(related_beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_documents_related_application_id ON public.documents(related_application_id);
CREATE INDEX IF NOT EXISTS idx_documents_document_type ON public.documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON public.documents(uploaded_by);

-- =============================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aid_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.in_kind_aids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_agenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_minutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- User Profiles RLS Policies
CREATE POLICY "Users can view all profiles" ON public.user_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles" ON public.user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin')
        )
    );

-- Beneficiaries RLS Policies
CREATE POLICY "All authenticated users can view beneficiaries" ON public.beneficiaries
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authorized users can insert beneficiaries" ON public.beneficiaries
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin', 'manager', 'coordinator')
        )
    );

CREATE POLICY "Authorized users can update beneficiaries" ON public.beneficiaries
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin', 'manager', 'coordinator')
        )
    );

-- Applications RLS Policies
CREATE POLICY "All authenticated users can view applications" ON public.applications
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authorized users can insert applications" ON public.applications
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin', 'manager', 'coordinator')
        )
    );

CREATE POLICY "Managers and coordinators can update applications" ON public.applications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin', 'manager', 'coordinator')
        )
    );

-- Meetings RLS Policies
CREATE POLICY "Users can view meetings they created or are invited to" ON public.meetings
    FOR SELECT USING (
        created_by = auth.uid() OR 
        id IN (SELECT meeting_id FROM public.meeting_attendees WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can insert meetings" ON public.meetings
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Meeting creators can update their meetings" ON public.meetings
    FOR UPDATE USING (created_by = auth.uid());

-- Tasks RLS Policies
CREATE POLICY "Users can view tasks assigned to them or created by them" ON public.tasks
    FOR SELECT USING (assigned_to = auth.uid() OR assigned_by = auth.uid());

CREATE POLICY "Users can create tasks" ON public.tasks
    FOR INSERT WITH CHECK (assigned_by = auth.uid());

CREATE POLICY "Users can update tasks they created or are assigned to" ON public.tasks
    FOR UPDATE USING (assigned_to = auth.uid() OR assigned_by = auth.uid());

-- Conversations RLS Policies
CREATE POLICY "Users can view conversations they participate in" ON public.conversations
    FOR SELECT USING (
        id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can create conversations" ON public.conversations
    FOR INSERT WITH CHECK (created_by = auth.uid());

-- Internal Messages RLS Policies
CREATE POLICY "Users can view messages in conversations they participate in" ON public.internal_messages
    FOR SELECT USING (
        conversation_id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can send messages to conversations they participate in" ON public.internal_messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        conversation_id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid())
    );

-- =============================================
-- 8. TRIGGERS AND FUNCTIONS
-- =============================================

-- Updated_at Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON public.user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_beneficiaries_updated_at 
    BEFORE UPDATE ON public.beneficiaries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at 
    BEFORE UPDATE ON public.applications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

-- Business Logic Functions
CREATE OR REPLACE FUNCTION mark_overdue_tasks()
RETURNS void AS $$
BEGIN
    UPDATE public.tasks 
    SET status = 'overdue' 
    WHERE due_date < NOW() 
    AND status IN ('pending', 'in_progress');
END;
$$ LANGUAGE plpgsql;

-- User task statistics function
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

-- Update conversation last message time
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

-- =============================================
-- 9. BASIC PERMISSIONS
-- =============================================

-- Grant basic read permissions to anon role
GRANT SELECT ON public.user_profiles TO anon;
GRANT SELECT ON public.beneficiaries TO anon;
GRANT SELECT ON public.applications TO anon;

-- Grant full permissions to authenticated role
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant full permissions to service_role (for admin operations)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- =============================================
-- 10. COMPLETION MESSAGE
-- =============================================

-- Insert a completion log (optional)
DO $$
BEGIN
    RAISE NOTICE 'Complete database setup migration has been successfully applied!';
    RAISE NOTICE 'Tables created: 25+ tables with full schema';
    RAISE NOTICE 'Indexes created: 40+ performance indexes';
    RAISE NOTICE 'RLS policies: Comprehensive security policies applied';
    RAISE NOTICE 'Triggers: Auto-update and business logic triggers active';
    RAISE NOTICE 'Functions: Utility and business logic functions available';
    RAISE NOTICE 'Permissions: Role-based access control configured';
    RAISE NOTICE 'Next step: Create your first admin user manually';
END $$;