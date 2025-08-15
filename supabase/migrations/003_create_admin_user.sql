-- Create Initial Admin User Migration
-- This migration sets up the first super admin user for the system
-- Note: This should be run after the user has been created in Supabase Auth

-- =============================================
-- ADMIN USER SETUP FUNCTION
-- =============================================

-- Function to create admin user profile
CREATE OR REPLACE FUNCTION create_admin_user_profile(
    p_user_id UUID,
    p_email TEXT,
    p_full_name TEXT DEFAULT 'System Administrator',
    p_phone TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_profile_id UUID;
BEGIN
    -- Insert admin user profile
    INSERT INTO public.user_profiles (
        id,
        email,
        full_name,
        phone,
        role,
        status,
        created_at,
        updated_at
    ) VALUES (
        p_user_id,
        p_email,
        p_full_name,
        p_phone,
        'super_admin',
        'active',
        NOW(),
        NOW()
    )
    RETURNING id INTO v_profile_id;
    
    RAISE NOTICE 'Admin user profile created with ID: %', v_profile_id;
    RETURN v_profile_id;
    
EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE 'User profile already exists for ID: %', p_user_id;
        RETURN p_user_id;
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error creating admin user profile: %', SQLERRM;
END;
$$;

-- =============================================
-- SAMPLE DATA INSERTION FUNCTION
-- =============================================

-- Function to insert sample data for testing
CREATE OR REPLACE FUNCTION insert_sample_data()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_admin_id UUID;
    v_beneficiary_id UUID;
    v_application_id UUID;
    v_meeting_id UUID;
    v_task_id UUID;
    v_conversation_id UUID;
BEGIN
    -- Get the admin user ID (assuming it exists)
    SELECT id INTO v_admin_id FROM public.user_profiles WHERE role = 'super_admin' LIMIT 1;
    
    IF v_admin_id IS NULL THEN
        RAISE NOTICE 'No admin user found. Please create an admin user first.';
        RETURN;
    END IF;
    
    -- Insert sample beneficiary
    INSERT INTO public.beneficiaries (
        id,
        full_name,
        date_of_birth,
        gender,
        phone,
        email,
        address,
        city,
        state,
        postal_code,
        country,
        emergency_contact_name,
        emergency_contact_phone,
        household_size,
        monthly_income,
        employment_status,
        education_level,
        marital_status,
        health_conditions,
        disabilities,
        languages_spoken,
        registration_date,
        status,
        created_by,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        'John Doe',
        '1985-03-15',
        'male',
        '+1234567890',
        'john.doe@example.com',
        '123 Main Street',
        'Anytown',
        'State',
        '12345',
        'Country',
        'Jane Doe',
        '+1234567891',
        4,
        2500.00,
        'unemployed',
        'high_school',
        'married',
        ARRAY['diabetes'],
        ARRAY[],
        ARRAY['English', 'Spanish'],
        CURRENT_DATE,
        'active',
        v_admin_id,
        NOW(),
        NOW()
    )
    RETURNING id INTO v_beneficiary_id;
    
    -- Insert sample application
    INSERT INTO public.applications (
        id,
        beneficiary_id,
        aid_type,
        amount_requested,
        currency,
        purpose,
        urgency_level,
        supporting_documents,
        status,
        submitted_date,
        reviewed_by,
        reviewed_date,
        decision_reason,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        v_beneficiary_id,
        'financial',
        1000.00,
        'USD',
        'Emergency medical expenses',
        'high',
        ARRAY['medical_report.pdf', 'income_statement.pdf'],
        'pending',
        CURRENT_DATE,
        NULL,
        NULL,
        NULL,
        NOW(),
        NOW()
    )
    RETURNING id INTO v_application_id;
    
    -- Insert sample meeting
    INSERT INTO public.meetings (
        id,
        title,
        description,
        meeting_type,
        start_time,
        end_time,
        location,
        meeting_url,
        status,
        created_by,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        'Weekly Team Meeting',
        'Regular team sync to discuss ongoing cases and priorities',
        'team_meeting',
        NOW() + INTERVAL '1 day',
        NOW() + INTERVAL '1 day 1 hour',
        'Conference Room A',
        NULL,
        'scheduled',
        v_admin_id,
        NOW(),
        NOW()
    )
    RETURNING id INTO v_meeting_id;
    
    -- Insert sample task
    INSERT INTO public.tasks (
        id,
        title,
        description,
        task_type,
        priority,
        status,
        due_date,
        assigned_to,
        assigned_by,
        related_beneficiary_id,
        related_application_id,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        'Review Application Documents',
        'Review and verify all submitted documents for the emergency aid application',
        'review',
        'high',
        'pending',
        CURRENT_DATE + INTERVAL '2 days',
        v_admin_id,
        v_admin_id,
        v_beneficiary_id,
        v_application_id,
        NOW(),
        NOW()
    )
    RETURNING id INTO v_task_id;
    
    -- Insert sample conversation
    INSERT INTO public.conversations (
        id,
        title,
        conversation_type,
        created_by,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        'Application Review Discussion',
        'case_discussion',
        v_admin_id,
        NOW(),
        NOW()
    )
    RETURNING id INTO v_conversation_id;
    
    -- Insert conversation participant
    INSERT INTO public.conversation_participants (
        id,
        conversation_id,
        user_id,
        role,
        joined_at
    ) VALUES (
        gen_random_uuid(),
        v_conversation_id,
        v_admin_id,
        'admin',
        NOW()
    );
    
    -- Insert sample message
    INSERT INTO public.internal_messages (
        id,
        conversation_id,
        sender_id,
        content,
        message_type,
        sent_at
    ) VALUES (
        gen_random_uuid(),
        v_conversation_id,
        v_admin_id,
        'Initial review of the emergency aid application has been started. All required documents appear to be present.',
        'text',
        NOW()
    );
    
    RAISE NOTICE 'Sample data inserted successfully!';
    RAISE NOTICE 'Beneficiary ID: %', v_beneficiary_id;
    RAISE NOTICE 'Application ID: %', v_application_id;
    RAISE NOTICE 'Meeting ID: %', v_meeting_id;
    RAISE NOTICE 'Task ID: %', v_task_id;
    RAISE NOTICE 'Conversation ID: %', v_conversation_id;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error inserting sample data: %', SQLERRM;
END;
$$;

-- =============================================
-- INSTRUCTIONS FOR MANUAL SETUP
-- =============================================

DO $$
BEGIN
    RAISE NOTICE '=============================================';
    RAISE NOTICE 'ADMIN USER SETUP INSTRUCTIONS';
    RAISE NOTICE '=============================================';
    RAISE NOTICE '';
    RAISE NOTICE '1. Go to your Supabase Dashboard > Authentication > Users';
    RAISE NOTICE '2. Click "Add User" and create a new user with:';
    RAISE NOTICE '   - Email: admin@yourorganization.com';
    RAISE NOTICE '   - Password: (choose a secure password)';
    RAISE NOTICE '   - Email Confirm: true';
    RAISE NOTICE '';
    RAISE NOTICE '3. After creating the user, copy the User ID from the dashboard';
    RAISE NOTICE '';
    RAISE NOTICE '4. Run this SQL command to create the admin profile:';
    RAISE NOTICE '   SELECT create_admin_user_profile(';
    RAISE NOTICE '       ''USER_ID_FROM_DASHBOARD'',';
    RAISE NOTICE '       ''admin@yourorganization.com'',';
    RAISE NOTICE '       ''System Administrator'',';
    RAISE NOTICE '       ''+1234567890''';
    RAISE NOTICE '   );';
    RAISE NOTICE '';
    RAISE NOTICE '5. Optionally, run this command to insert sample data:';
    RAISE NOTICE '   SELECT insert_sample_data();';
    RAISE NOTICE '';
    RAISE NOTICE '=============================================';
    RAISE NOTICE 'SETUP COMPLETE!';
    RAISE NOTICE '=============================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Your Supabase database is now fully configured with:';
    RAISE NOTICE '- All tables, indexes, and relationships';
    RAISE NOTICE '- Comprehensive RLS policies';
    RAISE NOTICE '- Role-based permissions';
    RAISE NOTICE '- Triggers and functions';
    RAISE NOTICE '- Admin user setup functions';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Create your first admin user as described above';
    RAISE NOTICE '2. Test the connection from your application';
    RAISE NOTICE '3. Begin using the system!';
    RAISE NOTICE '';
END $$;