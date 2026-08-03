'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { handleSignUp } from './actions';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please check and try again.');
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    formData.append('confirmPassword', confirmPassword);

    const result = await handleSignUp(formData);
    setIsSubmitting(false);

    if (result.error) {
      setErrorMessage(result.error);
    } else if (result.success) {
      setSuccessMessage(result.success);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center px-4 py-12 font-sans">
      <div className="w-full max-w-md">
        {/* Luxury Brand Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-normal font-serif tracking-tight text-[#121212] uppercase mb-1">
            VESTIAIRE
          </h1>
          <div className="text-xs font-bold tracking-widest text-[#5B1422] uppercase">
            CREATE YOUR EDITORIAL PROFILE
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white border border-[#EEEEEE] rounded-lg p-8 shadow-xs">
          <h2 className="text-2xl font-normal font-serif text-[#121212] mb-1">Create Account</h2>
          <p className="text-xs text-[#525252] mb-8">
            Enter your email and password to set up your personal closet workspace.
          </p>

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-md leading-relaxed">
              <p className="font-semibold mb-1">Success!</p>
              <p>{successMessage}</p>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md leading-relaxed">
              <p className="font-semibold mb-1">Registration Notice</p>
              <p>{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Minimalistic Underline Email Input */}
            <div>
              <label className="block text-xs font-bold text-[#121212] uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.name@editorial.com"
                className="w-full px-1 py-2.5 bg-transparent border-b-1.5 border-[#D4D4D4] text-sm text-[#121212] focus:border-[#5B1422] focus:outline-none transition rounded-none"
              />
            </div>

            {/* Minimalistic Underline Password Input */}
            <div>
              <label className="block text-xs font-bold text-[#121212] uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-1 py-2.5 bg-transparent border-b-1.5 border-[#D4D4D4] text-sm text-[#121212] focus:border-[#5B1422] focus:outline-none transition rounded-none"
              />
            </div>

            {/* Minimalistic Underline Confirm Password Input */}
            <div>
              <label className="block text-xs font-bold text-[#121212] uppercase tracking-wider mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full px-1 py-2.5 bg-transparent border-b-1.5 border-[#D4D4D4] text-sm text-[#121212] focus:border-[#5B1422] focus:outline-none transition rounded-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 py-3 bg-[#5B1422] hover:bg-[#450F1A] active:bg-[#320B13] disabled:opacity-50 text-white font-semibold text-xs uppercase tracking-wider rounded-md transition shadow-xs"
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Footer Navigation Link */}
          <div className="mt-8 text-center text-xs text-[#525252]">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-[#5B1422] hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
