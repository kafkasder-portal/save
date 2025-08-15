import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
import { log } from '@/utils/logger'

interface UserProfile {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: string
  email: string
}

interface AuthState {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName?: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  clearError: () => void
  initialize: () => Promise<void>
  fetchProfile: (userId: string) => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  loading: true,
  error: null,

  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null })
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      if (data.user) {
        await get().fetchProfile(data.user.id)
      }
    } catch (error: any) {
      set({ error: error.message })
    } finally {
      set({ loading: false })
    }
  },

  signUp: async (email: string, password: string, fullName?: string) => {
    try {
      set({ loading: true, error: null })
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      })
      
      if (error) throw error
      
      if (data.user) {
        await get().fetchProfile(data.user.id)
      }
    } catch (error: any) {
      set({ error: error.message })
    } finally {
      set({ loading: false })
    }
  },

  signOut: async () => {
    try {
      set({ loading: true })
      await supabase.auth.signOut()
      set({ user: null, session: null, profile: null })
    } catch (error: any) {
      set({ error: error.message })
    } finally {
      set({ loading: false })
    }
  },

  resetPassword: async (email: string) => {
    try {
      set({ loading: true, error: null })
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) throw error
    } catch (error: any) {
      set({ error: error.message })
    } finally {
      set({ loading: false })
    }
  },

  clearError: () => {
    set({ error: null })
  },

  fetchProfile: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) {
        log.error('Error fetching profile:', error)
        return
      }
      
      if (data) {
        set({ profile: data })
      }
    } catch (error) {
      log.error('Error fetching profile:', error)
    }
  },

  initialize: async () => {
    try {
      set({ loading: true })
      
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        set({ user: session.user, session })
        await get().fetchProfile(session.user.id)
      }
      
      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          set({ user: session.user, session })
          await get().fetchProfile(session.user.id)
        } else {
          set({ user: null, session: null, profile: null })
        }
        set({ loading: false })
      })
    } catch (error: any) {
      set({ error: error.message })
    } finally {
      set({ loading: false })
    }
  }
}))
