-- Notifications system for real-time updates
-- This migration creates the notifications infrastructure

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'task_assigned', 'meeting_invite', 'message', 'system', 'reminder'
    )),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON notifications(expires_at);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_user_type ON notifications(user_id, type);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete their own notifications" ON notifications
    FOR DELETE USING (user_id = auth.uid());

-- Create user presence table for real-time features
CREATE TABLE IF NOT EXISTS user_presence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('online', 'away', 'busy', 'offline')) DEFAULT 'offline',
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    current_page VARCHAR(255),
    device_info JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Indexes for user presence
CREATE INDEX IF NOT EXISTS idx_user_presence_user_id ON user_presence(user_id);
CREATE INDEX IF NOT EXISTS idx_user_presence_status ON user_presence(status);
CREATE INDEX IF NOT EXISTS idx_user_presence_last_seen ON user_presence(last_seen DESC);

-- Enable RLS for presence
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

-- RLS policies for user presence
CREATE POLICY "Users can view all presence data" ON user_presence
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own presence" ON user_presence
    FOR ALL USING (user_id = auth.uid());

-- Create activity log table for dashboard feed
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    activity_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('task', 'meeting', 'message', 'system', 'user')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('info', 'success', 'warning', 'error')) DEFAULT 'info',
    data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for activity logs
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_type ON activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_category ON activity_logs(category);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_severity ON activity_logs(severity);

-- Enable RLS for activity logs
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for activity logs
CREATE POLICY "Users can view relevant activity logs" ON activity_logs
    FOR SELECT USING (
        user_id = auth.uid() OR 
        auth.role() = 'authenticated' -- Allow all authenticated users to see activities
    );

CREATE POLICY "System can create activity logs" ON activity_logs
    FOR INSERT WITH CHECK (true);

-- Function to clean up expired notifications
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM notifications 
    WHERE expires_at IS NOT NULL AND expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark old notifications as read (optional cleanup)
CREATE OR REPLACE FUNCTION auto_read_old_notifications(days_old INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE notifications 
    SET is_read = true, updated_at = NOW()
    WHERE is_read = false 
    AND created_at < NOW() - INTERVAL '1 day' * days_old;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get notification counts
CREATE OR REPLACE FUNCTION get_notification_counts(target_user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total', COUNT(*),
        'unread', COUNT(*) FILTER (WHERE is_read = false),
        'by_type', (
            SELECT json_object_agg(type, count)
            FROM (
                SELECT type, COUNT(*) as count
                FROM notifications
                WHERE user_id = target_user_id
                GROUP BY type
            ) type_stats
        ),
        'recent_unread', (
            SELECT json_agg(
                json_build_object(
                    'id', id,
                    'type', type,
                    'title', title,
                    'message', message,
                    'created_at', created_at
                )
            )
            FROM (
                SELECT id, type, title, message, created_at
                FROM notifications
                WHERE user_id = target_user_id AND is_read = false
                ORDER BY created_at DESC
                LIMIT 5
            ) recent
        )
    )
    INTO result
    FROM notifications
    WHERE user_id = target_user_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user presence
CREATE OR REPLACE FUNCTION update_user_presence(
    target_user_id UUID,
    new_status VARCHAR(20) DEFAULT 'online',
    page_info VARCHAR(255) DEFAULT NULL,
    device_data JSONB DEFAULT NULL
)
RETURNS user_presence AS $$
DECLARE
    result user_presence;
BEGIN
    INSERT INTO user_presence (user_id, status, current_page, device_info, last_seen, updated_at)
    VALUES (target_user_id, new_status, page_info, device_data, NOW(), NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        status = EXCLUDED.status,
        current_page = EXCLUDED.current_page,
        device_info = EXCLUDED.device_info,
        last_seen = EXCLUDED.last_seen,
        updated_at = EXCLUDED.updated_at
    RETURNING * INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create activity log entry
CREATE OR REPLACE FUNCTION log_activity(
    target_user_id UUID,
    activity_type VARCHAR(50),
    title VARCHAR(255),
    description TEXT,
    category VARCHAR(50),
    severity VARCHAR(20) DEFAULT 'info',
    activity_data JSONB DEFAULT NULL
)
RETURNS activity_logs AS $$
DECLARE
    result activity_logs;
BEGIN
    INSERT INTO activity_logs (
        user_id, activity_type, title, description, 
        category, severity, data
    )
    VALUES (
        target_user_id, activity_type, title, description,
        category, severity, activity_data
    )
    RETURNING * INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_presence_updated_at
    BEFORE UPDATE ON user_presence
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Sample notifications for testing
INSERT INTO notifications (user_id, type, title, message, data) 
SELECT 
    up.id,
    'system',
    'Hoş Geldiniz!',
    'Dernek Yönetim Paneli sistemine hoş geldiniz. Yeni özellikler hakkında bildirim alacaksınız.',
    '{"welcome": true, "version": "1.0"}'::jsonb
FROM user_profiles up
WHERE up.role IN ('admin', 'super_admin')
ON CONFLICT DO NOTHING;

-- Create a view for unread notification counts
CREATE OR REPLACE VIEW notification_summary AS
SELECT 
    user_id,
    COUNT(*) as total_notifications,
    COUNT(*) FILTER (WHERE is_read = false) as unread_count,
    COUNT(*) FILTER (WHERE type = 'task_assigned' AND is_read = false) as unread_tasks,
    COUNT(*) FILTER (WHERE type = 'meeting_invite' AND is_read = false) as unread_meetings,
    COUNT(*) FILTER (WHERE type = 'message' AND is_read = false) as unread_messages,
    MAX(created_at) FILTER (WHERE is_read = false) as latest_unread
FROM notifications
GROUP BY user_id;

-- Comments for documentation
COMMENT ON TABLE notifications IS 'User notifications for real-time updates and system messages';
COMMENT ON TABLE user_presence IS 'Real-time user presence and activity status';
COMMENT ON TABLE activity_logs IS 'System-wide activity feed for dashboard and monitoring';
COMMENT ON FUNCTION cleanup_expired_notifications IS 'Removes expired notifications based on expires_at timestamp';
COMMENT ON FUNCTION get_notification_counts IS 'Returns comprehensive notification statistics for a user';
COMMENT ON FUNCTION update_user_presence IS 'Updates or creates user presence information';
COMMENT ON FUNCTION log_activity IS 'Creates a new activity log entry for the dashboard feed';
