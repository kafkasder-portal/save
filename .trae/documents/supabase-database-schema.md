# Supabase Veritabanı Şeması - Kapsamlı Kurulum Rehberi

## 1. Genel Bakış

Bu doküman, yardım kuruluşu yönetim sistemi için sıfırdan Supabase veritabanı kurulumunu içerir. Sistem kullanıcı yönetimi, yardımlaşma süreçleri, toplantılar, görevler ve iç mesajlaşma modüllerini destekler.

## 2. Veritabanı Mimarisi

### 2.1 Ana Modüller
- **Kullanıcı Yönetimi**: Kullanıcı profilleri, roller ve yetkiler
- **Yardımlaşma Sistemi**: İhtiyaç sahipleri, başvurular, yardım kayıtları
- **Toplantı Yönetimi**: Toplantılar, katılımcılar, gündem
- **Görev Yönetimi**: Görevler, yorumlar, aktiviteler
- **İç Mesajlaşma**: Konuşmalar, mesajlar, bildirimler
- **Dosya Yönetimi**: Belgeler ve ekler

## 3. Tablo Tanımları

### 3.1 Kullanıcı Yönetimi Tabloları

#### user_profiles
```sql
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    display_name VARCHAR(100),
    role VARCHAR(20) NOT NULL DEFAULT 'viewer' CHECK (role IN ('super_admin', 'admin', 'manager', 'coordinator', 'operator', 'viewer')),
    department VARCHAR(100),
    position VARCHAR(100),
    phone VARCHAR(20),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.2 Yardımlaşma Sistemi Tabloları

#### beneficiaries (İhtiyaç Sahipleri)
```sql
CREATE TABLE public.beneficiaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    identity_no VARCHAR(11) UNIQUE,
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(50),
    district VARCHAR(50),
    category VARCHAR(50) NOT NULL,
    nationality VARCHAR(50),
    birth_date DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    marital_status VARCHAR(20) CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed')),
    education_level VARCHAR(30),
    monthly_income DECIMAL(10,2),
    family_size INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### applications (Başvurular)
```sql
CREATE TABLE public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    beneficiary_id UUID NOT NULL REFERENCES public.beneficiaries(id) ON DELETE CASCADE,
    aid_type VARCHAR(20) NOT NULL CHECK (aid_type IN ('cash', 'in_kind', 'service', 'medical')),
    amount DECIMAL(10,2),
    description TEXT NOT NULL,
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    evaluated_by UUID REFERENCES auth.users(id),
    evaluated_at TIMESTAMPTZ,
    evaluation_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### aid_records (Yardım Kayıtları)
```sql
CREATE TABLE public.aid_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES public.applications(id),
    beneficiary_id UUID NOT NULL REFERENCES public.beneficiaries(id) ON DELETE CASCADE,
    aid_type VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'approved' CHECK (status IN ('approved', 'distributed', 'completed', 'cancelled')),
    approved_by UUID NOT NULL REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ DEFAULT NOW(),
    distributed_at TIMESTAMPTZ,
    distributed_by UUID REFERENCES auth.users(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### payments (Ödemeler)
```sql
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aid_record_id UUID NOT NULL REFERENCES public.aid_records(id) ON DELETE CASCADE,
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'bank_transfer', 'check')),
    amount DECIMAL(10,2) NOT NULL,
    bank_account VARCHAR(50),
    transaction_ref VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    paid_at TIMESTAMPTZ,
    processed_by UUID REFERENCES auth.users(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### in_kind_aids (Ayni Yardımlar)
```sql
CREATE TABLE public.in_kind_aids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aid_record_id UUID NOT NULL REFERENCES public.aid_records(id) ON DELETE CASCADE,
    item_category VARCHAR(50) NOT NULL,
    item_description TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit VARCHAR(20) NOT NULL,
    unit_value DECIMAL(8,2) NOT NULL,
    distributed_at TIMESTAMPTZ,
    distributed_by UUID REFERENCES auth.users(id)
);
```

#### family_members (Aile Üyeleri)
```sql
CREATE TABLE public.family_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    beneficiary_id UUID NOT NULL REFERENCES public.beneficiaries(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    relationship VARCHAR(30) NOT NULL,
    birth_date DATE,
    status VARCHAR(20) DEFAULT 'active'
);
```

#### documents (Belgeler)
```sql
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(30) NOT NULL,
    entity_id UUID NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT,
    uploaded_by UUID NOT NULL REFERENCES auth.users(id),
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.3 Toplantı Yönetimi Tabloları

