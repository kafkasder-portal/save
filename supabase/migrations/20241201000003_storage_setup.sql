-- Storage buckets and policies for file management
-- This migration sets up secure file storage for the application

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    (
        'uploads', 
        'uploads', 
        true, 
        52428800, -- 50MB
        ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    ),
    (
        'task-attachments', 
        'task-attachments', 
        false, 
        104857600, -- 100MB
        ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/zip', 'application/x-rar-compressed']
    ),
    (
        'message-files', 
        'message-files', 
        true, 
        52428800, -- 50MB
        ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    ),
    (
        'avatars', 
        'avatars', 
        true, 
        5242880, -- 5MB
        ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    )
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policies for uploads bucket (general purpose)
CREATE POLICY "Authenticated users can upload to uploads bucket"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'uploads' 
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Authenticated users can view uploads bucket files"
ON storage.objects FOR SELECT
USING (bucket_id = 'uploads' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own uploads"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'uploads' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own uploads"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'uploads' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for task attachments bucket
CREATE POLICY "Authenticated users can upload task attachments"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'task-attachments' 
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Task participants can view task attachments"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'task-attachments' 
    AND auth.role() = 'authenticated'
    AND (
        -- File uploader can always see their files
        auth.uid()::text = (storage.foldername(name))[1]
        OR
        -- Or user is involved in the task
        EXISTS (
            SELECT 1 FROM tasks t
            JOIN task_attachments ta ON ta.task_id = t.id
            WHERE ta.file_path = name
            AND (t.assigned_to = auth.uid() OR t.assigned_by = auth.uid())
        )
    )
);

CREATE POLICY "Users can update their own task attachments"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'task-attachments' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own task attachments"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'task-attachments' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for message files bucket
CREATE POLICY "Users can upload message files"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'message-files' 
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Conversation participants can view message files"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'message-files' 
    AND (
        -- File uploader can always see their files
        auth.uid()::text = (storage.foldername(name))[1]
        OR
        -- Or user is in the conversation where file was shared
        EXISTS (
            SELECT 1 FROM internal_messages im
            JOIN conversation_participants cp ON cp.conversation_id = im.conversation_id
            WHERE im.file_path = name
            AND cp.user_id = auth.uid()
        )
    )
);

CREATE POLICY "Users can update their own message files"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'message-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own message files"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'message-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for avatars bucket
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Helper function to get file size in human readable format
CREATE OR REPLACE FUNCTION format_file_size(size_bytes BIGINT)
RETURNS TEXT AS $$
BEGIN
    IF size_bytes IS NULL THEN
        RETURN 'Unknown';
    ELSIF size_bytes < 1024 THEN
        RETURN size_bytes || ' B';
    ELSIF size_bytes < 1048576 THEN
        RETURN ROUND(size_bytes / 1024.0, 1) || ' KB';
    ELSIF size_bytes < 1073741824 THEN
        RETURN ROUND(size_bytes / 1048576.0, 1) || ' MB';
    ELSE
        RETURN ROUND(size_bytes / 1073741824.0, 1) || ' GB';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up orphaned files
CREATE OR REPLACE FUNCTION cleanup_orphaned_files()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
BEGIN
    -- Clean up orphaned task attachments
    DELETE FROM storage.objects 
    WHERE bucket_id = 'task-attachments'
    AND NOT EXISTS (
        SELECT 1 FROM task_attachments ta 
        WHERE ta.file_path = storage.objects.name
    );
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Clean up orphaned message files
    DELETE FROM storage.objects 
    WHERE bucket_id = 'message-files'
    AND NOT EXISTS (
        SELECT 1 FROM internal_messages im 
        WHERE im.file_path = storage.objects.name
    );
    
    GET DIAGNOSTICS deleted_count = deleted_count + ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
