-- Check current permissions for anon and authenticated roles
SELECT 
    grantee, 
    table_name, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- Grant basic permissions to anon role for public access (only for existing tables)
GRANT SELECT ON meetings TO anon;
GRANT SELECT ON tasks TO anon;
GRANT SELECT ON conversations TO anon;
GRANT SELECT ON students TO anon;
GRANT SELECT ON user_profiles TO anon;
GRANT SELECT ON task_categories TO anon;

-- Grant full permissions to authenticated role for existing tables
GRANT ALL PRIVILEGES ON meetings TO authenticated;
GRANT ALL PRIVILEGES ON meeting_attendees TO authenticated;
GRANT ALL PRIVILEGES ON meeting_agenda TO authenticated;
GRANT ALL PRIVILEGES ON meeting_minutes TO authenticated;
GRANT ALL PRIVILEGES ON meeting_action_items TO authenticated;
GRANT ALL PRIVILEGES ON meeting_notifications TO authenticated;

GRANT ALL PRIVILEGES ON tasks TO authenticated;
GRANT ALL PRIVILEGES ON task_comments TO authenticated;
GRANT ALL PRIVILEGES ON task_attachments TO authenticated;
GRANT ALL PRIVILEGES ON task_activities TO authenticated;
GRANT ALL PRIVILEGES ON task_categories TO authenticated;
GRANT ALL PRIVILEGES ON task_notifications TO authenticated;

GRANT ALL PRIVILEGES ON conversations TO authenticated;
GRANT ALL PRIVILEGES ON conversation_participants TO authenticated;
GRANT ALL PRIVILEGES ON internal_messages TO authenticated;
GRANT ALL PRIVILEGES ON message_reactions TO authenticated;
GRANT ALL PRIVILEGES ON message_notifications TO authenticated;

GRANT ALL PRIVILEGES ON students TO authenticated;
GRANT ALL PRIVILEGES ON user_profiles TO authenticated;

-- Check permissions again after granting
SELECT 
    grantee, 
    table_name, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;