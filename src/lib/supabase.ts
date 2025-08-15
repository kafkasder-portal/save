import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if we're in development mode
const isDevelopment = import.meta.env.DEV

// Create a fallback client for development or when env vars are missing
let supabase: any

if (!supabaseUrl || !supabaseAnonKey) {
  if (isDevelopment) {
    console.warn('⚠️ Supabase environment variables are missing. Using fallback configuration.')
    // Create a mock client for development
    supabase = {
      auth: {
        signIn: () => Promise.resolve({ error: null, data: { user: null } }),
        signUp: () => Promise.resolve({ error: null, data: { user: null } }),
        signOut: () => Promise.resolve({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null })
      },
      from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => Promise.resolve({ data: null, error: null }),
        delete: () => Promise.resolve({ data: null, error: null })
      }),
      storage: {
        from: () => ({
          upload: () => Promise.resolve({ data: null, error: null }),
          download: () => Promise.resolve({ data: null, error: null }),
          remove: () => Promise.resolve({ data: null, error: null })
        })
      }
    }
  } else {
    // In production, show a user-friendly error
    console.error('❌ Supabase environment variables are missing in production!')
    throw new Error('Supabase configuration is missing. Please check your environment variables.')
  }
} else {
  // Create the real Supabase client
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  })
}

export { supabase }

// Production'da debug'ı kapat
if (import.meta.env.PROD && supabase.auth) {
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      // Cleanup işlemleri
      console.log('User signed out')
    }
  })
}
