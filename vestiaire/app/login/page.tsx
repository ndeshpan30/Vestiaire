'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { handleSignIn } from './actions';

function PixelPerfectLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirectTo') || '/closet';

  // Interactive Mockup State Toggles (Live Auth, Error Demo, Loading Demo)
  const [mockState, setMockState] = useState<'real' | 'error' | 'loading'>('real');
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');

    // Mock state demo override for development testing
    if (mockState === 'error') {
      setErrorMessage('Incorrect email or password. Please verify your credentials.');
      return;
    }

    if (!email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    formData.append('redirectTo', redirectTo);

    // Call Supabase Server Action Handler
    const result = await handleSignIn(formData);

    if (result?.error) {
      setIsSubmitting(false);
      setErrorMessage(result.error);
    } else {
      // Automatic client-side router transition to /closet on successful authentication
      router.push(redirectTo);
      router.refresh();
    }
  };

  const currentLoading = mockState === 'loading' || isSubmitting;
  const currentError = mockState === 'error' ? 'Invalid email or password. Please check your credentials.' : errorMessage;

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center py-10 px-5 font-sans relative">
      {/* 1. Layout & Container (Max-Width 400px) */}
      <div className="w-full max-w-[400px]">
        {/* 2. Brand & Header Hierarchy */}
        <div className="text-center mb-10">
          <Link href="/">
            <h1 className="text-3xl font-serif font-semibold tracking-widest text-[#4A121A] uppercase">
              VESTIAIRE
            </h1>
          </Link>
        </div>

        {/* Eyebrow & Main Heading */}
        <div className="text-left mb-6">
          <p className="text-xs font-semibold tracking-wider text-[#71717A] uppercase mb-1">
            WELCOME BACK
          </p>
          <h2 className="text-3xl font-serif font-normal text-[#18181B] leading-tight">
            Sign in to your closet.
          </h2>
        </div>

        {/* 3. Tabs Component */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            type="button"
            onClick={() => setActiveTab('signin')}
            className={`pb-3 font-sans text-sm font-semibold border-b-2 transition ${
              activeTab === 'signin'
                ? 'border-[#4A121A] text-[#18181B]'
                : 'border-transparent text-[#71717A] hover:text-[#18181B]'
            } mr-6`}
          >
            Sign In
          </button>
          <Link
            href="/signup"
            className="pb-3 font-sans text-sm font-medium text-[#71717A] hover:text-[#18181B] transition"
          >
            Create Account
          </Link>
        </div>

        {/* Error State Alert Banner */}
        {currentError && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded-none leading-relaxed animate-in fade-in duration-200">
            <p className="font-semibold mb-0.5">Authentication Error</p>
            <p>{currentError}</p>
          </div>
        )}

        {/* 4. Editorial Underline Inputs Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label className="block text-xs font-medium tracking-wider text-gray-600 uppercase mb-1.5">
              EMAIL
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full px-0 py-2 bg-transparent border-b border-gray-200 text-sm text-[#18181B] focus:border-[#4A121A] outline-none transition rounded-none placeholder:text-gray-400"
            />
          </div>

          {/* Password Field with Inline SHOW Action Button */}
          <div>
            <label className="block text-xs font-medium tracking-wider text-gray-600 uppercase mb-1.5">
              PASSWORD
            </label>
            <div className="relative flex items-center border-b border-gray-200 focus-within:border-[#4A121A] transition">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-0 py-2 bg-transparent text-sm text-[#18181B] outline-none rounded-none placeholder:text-gray-400 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 text-xs font-bold tracking-wider text-gray-600 hover:text-[#4A121A] uppercase focus:outline-none"
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>

            {/* Recovery Link */}
            <div className="text-right mt-2">
              <Link
                href="/forgot-password"
                className="text-xs text-gray-600 hover:underline transition"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {/* 5. Primary CTA Button (#4A121A Oxblood) */}
          <button
            type="submit"
            disabled={currentLoading}
            className="w-full py-3.5 bg-[#4A121A] hover:bg-[#380D14] active:bg-[#28090E] disabled:opacity-60 text-white font-medium text-sm rounded-none transition shadow-xs flex items-center justify-center gap-2 mt-4 cursor-pointer"
          >
            {currentLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Signing In...</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Secondary Toggle Link */}
        <div className="mt-8 text-center text-xs text-gray-600">
          New to Vestiaire?{' '}
          <Link href="/signup" className="font-bold text-[#4A121A] hover:underline">
            Create an account.
          </Link>
        </div>
      </div>

      {/* 6. Interactive Mockup State Bar (Conditionally Rendered ONLY in Development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-[#18181B] text-white p-1.5 flex items-center gap-1 shadow-2xl z-50 text-xs border border-neutral-800">
          <button
            type="button"
            onClick={() => {
              setMockState('real');
              setErrorMessage('');
            }}
            className={`px-3 py-1 rounded-full font-semibold transition ${
              mockState === 'real'
                ? 'bg-white text-[#18181B] shadow-xs'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Live Auth
          </button>
          <button
            type="button"
            onClick={() => {
              setMockState('error');
              setErrorMessage('Invalid email or password. Please check your credentials.');
            }}
            className={`px-3 py-1 rounded-full font-semibold transition ${
              mockState === 'error'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Error Demo
          </button>
          <button
            type="button"
            onClick={() => {
              setMockState('loading');
            }}
            className={`px-3 py-1 rounded-full font-semibold transition ${
              mockState === 'loading'
                ? 'bg-[#4A121A] text-white shadow-xs'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Loading Demo
          </button>
        </div>
      )}
    </div>
  );
}

export default function PixelPerfectLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center text-sm text-gray-600">Loading...</div>}>
      <PixelPerfectLoginForm />
    </Suspense>
  );
}
