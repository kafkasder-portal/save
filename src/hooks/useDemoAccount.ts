import { useMutation } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { log } from '@/utils/logger'

interface CreateDemoAccountData {
  email: string
  password: string
  fullName: string
  role: string
}

const createDemoAccount = async (): Promise<CreateDemoAccountData> => {
  try {
    // Generate random demo account data
    const randomId = Math.random().toString(36).substring(2, 8)
    const demoData: CreateDemoAccountData = {
      email: `demo-${randomId}@example.com`,
      password: `demo-${randomId}-password`,
      fullName: `Demo User ${randomId}`,
      role: 'viewer'
    }
    
    // Create the demo user account
    const { data, error } = await supabase.auth.signUp({
      email: demoData.email,
      password: demoData.password,
      options: {
        data: {
          full_name: demoData.fullName,
          role: demoData.role
        }
      }
    })
    
    if (error) {
      throw new Error(`Demo hesabı oluşturulamadı: ${error.message}`)
    }
    
    if (!data.user) {
      throw new Error('Demo hesabı oluşturulamadı')
    }
    
    // Create profile record
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: data.user.id,
          full_name: demoData.fullName,
          role: demoData.role,
          email: demoData.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
    
    if (profileError) {
      log.error('Profile oluşturulamadı:', profileError)
      // Don't throw here as the user account was created successfully
    }
    
    return demoData
  } catch (error) {
    throw error
  }
}

export const useCreateDemoAccount = () => {
  return useMutation({
    mutationFn: createDemoAccount,
    onSuccess: (data) => {
      toast.success(
        `Demo hesabı oluşturuldu!\nEmail: ${data.email}\nŞifre: ${data.password}`,
        {
          duration: 10000,
          style: {
            minWidth: '300px'
          }
        }
      )
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Demo hesabı oluşturulamadı')
    }
  })
}