#### meetings (Toplantılar)
```sql
CREATE TABLE public.meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
```

#### meeting_attendees (Toplantı Katılımcıları)
```sql
CREATE TABLE public.meeting_attendees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'accepted', 'declined', 'maybe', 'attended', 'absent')),
    response_date TIMESTAMPTZ,
    notes TEXT,
    UNIQUE(meeting_id, user_id)
);
```

#### meeting_agenda (Toplantı Gündemi)
```sql
CREATE TABLE public.meeting_agenda (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER,
    order_index INTEGER NOT NULL DEFAULT 0,
    presenter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);
```

#### meeting_minutes (Toplantı Tutanakları)
```sql
CREATE TABLE public.meeting_minutes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### meeting_action_items (Toplantı Aksiyon Maddeleri)
```sql
CREATE TABLE public.meeting_action_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    due_date TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### meeting_notifications (Toplantı Bildirimleri)
```sql
CREATE TABLE public.meeting_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('invitation', 'reminder', 'update', 'cancellation')),
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ
);
```

### 3.4 Görev Yönetimi Tabloları

#### tasks (Görevler)
```sql
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
```

#### task_comments (Görev Yorumları)
```sql
CREATE TABLE public.task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### task_attachments (Görev Ekleri)
```sql
CREATE TABLE public.task_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### task_notifications (Görev Bildirimleri)
```sql
CREATE TABLE public.task_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('assignment', 'due_reminder', 'completion', 'comment', 'status_change')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ
);
```

#### task_activities (Görev Aktiviteleri)
```sql
CREATE TABLE public.task_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type VARCHAR(20) NOT NULL CHECK (activity_type IN ('created', 'assigned', 'status_changed', 'commented', 'completed', 'due_date_changed')),
    old_value TEXT,
    new_value TEXT,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.5 İç Mesajlaşma Tabloları

#### conversations (Konuşmalar)
```sql
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
```

#### conversation_participants (Konuşma Katılımcıları)
```sql
CREATE TABLE public.conversation_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(10) NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    is_muted BOOLEAN DEFAULT FALSE,
    last_read_at TIMESTAMPTZ,
    UNIQUE(conversation_id, user_id)
);
```

#### internal_messages (İç Mesajlar)
```sql
CREATE TABLE public.internal_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
```

#### message_reactions (Mesaj Tepkileri)
```sql
CREATE TABLE public.message_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES public.internal_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    emoji VARCHAR(10) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, user_id, emoji)
);
```

#### message_notifications (Mesaj Bildirimleri)
```sql
CREATE TABLE public.message_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    message_id UUID NOT NULL REFERENCES public.internal_messages(id) ON DELETE CASCADE,
    type VARCHAR(15) NOT NULL CHECK (type IN ('new_message', 'mention', 'reply')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ
);
```

## 4. İndeksler

```sql
-- Kullanıcı profilleri
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX idx_user_profiles_is_active ON public.user_profiles(is_active);

-- İhtiyaç sahipleri
CREATE INDEX idx_beneficiaries_identity_no ON public.beneficiaries(identity_no);
CREATE INDEX idx_beneficiaries_category ON public.beneficiaries(category);
CREATE INDEX idx_beneficiaries_status ON public.beneficiaries(status);
CREATE INDEX idx_beneficiaries_city ON public.beneficiaries(city);
CREATE INDEX idx_beneficiaries_created_at ON public.beneficiaries(created_at);

