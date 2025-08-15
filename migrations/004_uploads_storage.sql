-- DOSYA YÜKLEMe VE DEPOLAMA (STORAGE SETUP)
-- =================================================
-- Run this in Supabase SQL Editor or via CLI: supabase db push

-- Create uploads bucket for general file uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Create students bucket for student documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('student-documents', 'student-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create task attachments bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('task-attachments', 'task-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for uploads bucket
CREATE POLICY "Authenticated users can upload files" ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'uploads' 
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Authenticated users can view uploaded files" ON storage.objects FOR SELECT
USING (bucket_id = 'uploads' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own uploaded files" ON storage.objects FOR UPDATE
USING (
    bucket_id = 'uploads' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own uploaded files" ON storage.objects FOR DELETE
USING (
    bucket_id = 'uploads' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for student documents bucket
CREATE POLICY "Authenticated users can upload student documents" ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'student-documents' 
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can view student documents" ON storage.objects FOR SELECT
USING (bucket_id = 'student-documents' AND auth.role() = 'authenticated');

-- Storage policies for task attachments bucket
CREATE POLICY "Authenticated users can upload task attachments" ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'task-attachments' 
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can view task attachments" ON storage.objects FOR SELECT
USING (bucket_id = 'task-attachments' AND auth.role() = 'authenticated');

-- Students table for scholarship module
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    identity_no VARCHAR(11) UNIQUE,
    birth_date DATE,
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    school VARCHAR(255),
    grade VARCHAR(20),
    gpa DECIMAL(3,2),
    parent_name VARCHAR(200),
    parent_phone VARCHAR(20),
    monthly_income DECIMAL(10,2),
    status VARCHAR(50) CHECK (status IN ('active', 'inactive', 'graduated', 'dropped')) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student documents table
CREATE TABLE IF NOT EXISTS student_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    uploaded_by UUID NOT NULL REFERENCES auth.users(id),
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_students_file_number ON students(file_number);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_school ON students(school);
CREATE INDEX IF NOT EXISTS idx_student_documents_student_id ON student_documents(student_id);

-- RLS Politikaları
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_documents ENABLE ROW LEVEL SECURITY;

-- Students RLS
CREATE POLICY "Authenticated users can view students" ON students FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create students" ON students FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update students" ON students FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete students" ON students FOR DELETE
USING (auth.role() = 'authenticated');

-- Student documents RLS
CREATE POLICY "Authenticated users can view student documents" ON student_documents FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload student documents" ON student_documents FOR INSERT
WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Document uploaders can update their uploads" ON student_documents FOR UPDATE
USING (uploaded_by = auth.uid());

CREATE POLICY "Document uploaders can delete their uploads" ON student_documents FOR DELETE
USING (uploaded_by = auth.uid());
