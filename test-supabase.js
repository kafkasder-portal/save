import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ibqhfgpdgzrhvyfpgjxx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlicWhmZ3BkZ3pyaHZ5ZnBnanh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMDk3NDcsImV4cCI6MjA3MDY4NTc0N30.1vSikm9_Dn978BctKWXhoOfPCKztLaBNgr8OEIVIXNg'
)

const { data, error } = await supabase
  .from('todos')
  .select()

if (error) {
  console.error('Error:', error)
} else {
  console.log('Data:', data)
}