-- Başvurular
CREATE INDEX idx_applications_beneficiary_id ON public.applications(beneficiary_id);
CREATE INDEX idx_applications_status ON public.applications(status);
CREATE INDEX idx_applications_priority ON public.applications(priority);
CREATE INDEX idx_applications_aid_type ON public.applications(aid_type);
CREATE INDEX idx_applications_created_at ON public.applications(created_at);

-- Yardım kayıtları
CREATE INDEX idx_aid_records_beneficiary_id ON public.aid_records(beneficiary_id);
CREATE INDEX idx_aid_records_application_id ON public.aid_records(application_id);
CREATE INDEX idx_aid_records_status ON public.aid_records(status);
CREATE INDEX idx_aid_records_approved_by ON public.aid_records(approved_by);
CREATE INDEX idx_aid_records_created_at ON public.aid_records(created_at);

-- Ödemeler
CREATE INDEX idx_payments_aid_record_id ON public.payments(aid_record_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_payment_method ON public.payments(payment_method);
CREATE INDEX idx_payments_created_at ON public.payments(created_at);

-- Toplantılar
CREATE INDEX idx_meetings_created_by ON public.meetings(created_by);
CREATE INDEX idx_meetings_start_date ON public.meetings(start_date);
CREATE INDEX idx_meetings_status ON public.meetings(status);
CREATE INDEX idx_meeting_attendees_meeting_id ON public.meeting_attendees(meeting_id);
CREATE INDEX idx_meeting_attendees_user_id ON public.meeting_attendees(user_id);

-- Görevler
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_assigned_by ON public.tasks(assigned_by);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_tasks_priority ON public.tasks(priority);
CREATE INDEX idx_task_comments_task_id ON public.task_comments(task_id);
CREATE INDEX idx_task_activities_task_id ON public.task_activities(task_id);

-- Mesajlaşma
CREATE INDEX idx_conversations_created_by ON public.conversations(created_by);
CREATE INDEX idx_conversations_updated_at ON public.conversations(updated_at);
CREATE INDEX idx_conversation_participants_conversation_id ON public.conversation_participants(conversation_id);
CREATE INDEX idx_conversation_participants_user_id ON public.conversation_participants(user_id);
CREATE INDEX idx_internal_messages_conversation_id ON public.internal_messages(conversation_id);
CREATE INDEX idx_internal_messages_sender_id ON public.internal_messages(sender_id);
CREATE INDEX idx_internal_messages_created_at ON public.internal_messages(created_at);

-- Belgeler
CREATE INDEX idx_documents_entity_type_id ON public.documents(entity_type, entity_id);
CREATE INDEX idx_documents_uploaded_by ON public.documents(uploaded_by);
CREATE INDEX idx_documents_uploaded_at ON public.documents(uploaded_at);
```

## 5. Row Level Security (RLS) Politikaları

### 5.1 RLS'yi Etkinleştir
```sql
-- Tüm tablolarda RLS'yi etkinleştir
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aid_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.in_kind_aids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
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
```

### 5.2 Kullanıcı Profilleri RLS Politikaları
```sql
-- Kullanıcılar kendi profillerini görebilir, yöneticiler tüm profilleri görebilir
CREATE POLICY "Users can view own profile or admins can view all"
    ON public.user_profiles FOR SELECT
    USING (
        auth.uid() = id OR 
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin')
        )
    );

-- Kullanıcılar kendi profillerini güncelleyebilir
CREATE POLICY "Users can update own profile"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = id);

-- Yöneticiler yeni profil oluşturabilir
CREATE POLICY "Admins can insert profiles"
    ON public.user_profiles FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin')
        )
    );
```

### 5.3 İhtiyaç Sahipleri RLS Politikaları
```sql
-- Tüm kullanıcılar ihtiyaç sahiplerini görebilir
CREATE POLICY "All authenticated users can view beneficiaries"
    ON public.beneficiaries FOR SELECT
    TO authenticated
    USING (true);

