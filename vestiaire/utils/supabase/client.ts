import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || 'placeholder-anon-key';

  try {
    return createBrowserClient(url, key);
  } catch (err) {
    console.warn('Supabase browser client fallback initialization:', err);
    return createBrowserClient('https://placeholder.supabase.co', 'placeholder-anon-key');
  }
}
