import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      subscriptions: {
        Row: {
          id: string
          user_id: string
          name: string
          price: number
          billing_cycle: 'monthly' | 'yearly'
          renewal_date: string
          cancel_url: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          price: number
          billing_cycle: 'monthly' | 'yearly'
          renewal_date: string
          cancel_url: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          price?: number
          billing_cycle?: 'monthly' | 'yearly'
          renewal_date?: string
          cancel_url?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