-- Yetkili kullanıcılar ihtiyaç sahibi ekleyebilir
CREATE POLICY "Authorized users can insert beneficiaries"
    ON public.beneficiaries FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin', 'manager', 'coordinator', 'operator')
        )
    );

-- Yetkili kullanıcılar ihtiyaç sahiplerini güncelleyebilir
CREATE POLICY "Authorized users can update beneficiaries"
    ON public.beneficiaries FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin', 'manager', 'coordinator', 'operator')
        )
    );
```

### 5.4 Başvurular RLS Politikaları
```sql
-- Tüm kullanıcılar başvuruları görebilir
CREATE POLICY "All authenticated users can view applications"
    ON public.applications FOR SELECT
    TO authenticated
    USING (true);

-- Yetkili kullanıcılar başvuru oluşturabilir
CREATE POLICY "Authorized users can insert applications"
    ON public.applications FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin', 'manager', 'coordinator', 'operator')
        )
    );

-- Yöneticiler ve koordinatörler başvuruları güncelleyebilir
CREATE POLICY "Managers can update applications"
    ON public.applications FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin', 'manager', 'coordinator')
        )
    );
```

### 5.5 Toplantılar RLS Politikaları
```sql
-- Kullanıcılar davet edildikleri veya oluşturdukları toplantıları görebilir
CREATE POLICY "Users can view meetings they are invited to or created"
    ON public.meetings FOR SELECT
    USING (
        created_by = auth.uid() OR 
        id IN (SELECT meeting_id FROM public.meeting_attendees WHERE user_id = auth.uid())
    );

-- Kullanıcılar toplantı oluşturabilir
CREATE POLICY "Users can insert meetings"
    ON public.meetings FOR INSERT
    WITH CHECK (created_by = auth.uid());

-- Toplantı oluşturanlar toplantılarını güncelleyebilir
CREATE POLICY "Meeting creators can update their meetings"
    ON public.meetings FOR UPDATE
    USING (created_by = auth.uid());
```

### 5.6 Görevler RLS Politikaları
```sql
-- Kullanıcılar kendilerine atanan veya oluşturdukları görevleri görebilir
CREATE POLICY "Users can view tasks assigned to them or created by them"
    ON public.tasks FOR SELECT
    USING (assigned_to = auth.uid() OR assigned_by = auth.uid());

-- Kullanıcılar görev oluşturabilir
CREATE POLICY "Users can create tasks"
    ON public.tasks FOR INSERT
    WITH CHECK (assigned_by = auth.uid());

-- Kullanıcılar oluşturdukları veya atandıkları görevleri güncelleyebilir
CREATE POLICY "Users can update tasks they created or are assigned to"
    ON public.tasks FOR UPDATE
    USING (assigned_to = auth.uid() OR assigned_by = auth.uid());
```

### 5.7 Mesajlaşma RLS Politikaları
```sql
-- Kullanıcılar katıldıkları konuşmaları görebilir
CREATE POLICY "Users can view conversations they participate in"
    ON public.conversations FOR SELECT
    USING (
        id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid())
    );

-- Kullanıcılar konuşma oluşturabilir
CREATE POLICY "Users can create conversations"
    ON public.conversations FOR INSERT
    WITH CHECK (created_by = auth.uid());

-- Kullanıcılar katıldıkları konuşmalardaki mesajları görebilir
CREATE POLICY "Users can view messages in conversations they participate in"
    ON public.internal_messages FOR SELECT
    USING (
        conversation_id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid())
    );

-- Kullanıcılar katıldıkları konuşmalara mesaj gönderebilir
CREATE POLICY "Users can send messages to conversations they participate in"
    ON public.internal_messages FOR INSERT
    WITH CHECK (
        sender_id = auth.uid() AND
        conversation_id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid())
    );
