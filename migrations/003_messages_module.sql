-- MESAJLAŞMA MODÜLÜ (INTERNAL MESSAGES MODULE)
-- =================================================
-- Run this in Supabase SQL Editor or via CLI: supabase db push

-- Konuşmalar tablosu
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('direct', 'group')) DEFAULT 'group',
    is_private BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    last_message_at TIMESTAMPTZ,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Konuşma katılımcıları tablosu
CREATE TABLE IF NOT EXISTS conversation_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    role VARCHAR(50) CHECK (role IN ('admin', 'moderator', 'member')) DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_read_at TIMESTAMPTZ,
    is_muted BOOLEAN DEFAULT false,
    UNIQUE(conversation_id, user_id)
);

-- Dahili mesajlar tablosu
CREATE TABLE IF NOT EXISTS internal_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id),
    content TEXT NOT NULL,
    message_type VARCHAR(50) CHECK (message_type IN ('text', 'file', 'image', 'system')) DEFAULT 'text',
    file_path VARCHAR(500),
    file_name VARCHAR(255),
    file_size BIGINT,
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMPTZ,
    reply_to UUID REFERENCES internal_messages(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mesaj reaksiyonları tablosu
CREATE TABLE IF NOT EXISTS message_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES internal_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    emoji VARCHAR(10) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, user_id, emoji)
);

-- Mesaj bildirimleri tablosu
CREATE TABLE IF NOT EXISTS message_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    message_id UUID NOT NULL REFERENCES internal_messages(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Storage bucket for message files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('message-files', 'message-files', true)
ON CONFLICT (id) DO NOTHING;

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_conversations_created_by ON conversations(created_by);
CREATE INDEX IF NOT EXISTS idx_conversations_type ON conversations(type);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_internal_messages_conversation_id ON internal_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_internal_messages_sender_id ON internal_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_internal_messages_created_at ON internal_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_notifications_user_id ON message_notifications(user_id);

-- RLS Politikaları
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_notifications ENABLE ROW LEVEL SECURITY;

-- Conversations RLS
CREATE POLICY "Users can view conversations they participate in" ON conversations FOR SELECT
USING (
    created_by = auth.uid() OR
    EXISTS (
        SELECT 1 FROM conversation_participants cp 
        WHERE cp.conversation_id = conversations.id AND cp.user_id = auth.uid()
    )
);

CREATE POLICY "Users can create conversations" ON conversations FOR INSERT
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Conversation creators can update conversations" ON conversations FOR UPDATE
USING (created_by = auth.uid());

-- Conversation participants RLS
CREATE POLICY "Users can view participants in their conversations" ON conversation_participants FOR SELECT
USING (
    user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM conversation_participants cp2 
        WHERE cp2.conversation_id = conversation_participants.conversation_id 
        AND cp2.user_id = auth.uid()
    )
);

CREATE POLICY "Conversation admins can manage participants" ON conversation_participants FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM conversations c 
        WHERE c.id = conversation_participants.conversation_id 
        AND c.created_by = auth.uid()
    )
);

-- Internal messages RLS
CREATE POLICY "Users can view messages in their conversations" ON internal_messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM conversation_participants cp 
        WHERE cp.conversation_id = internal_messages.conversation_id 
        AND cp.user_id = auth.uid()
    )
);

CREATE POLICY "Users can send messages to their conversations" ON internal_messages FOR INSERT
WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM conversation_participants cp 
        WHERE cp.conversation_id = internal_messages.conversation_id 
        AND cp.user_id = auth.uid()
    )
);

CREATE POLICY "Users can update their own messages" ON internal_messages FOR UPDATE
USING (sender_id = auth.uid());

CREATE POLICY "Users can delete their own messages" ON internal_messages FOR DELETE
USING (sender_id = auth.uid());

-- Message reactions RLS
CREATE POLICY "Users can view reactions on messages they can see" ON message_reactions FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM internal_messages im
        JOIN conversation_participants cp ON cp.conversation_id = im.conversation_id
        WHERE im.id = message_reactions.message_id 
        AND cp.user_id = auth.uid()
    )
);

CREATE POLICY "Users can react to messages they can see" ON message_reactions FOR INSERT
WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM internal_messages im
        JOIN conversation_participants cp ON cp.conversation_id = im.conversation_id
        WHERE im.id = message_reactions.message_id 
        AND cp.user_id = auth.uid()
    )
);

-- Message notifications RLS
CREATE POLICY "Users can view their own notifications" ON message_notifications FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON message_notifications FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON message_notifications FOR UPDATE
USING (user_id = auth.uid());

-- Storage policy for message files
CREATE POLICY "Users can upload message files" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'message-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view message files" ON storage.objects FOR SELECT
USING (bucket_id = 'message-files');
