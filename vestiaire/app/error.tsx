'use client';

import React, { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="max-w-md w-full p-8 border border-[#EEEEEE] rounded-lg shadow-xs">
        <span className="text-xs font-bold tracking-widest text-[#4A121A] uppercase block mb-1">
          APPLICATION ERROR
        </span>
        <h2 className="text-2xl font-serif text-[#18181B] mb-2 font-normal">
          Something went wrong
        </h2>
        <p className="text-xs text-[#71717A] mb-6 leading-relaxed">
          {error?.message || 'An unexpected error occurred while loading this page.'}
        </p>
        <button
          onClick={() => reset()}
          className="w-full py-3 bg-[#4A121A] hover:bg-[#380D14] text-white font-medium text-xs uppercase tracking-wider rounded-none transition cursor-pointer"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