```

## 6. Trigger'lar ve Fonksiyonlar

### 6.1 Updated_at Trigger Fonksiyonu
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger'ları oluştur
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
```

### 6.2 İş Mantığı Fonksiyonları
```sql
-- Vadesi geçen görevleri otomatik olarak işaretle
CREATE OR REPLACE FUNCTION mark_overdue_tasks()
RETURNS void AS $$
BEGIN
    UPDATE public.tasks 
    SET status = 'overdue' 
    WHERE due_date < NOW() 
    AND status IN ('pending', 'in_progress');
END;
$$ LANGUAGE plpgsql;

-- Kullanıcı görev istatistiklerini getir
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

-- Konuşmanın son mesaj zamanını güncelle
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
```

## 7. Temel Yetkiler

### 7.1 Anon ve Authenticated Rolleri için Temel Yetkiler
```sql
-- Anon rolü için temel okuma yetkileri
GRANT SELECT ON public.user_profiles TO anon;
GRANT SELECT ON public.beneficiaries TO anon;
GRANT SELECT ON public.applications TO anon;

-- Authenticated rolü için tam yetkiler
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Service role için tam yetkiler (admin işlemleri için)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO service_role;
```

## 8. Örnek Veri

### 8.1 Varsayılan Kullanıcı Profilleri
```sql
-- İlk süper admin kullanıcısı (auth.users tablosunda kullanıcı oluşturulduktan sonra)
-- Bu kısım manuel olarak yapılmalıdır
/*
INSERT INTO public.user_profiles (id, full_name, display_name, role, department, position, is_active) 
VALUES 
    ('USER_UUID_FROM_AUTH_USERS', 'Sistem Yöneticisi', 'Admin', 'super_admin', 'Bilgi İşlem', 'Sistem Yöneticisi', true);
*/
```

### 8.2 Örnek Kategoriler ve Sabitler
```sql
-- Örnek ihtiyaç sahibi kategorileri için referans
-- Bu veriler uygulama tarafında enum olarak kullanılabilir
/*
Beneficiary Categories:
- 'Yaşlı'
- 'Engelli'
- 'Yetim'
- 'Dul'
- 'Mülteci'
- 'Öğrenci'
- 'Hasta'
- 'İşsiz'
- 'Diğer'
*/
```

## 9. Kurulum Adımları

1. **Supabase Projesi Oluştur**: Supabase dashboard'da yeni proje oluşturun
2. **Uzantıları Etkinleştir**: `uuid-ossp` uzantısını etkinleştirin
3. **Tabloları Oluştur**: Yukarıdaki SQL komutlarını sırasıyla çalıştırın
4. **İndeksleri Oluştur**: Performans için gerekli indeksleri ekleyin
5. **RLS Politikalarını Uygula**: Güvenlik politikalarını aktifleştirin
6. **Trigger'ları Oluştur**: Otomatik güncelleme fonksiyonlarını ekleyin
7. **Yetkileri Ayarla**: Rol bazlı erişim kontrollerini yapılandırın
8. **İlk Kullanıcıyı Oluştur**: Süper admin kullanıcısını manuel olarak ekleyin

## 10. Güvenlik Notları

- Tüm tablolarda RLS aktifleştirilmiştir
- Kullanıcılar sadece yetkili oldukları verilere erişebilir
- Hassas işlemler için ek doğrulama katmanları eklenmiştir
- Service role anahtarı sadece server-side işlemler için kullanılmalıdır
- Anon kullanıcılar sadece sınırlı okuma yetkisine sahiptir

## 11. Performans Optimizasyonu

- Sık kullanılan sorgular için indeksler oluşturulmuştur
- Foreign key ilişkileri mantıksal seviyede tutulmuştur
- Büyük tablolar için partitioning düşünülebilir
- Realtime subscriptions dikkatli kullanılmalıdır

Bu şema, yardım kuruluşu yönetim sistemi için kapsamlı ve güvenli bir veritabanı altyapısı sağlar.