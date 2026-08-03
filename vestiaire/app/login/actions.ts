'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export interface SignInResult {
  error?: string;
}

export async function handleSignIn(formData: FormData): Promise<SignInResult> {
  const email = (formData.get('email') as string || '').trim().toLowerCase();
  const password = formData.get('password') as string || '';
  const redirectTo = (formData.get('redirectTo') as string) || '/closet';

  // 1. Basic Server Validation
  if (!email || !email.includes('@')) {
    return { error: 'Please enter a valid email address.' };
  }

  if (!password) {
    return { error: 'Please enter your password.' };
  }

  // 2. Authenticate via Supabase SSR
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // 3. User-Friendly Plain English Error Translation
      if (
        error.message.includes('Invalid login credentials') ||
        error.message.includes('invalid_credentials')
      ) {
        return { error: 'Incorrect email or password. Please check your details and try again.' };
      }
      if (error.message.includes('Email not confirmed')) {
        return { error: 'Your email address has not been confirmed yet. Please check your inbox.' };
      }
      if (error.message.includes('rate limit')) {
        return { error: 'Too many failed login attempts. Please wait a minute and try again.' };
      }
      return { error: 'Unable to sign in. Please verify your credentials and try again.' };
    }

    // Redirect to main closet app on success
    redirect(redirectTo);
  } catch (err: any) {
    if (err.digest?.startsWith('NEXT_REDIRECT')) {
      throw err;
    }
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function handleSignOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
