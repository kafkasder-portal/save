-- TOPLANTI PLANLAMA MODÜLÜ (MEETINGS MODULE)
-- =================================================
-- Run this in Supabase SQL Editor or via CLI: supabase db push

-- Toplantılar tablosu
CREATE TABLE IF NOT EXISTS meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    location VARCHAR(255),
    meeting_type VARCHAR(50) CHECK (meeting_type IN ('physical', 'online', 'hybrid')) DEFAULT 'physical',
    meeting_link VARCHAR(500), -- Online toplantı linki
    status VARCHAR(50) CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled')) DEFAULT 'scheduled',
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Toplantı katılımcıları tablosu
CREATE TABLE IF NOT EXISTS meeting_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    role VARCHAR(50) CHECK (role IN ('organizer', 'presenter', 'attendee', 'optional')) DEFAULT 'attendee',
    response_status VARCHAR(50) CHECK (response_status IN ('pending', 'accepted', 'declined', 'maybe')) DEFAULT 'pending',
    attendance_status VARCHAR(50) CHECK (attendance_status IN ('not_started', 'present', 'absent', 'late')) DEFAULT 'not_started',
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(meeting_id, user_id)
);

-- Toplantı gündemleri tablosu
CREATE TABLE IF NOT EXISTS meeting_agenda_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    presenter_id UUID REFERENCES auth.users(id),
    duration_minutes INTEGER,
    order_index INTEGER NOT NULL,
    status VARCHAR(50) CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Toplantı notları tablosu
CREATE TABLE IF NOT EXISTS meeting_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Toplantı aksiyon maddeleri tablosu
CREATE TABLE IF NOT EXISTS meeting_action_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES auth.users(id),
    due_date TIMESTAMPTZ,
    status VARCHAR(50) CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_meetings_created_by ON meetings(created_by);
CREATE INDEX IF NOT EXISTS idx_meetings_start_date ON meetings(start_date);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_meeting_id ON meeting_participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_user_id ON meeting_participants(user_id);

-- RLS Politikaları
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_agenda_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_action_items ENABLE ROW LEVEL SECURITY;

-- Meetings RLS
CREATE POLICY "Users can view meetings they participate in" ON meetings FOR SELECT
USING (
    created_by = auth.uid() OR
    EXISTS (
        SELECT 1 FROM meeting_participants mp 
        WHERE mp.meeting_id = meetings.id AND mp.user_id = auth.uid()
    )
);

CREATE POLICY "Users can create meetings" ON meetings FOR INSERT
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Meeting creators can update their meetings" ON meetings FOR UPDATE
USING (created_by = auth.uid());

CREATE POLICY "Meeting creators can delete their meetings" ON meetings FOR DELETE
USING (created_by = auth.uid());

-- Meeting participants RLS
CREATE POLICY "Users can view meeting participants for meetings they attend" ON meeting_participants FOR SELECT
USING (
    user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM meetings m 
        WHERE m.id = meeting_participants.meeting_id AND m.created_by = auth.uid()
    )
);

CREATE POLICY "Meeting creators can manage participants" ON meeting_participants FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM meetings m 
        WHERE m.id = meeting_participants.meeting_id AND m.created_by = auth.uid()
    )
);
