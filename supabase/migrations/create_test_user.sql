-- Create test user account with admin privileges
-- Email: isahamid095@gmail.com
-- Password: vadalov95
-- Role: admin

-- First, check if user already exists, if not create it
DO $$
DECLARE
    user_uuid uuid;
    user_exists boolean := false;
BEGIN
    -- Check if user already exists
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'isahamid095@gmail.com') INTO user_exists;
    
    IF NOT user_exists THEN
        -- Generate a new UUID for the user
        user_uuid := gen_random_uuid();
        
        -- Insert the user into auth.users table
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            role,
            aud,
            confirmation_token,
            email_change_token_new,
            recovery_token
        ) VALUES (
            user_uuid,
            '00000000-0000-0000-0000-000000000000',
            'isahamid095@gmail.com',
            crypt('vadalov95', gen_salt('bf')),
            now(),
            now(),
            now(),
            'authenticated',
            'authenticated',
            '',
            '',
            ''
        );
        
        RAISE NOTICE 'User created with ID: %', user_uuid;
    ELSE
        RAISE NOTICE 'User already exists with email: isahamid095@gmail.com';
    END IF;
END $$;

-- Get the user ID for the profile creation
DO $$
DECLARE
    user_uuid uuid;
BEGIN
    -- Get the user ID from auth.users
    SELECT id INTO user_uuid FROM auth.users WHERE email = 'isahamid095@gmail.com';
    
    -- Insert into user_profiles with admin role
    INSERT INTO public.user_profiles (
        id,
        full_name,
        display_name,
        email,
        phone,
        role,
        department,
        position,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        user_uuid,
        'İsa Hamid',
        'İsa',
        'isahamid095@gmail.com',
        '+90 555 123 4567',
        'admin',
        'Yönetim',
        'Sistem Yöneticisi',
        true,
        now(),
        now()
    ) ON CONFLICT (id) DO UPDATE SET
        role = 'admin',
        department = 'Yönetim',
        position = 'Sistem Yöneticisi',
        updated_at = now();
END $$;

-- Grant necessary permissions to anon and authenticated roles for user_profiles table
GRANT SELECT ON public.user_profiles TO anon;
GRANT ALL PRIVILEGES ON public.user_profiles TO authenticated;

-- Ensure RLS policies allow the user to access their own profile
-- This policy should already exist, but we'll create it if it doesn't
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_profiles' 
        AND policyname = 'Users can view their own profile'
    ) THEN
        CREATE POLICY "Users can view their own profile" ON public.user_profiles
            FOR SELECT USING (auth.uid() = id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_profiles' 
        AND policyname = 'Users can update their own profile'
    ) THEN
        CREATE POLICY "Users can update their own profile" ON public.user_profiles
            FOR UPDATE USING (auth.uid() = id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_profiles' 
        AND policyname = 'Admins can view all profiles'
    ) THEN
        CREATE POLICY "Admins can view all profiles" ON public.user_profiles
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.user_profiles 
                    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
                )
            );
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_profiles' 
        AND policyname = 'Admins can manage all profiles'
    ) THEN
        CREATE POLICY "Admins can manage all profiles" ON public.user_profiles
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.user_profiles 
                    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
                )
            );
    END IF;
END $$;

-- Create a function to handle user registration and profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.user_profiles (id, full_name, email, role)
    VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email, 'user');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verify the user was created successfully
DO $$
DECLARE
    user_count integer;
    profile_count integer;
BEGIN
    SELECT COUNT(*) INTO user_count FROM auth.users WHERE email = 'isahamid095@gmail.com';
    SELECT COUNT(*) INTO profile_count FROM public.user_profiles WHERE email = 'isahamid095@gmail.com';
    
    RAISE NOTICE 'Test user creation completed:';
    RAISE NOTICE 'Auth users count: %', user_count;
    RAISE NOTICE 'User profiles count: %', profile_count;
    
    IF user_count = 0 THEN
        RAISE EXCEPTION 'Failed to create user in auth.users table';
    END IF;
    
    IF profile_count = 0 THEN
        RAISE EXCEPTION 'Failed to create user profile';
    END IF;
    
    RAISE NOTICE 'Test user isahamid095@gmail.com created successfully with admin role';
END $$;