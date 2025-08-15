-- Error logging system for comprehensive error tracking
-- This migration creates tables and functions for error management

-- Create error logs table
CREATE TABLE IF NOT EXISTS error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    error_id VARCHAR(255) UNIQUE NOT NULL,
    message TEXT NOT NULL,
    stack_trace TEXT,
    error_code VARCHAR(100),
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'authentication', 'authorization', 'network', 'validation', 
        'database', 'system', 'user_input', 'external_service'
    )),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    
    -- User context
    user_id UUID REFERENCES auth.users(id),
    user_email VARCHAR(255),
    user_role VARCHAR(50),
    
    -- Technical context
    component VARCHAR(255),
    action VARCHAR(255),
    url TEXT,
    user_agent TEXT,
    session_id VARCHAR(255),
    additional_data TEXT, -- JSON string
    
    -- Timing
    occurred_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Resolution tracking
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    resolved_by VARCHAR(255),
    resolution_notes TEXT
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_error_logs_occurred_at ON error_logs(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_category ON error_logs(category);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON error_logs(resolved);
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_component ON error_logs(component);
CREATE INDEX IF NOT EXISTS idx_error_logs_error_id ON error_logs(error_id);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_error_logs_category_severity ON error_logs(category, severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved_occurred_at ON error_logs(resolved, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity_occurred_at ON error_logs(severity, occurred_at DESC);

-- Enable RLS
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for error logs (only admins can access)
CREATE POLICY "Admins can view all error logs" ON error_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
        )
    );

CREATE POLICY "System can insert error logs" ON error_logs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update error logs" ON error_logs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
        )
    );

CREATE POLICY "Admins can delete error logs" ON error_logs
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
        )
    );

-- Function to clean up old error logs
CREATE OR REPLACE FUNCTION cleanup_old_error_logs(days_old INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM error_logs 
    WHERE occurred_at < NOW() - INTERVAL '1 day' * days_old;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get error statistics
CREATE OR REPLACE FUNCTION get_error_stats(
    start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
    end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total', COUNT(*),
        'resolved', COUNT(*) FILTER (WHERE resolved = true),
        'unresolved', COUNT(*) FILTER (WHERE resolved = false),
        'by_category', (
            SELECT json_object_agg(category, count)
            FROM (
                SELECT category, COUNT(*) as count
                FROM error_logs
                WHERE occurred_at BETWEEN start_date AND end_date
                GROUP BY category
            ) cat_stats
        ),
        'by_severity', (
            SELECT json_object_agg(severity, count)
            FROM (
                SELECT severity, COUNT(*) as count
                FROM error_logs
                WHERE occurred_at BETWEEN start_date AND end_date
                GROUP BY severity
            ) sev_stats
        ),
        'critical_unresolved', COUNT(*) FILTER (WHERE severity = 'critical' AND resolved = false),
        'high_unresolved', COUNT(*) FILTER (WHERE severity = 'high' AND resolved = false)
    )
    INTO result
    FROM error_logs
    WHERE occurred_at BETWEEN start_date AND end_date;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to automatically resolve old low-severity errors
CREATE OR REPLACE FUNCTION auto_resolve_old_errors()
RETURNS INTEGER AS $$
DECLARE
    resolved_count INTEGER;
BEGIN
    UPDATE error_logs
    SET 
        resolved = true,
        resolved_at = NOW(),
        resolved_by = 'system_auto_resolve',
        resolution_notes = 'Automatically resolved due to age and low severity'
    WHERE 
        resolved = false
        AND severity IN ('low', 'medium')
        AND occurred_at < NOW() - INTERVAL '7 days';
    
    GET DIAGNOSTICS resolved_count = ROW_COUNT;
    
    RETURN resolved_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for error dashboard
CREATE OR REPLACE VIEW error_dashboard_summary AS
SELECT 
    COUNT(*) as total_errors,
    COUNT(*) FILTER (WHERE resolved = false) as unresolved_errors,
    COUNT(*) FILTER (WHERE severity = 'critical' AND resolved = false) as critical_unresolved,
    COUNT(*) FILTER (WHERE severity = 'high' AND resolved = false) as high_unresolved,
    COUNT(*) FILTER (WHERE occurred_at >= NOW() - INTERVAL '24 hours') as errors_last_24h,
    COUNT(*) FILTER (WHERE occurred_at >= NOW() - INTERVAL '7 days') as errors_last_week,
    COUNT(*) FILTER (WHERE occurred_at >= NOW() - INTERVAL '30 days') as errors_last_month
FROM error_logs;

-- Grant permissions to the dashboard view
GRANT SELECT ON error_dashboard_summary TO authenticated;

-- Create RLS policy for the view
CREATE POLICY "Admins can view error dashboard summary" ON error_dashboard_summary
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
        )
    );

-- Trigger to update resolved timestamp
CREATE OR REPLACE FUNCTION update_error_resolved_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.resolved = true AND OLD.resolved = false THEN
        NEW.resolved_at = NOW();
    ELSIF NEW.resolved = false AND OLD.resolved = true THEN
        NEW.resolved_at = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_error_resolved_timestamp
    BEFORE UPDATE ON error_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_error_resolved_timestamp();

-- Sample data for testing (only in development)
-- This will be ignored if the table already has data
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM error_logs LIMIT 1) THEN
        INSERT INTO error_logs (
            error_id, message, category, severity, component, action, 
            occurred_at, user_email, resolved
        ) VALUES 
        (
            'sample_error_1',
            'Test authentication error',
            'authentication',
            'medium',
            'LoginForm',
            'user_login',
            NOW() - INTERVAL '2 hours',
            'test@example.com',
            false
        ),
        (
            'sample_error_2',
            'Sample network timeout',
            'network',
            'high',
            'ApiClient',
            'fetch_data',
            NOW() - INTERVAL '1 day',
            'admin@example.com',
            true
        ),
        (
            'sample_error_3',
            'Validation failed for user input',
            'validation',
            'low',
            'UserForm',
            'form_submit',
            NOW() - INTERVAL '3 hours',
            'user@example.com',
            false
        );
    END IF;
END $$;

-- Comment explaining the error logging system
COMMENT ON TABLE error_logs IS 'Centralized error logging table for tracking application errors and their resolution status';
COMMENT ON COLUMN error_logs.error_id IS 'Unique identifier for the error, generated by the client';
COMMENT ON COLUMN error_logs.category IS 'Category of error: authentication, authorization, network, validation, database, system, user_input, external_service';
COMMENT ON COLUMN error_logs.severity IS 'Severity level: low, medium, high, critical';
COMMENT ON COLUMN error_logs.additional_data IS 'JSON string containing additional context data';
COMMENT ON FUNCTION cleanup_old_error_logs IS 'Removes error logs older than specified number of days (default: 90)';
COMMENT ON FUNCTION get_error_stats IS 'Returns comprehensive error statistics for a given date range';
COMMENT ON FUNCTION auto_resolve_old_errors IS 'Automatically resolves old low and medium severity errors older than 7 days';
