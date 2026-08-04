import { createBrowserClient } from '@supabase/ssr';
import { type SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/supabase/database.types';

export function createClient(): SupabaseClient<Database> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || 'placeholder-anon-key';

  try {
    return createBrowserClient<Database>(url, key) as unknown as SupabaseClient<Database>;
  } catch (err) {
    console.warn('Supabase browser client fallback initialization:', err);
    return createBrowserClient<Database>('https://placeholder.supabase.co', 'placeholder-anon-key') as unknown as SupabaseClient<Database>;
  }
}
