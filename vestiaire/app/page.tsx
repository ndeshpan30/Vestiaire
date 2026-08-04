import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { HeaderNav } from '@/components/HeaderNav';
import { NavigationTabs } from '@/components/navigation-tabs';
import Link from 'next/link';

export default async function HomePage() {
  let user: any = null;

  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    user = data?.user || null;
  } catch (err) {
    console.error('[HomePage] Auth fetch error:', err);
    user = null;
  }

  return (
    <div className="min-h-screen bg-white text-[#121212] font-sans flex flex-col">
      <HeaderNav userEmail={user?.email} />
      <NavigationTabs />

      <main className="max-w-4xl mx-auto px-6 py-16 text-center flex-1">
        <span className="inline-block rounded-full bg-[#FAF5F6] border border-[#E5D5D8] px-3 py-1 text-xs font-semibold text-[#4A121A] uppercase tracking-wider mb-4">
          EDITORIAL CLOSET ENGINE
        </span>

        <h1 className="text-4xl sm:text-5xl font-serif font-normal tracking-tight text-[#121212] leading-tight mb-4">
          Curated Wardrobe Architecture
        </h1>

        <p className="text-sm sm:text-base text-[#525252] max-w-2xl mx-auto leading-relaxed mb-8">
          A minimalist approach to personal style—high-contrast typography, strict spatial geometry, and automated AI outfit pairing powered by Supabase and Gemini Vision.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/inventory"
            className="w-full sm:w-auto py-3.5 px-8 bg-[#4A121A] hover:bg-[#380D14] text-white font-semibold text-xs uppercase tracking-wider rounded-md transition shadow-sm flex items-center justify-center"
          >
            <span>Tab 1: Wardrobe Archive</span>
          </Link>
          <Link
            href="/generate"
            className="w-full sm:w-auto py-3.5 px-8 bg-white border border-[#4A121A] text-[#4A121A] hover:bg-[#FAF5F6] font-semibold text-xs uppercase tracking-wider rounded-md transition shadow-2xs flex items-center justify-center"
          >
            <span>Tab 2: AI Styling Suite</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
