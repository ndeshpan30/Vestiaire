'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function NavigationTabs() {
  const pathname = usePathname();

  const isArchiveActive = pathname === '/inventory' || pathname === '/closet';
  const isStylingActive = pathname === '/generate' || pathname === '/styling';

  return (
    <nav className="sticky top-0 z-40 w-full bg-white border-b border-[#EEEEEE] shadow-2xs">
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-center sm:justify-start gap-2 sm:gap-6">
        {/* Tab 1: Wardrobe Archive */}
        <Link
          href="/inventory"
          className={`py-3.5 px-4 sm:px-6 text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
            isArchiveActive
              ? 'border-[#4A121A] text-[#4A121A] bg-[#FAF5F6]/50'
              : 'border-transparent text-[#737373] hover:text-[#121212] hover:border-[#D4D4D4]'
          }`}
        >
          <span>📁</span>
          <span>Wardrobe Archive</span>
        </Link>

        {/* Tab 2: AI Styling Suite */}
        <Link
          href="/generate"
          className={`py-3.5 px-4 sm:px-6 text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
            isStylingActive
              ? 'border-[#4A121A] text-[#4A121A] bg-[#FAF5F6]/50'
              : 'border-transparent text-[#737373] hover:text-[#121212] hover:border-[#D4D4D4]'
          }`}
        >
          <span>✨</span>
          <span>AI Styling Suite</span>
        </Link>
      </div>
    </nav>
  );
}
