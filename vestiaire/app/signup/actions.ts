'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export interface SignUpResult {
  error?: string;
  success?: string;
}

export async function handleSignUp(formData: FormData): Promise<SignUpResult> {
  const email = (formData.get('email') as string || '').trim().toLowerCase();
  const password = formData.get('password') as string || '';
  const confirmPassword = formData.get('confirmPassword') as string || '';

  // 1. Basic Server-Side Validation
  if (!email || !email.includes('@')) {
    return { error: 'Please enter a valid email address.' };
  }

  if (!password || password.length < 6) {
    return { error: 'Password must be at least 6 characters long.' };
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match. Please check and try again.' };
  }

  // 2. Execute Supabase Sign-Up via Server Client (@supabase/ssr)
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      },
    });

    if (error) {
      // 3. User-Friendly Plain English Error Translation
      if (error.message.includes('already registered') || error.status === 422) {
        return { error: 'This email is already registered. Please sign in instead.' };
      }
      if (error.message.includes('rate limit')) {
        return { error: 'Too many registration attempts. Please wait a minute and try again.' };
      }
      return { error: 'Unable to create account. Please check your credentials and try again.' };
    }

    // 4. Handle Immediate Session vs Confirmation Check
    if (data.session) {
      redirect('/closet');
    }

    return {
      success: 'Account created successfully! If email confirmation is enabled on your project, please check your inbox to confirm your account.',
    };
  } catch (err: any) {
    if (err.digest?.startsWith('NEXT_REDIRECT')) {
      throw err; // Allow Next.js redirect to pass through
    }
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}
