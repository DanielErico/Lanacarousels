import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || 'https://uhdrzxjgzzbhuybhvnun.supabase.co';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoZHJ6eGpnenpiaHV5Ymh2bnVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4MzQwNDYsImV4cCI6MjEwMTQxMDA0Nn0.JcuGIivSJ2KIyORJuslBnej5O5q8I0YET3jbvZUiLB4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type SupabaseProfile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  onboarding_completed: boolean;
  created_at: string;
};

export type SupabaseBrand = {
  id: string;
  user_id: string;
  name: string;
  website_url: string | null;
  industry: string | null;
  description: string | null;
  audience: string | null;
  voice: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  ig_handle: string | null;
  ig_connected: boolean;
  ig_account_name: string | null;
  posting_frequency: string;
  is_primary: boolean;
  created_at: string;
};
