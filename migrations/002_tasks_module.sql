-- GÖREV YÖNETİMİ MODÜLÜ (TASKS MODULE)  
-- =================================================
-- Run this in Supabase SQL Editor or via CLI: supabase db push

-- Görevler tablosu
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(50) CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    status VARCHAR(50) CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
    assigned_to UUID REFERENCES auth.users(id),
    assigned_by UUID NOT NULL REFERENCES auth.users(id),
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Görev yorumları tablosu
CREATE TABLE IF NOT EXISTS task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Görev ekleri tablosu
CREATE TABLE IF NOT EXISTS task_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    uploaded_by UUID NOT NULL REFERENCES auth.users(id),
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Görev aktiviteleri tablosu (log için)
CREATE TABLE IF NOT EXISTS task_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    action VARCHAR(100) NOT NULL, -- 'created', 'updated', 'assigned', 'completed', etc.
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_by ON tasks(assigned_by);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_attachments_task_id ON task_attachments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_activities_task_id ON task_activities(task_id);

-- RLS Politikaları
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_activities ENABLE ROW LEVEL SECURITY;

-- Tasks RLS
CREATE POLICY "Users can view tasks assigned to them or created by them" ON tasks FOR SELECT
USING (assigned_to = auth.uid() OR assigned_by = auth.uid());

CREATE POLICY "Users can create tasks" ON tasks FOR INSERT
WITH CHECK (assigned_by = auth.uid());

CREATE POLICY "Task creators and assignees can update tasks" ON tasks FOR UPDATE
USING (assigned_to = auth.uid() OR assigned_by = auth.uid());

CREATE POLICY "Task creators can delete tasks" ON tasks FOR DELETE
USING (assigned_by = auth.uid());

-- Task comments RLS
CREATE POLICY "Users can view comments on their tasks" ON task_comments FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM tasks t 
        WHERE t.id = task_comments.task_id 
        AND (t.assigned_to = auth.uid() OR t.assigned_by = auth.uid())
    )
);

CREATE POLICY "Users can comment on their tasks" ON task_comments FOR INSERT
WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM tasks t 
        WHERE t.id = task_comments.task_id 
        AND (t.assigned_to = auth.uid() OR t.assigned_by = auth.uid())
    )
);

-- Task attachments RLS
CREATE POLICY "Users can view attachments on their tasks" ON task_attachments FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM tasks t 
        WHERE t.id = task_attachments.task_id 
        AND (t.assigned_to = auth.uid() OR t.assigned_by = auth.uid())
    )
);

CREATE POLICY "Users can upload attachments to their tasks" ON task_attachments FOR INSERT
WITH CHECK (
    uploaded_by = auth.uid() AND
    EXISTS (
        SELECT 1 FROM tasks t 
        WHERE t.id = task_attachments.task_id 
        AND (t.assigned_to = auth.uid() OR t.assigned_by = auth.uid())
    )
);

-- Task activities RLS
CREATE POLICY "Users can view activities on their tasks" ON task_activities FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM tasks t 
        WHERE t.id = task_activities.task_id 
        AND (t.assigned_to = auth.uid() OR t.assigned_by = auth.uid())
    )
);

CREATE POLICY "System can log task activities" ON task_activities FOR INSERT
WITH CHECK (true); -- Allow system to log activities
