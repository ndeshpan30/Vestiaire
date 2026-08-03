'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.includes('@')) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center py-10 px-5 font-sans">
      <div className="w-full max-w-[400px]">
        {/* Brand Header */}
        <div className="text-center mb-10">
          <Link href="/">
            <h1 className="text-3xl font-serif font-semibold tracking-widest text-[#4A121A] uppercase">
              VESTIAIRE
            </h1>
          </Link>
        </div>

        {/* Eyebrow & Title */}
        <div className="text-left mb-6">
          <p className="text-xs font-semibold tracking-wider text-[#71717A] uppercase mb-1">
            ACCOUNT RECOVERY
          </p>
          <h2 className="text-3xl font-serif font-normal text-[#18181B] leading-tight">
            Reset Password
          </h2>
          <p className="text-xs text-gray-600 mt-2 leading-relaxed">
            Enter the email address associated with your account, and we'll send you instructions to reset your password.
          </p>
        </div>

        {/* Success Banner */}
        {submitted ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-none leading-relaxed mb-6">
            <p className="font-semibold mb-1">Reset Link Sent</p>
            <p>
              If an account exists for <span className="font-semibold">{email}</span>, you will receive a password reset link shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Underline Input */}
            <div>
              <label className="block text-xs font-medium tracking-wider text-gray-600 uppercase mb-1.5">
                EMAIL ADDRESS
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#4A121A] hover:bg-[#380D14] active:bg-[#28090E] disabled:opacity-60 text-white font-medium text-sm rounded-none transition shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              {isSubmitting ? 'Sending Instructions...' : 'Send Password Reset Email'}
            </button>
          </form>
        )}

        {/* Back to Sign In Link */}
        <div className="mt-8 text-center text-xs text-gray-600">
          Remembered your password?{' '}
          <Link href="/login" className="font-bold text-[#4A121A] hover:underline">
            Back to Sign In.
          </Link>
        </div>
      </div>
    </div>
  );
}
