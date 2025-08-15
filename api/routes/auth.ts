import { Router, type Request, type Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

// Initialize Supabase client with service role key for admin operations
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || 'https://demo.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'demo_service_key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Regular Supabase client for user operations
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://demo.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'demo_key'
);

/**
 * User Registration
 * POST /api/auth/register
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, full_name, department, phone } = req.body;

    // Validate required fields
    if (!email || !password || !full_name) {
      res.status(400).json({ 
        error: 'Email, password, and full name are required' 
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
      return;
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          department,
          phone
        }
      }
    });

    if (authError) {
      console.error('Auth registration error:', authError);
      res.status(400).json({ 
        error: authError.message || 'Registration failed' 
      });
      return;
    }

    if (!authData.user) {
      res.status(400).json({ error: 'User creation failed' });
      return;
    }

    // Create user profile
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        full_name,
        department: department || null,
        phone: phone || null,
        role: 'viewer', // Default role
        is_active: true
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // If profile creation fails, we should clean up the auth user
      // But we'll just log it for now since the auth user might be needed
    }

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        full_name,
        role: 'viewer'
      },
      session: authData.session
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * User Login
 * POST /api/auth/login
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Sign in with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error('Login error:', authError);
      res.status(401).json({ 
        error: authError.message || 'Invalid credentials' 
      });
      return;
    }

    if (!authData.user || !authData.session) {
      res.status(401).json({ error: 'Login failed' });
      return;
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      // Create profile if it doesn't exist
      const { error: createError } = await supabaseAdmin
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          full_name: authData.user.user_metadata?.full_name || 'User',
          role: 'viewer',
          is_active: true
        });

      if (createError) {
        console.error('Profile creation error:', createError);
      }
    }

    // Check if user is active
    if (profile && !profile.is_active) {
      res.status(403).json({ error: 'Account is deactivated' });
      return;
    }

    // Update last seen
    await supabaseAdmin
      .from('user_profiles')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('id', authData.user.id);

    res.json({
      message: 'Login successful',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        full_name: profile?.full_name || authData.user.user_metadata?.full_name,
        role: profile?.role || 'viewer',
        department: profile?.department,
        phone: profile?.phone,
        avatar_url: profile?.avatar_url,
        is_active: profile?.is_active ?? true
      },
      session: authData.session
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * User Logout
 * POST /api/auth/logout
 */
router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      // Sign out from Supabase
      const { error } = await supabase.auth.admin.signOut(token);
      
      if (error) {
        console.error('Logout error:', error);
        // Don't fail the request if logout fails - client should clear token anyway
      }
    }

    res.json({ message: 'Logout successful' });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get Current User
 * GET /api/auth/me
 */
router.get('/me', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authorization required' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      res.status(500).json({ error: 'Failed to fetch user profile' });
      return;
    }

    // Check if user is active
    if (!profile.is_active) {
      res.status(403).json({ error: 'Account is deactivated' });
      return;
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: profile.full_name,
        role: profile.role,
        department: profile.department,
        phone: profile.phone,
        avatar_url: profile.avatar_url,
        is_active: profile.is_active,
        last_seen_at: profile.last_seen_at,
        created_at: profile.created_at
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Update User Profile
 * PUT /api/auth/profile
 */
router.put('/profile', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authorization required' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    const { full_name, department, phone, avatar_url } = req.body;

    const updateData: any = {};
    if (full_name !== undefined) updateData.full_name = full_name;
    if (department !== undefined) updateData.department = department;
    if (phone !== undefined) updateData.phone = phone;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
    
    updateData.updated_at = new Date().toISOString();

    const { data: profile, error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Profile update error:', updateError);
      res.status(500).json({ error: 'Failed to update profile' });
      return;
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        full_name: profile.full_name,
        role: profile.role,
        department: profile.department,
        phone: profile.phone,
        avatar_url: profile.avatar_url,
        is_active: profile.is_active
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Change Password
 * POST /api/auth/change-password
 */
router.post('/change-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authorization required' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      res.status(400).json({ error: 'Current password and new password are required' });
      return;
    }

    if (new_password.length < 6) {
      res.status(400).json({ error: 'New password must be at least 6 characters long' });
      return;
    }

    // Verify current password by attempting to sign in
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: current_password
    });

    if (verifyError) {
      res.status(400).json({ error: 'Current password is incorrect' });
      return;
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: new_password
    });

    if (updateError) {
      console.error('Password update error:', updateError);
      res.status(500).json({ error: 'Failed to update password' });
      return;
    }

    res.json({ message: 'Password updated successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Request Password Reset
 * POST /api/auth/forgot-password
 */
router.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`
    });

    if (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ error: 'Failed to send reset email' });
      return;
    }

    res.json({ 
      message: 'If an account with that email exists, a password reset link has been sent' 
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Reset Password
 * POST /api/auth/reset-password
 */
router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, new_password } = req.body;

    if (!token || !new_password) {
      res.status(400).json({ error: 'Token and new password are required' });
      return;
    }

    if (new_password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long' });
      return;
    }

    // Verify token and update password
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'recovery'
    });

    if (error) {
      console.error('Token verification error:', error);
      res.status(400).json({ error: 'Invalid or expired token' });
      return;
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: new_password
    });

    if (updateError) {
      console.error('Password update error:', updateError);
      res.status(500).json({ error: 'Failed to update password' });
      return;
    }

    res.json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
