import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="max-w-md w-full p-8 border border-[#EEEEEE] rounded-lg shadow-xs">
        <span className="text-xs font-bold tracking-widest text-[#4A121A] uppercase block mb-1">
          404 ERROR
        </span>
        <h1 className="text-3xl font-serif text-[#18181B] mb-2 font-normal">
          Page Not Found
        </h1>
        <p className="text-xs text-[#71717A] mb-6 leading-relaxed">
          The page or garment archive entry you requested could not be located.
        </p>
        <Link
          href="/closet"
          className="inline-block w-full py-3 bg-[#4A121A] hover:bg-[#380D14] text-white font-medium text-xs uppercase tracking-wider rounded-none transition"
        >
          Return to Closet
        </Link>
      </div>
    </div>
  );
}
