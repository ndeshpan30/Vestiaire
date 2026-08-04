import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { HeaderNav } from '@/components/HeaderNav';
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
    <div className="min-h-screen bg-white text-[#121212] font-sans">
      <HeaderNav userEmail={user?.email} />

      <main className="max-w-4xl mx-auto px-6 py-20 text-center">
        <span className="inline-block rounded-full bg-[#FAFAFA] border border-[#EEEEEE] px-3 py-1 text-xs font-semibold text-[#5B1422] uppercase tracking-wider mb-4">
          EDITORIAL CLOSET ENGINE
        </span>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#121212] uppercase leading-tight mb-4">
          CURATED WARDROBE ARCHITECTURE
        </h1>

        <p className="text-base text-[#525252] max-w-2xl mx-auto leading-relaxed mb-8">
          A minimalist approach to personal style—high-contrast typography, strict spatial geometry, and automated AI outfit pairing powered by Supabase and Gemini Vision.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="py-3 px-6 bg-[#5B1422] hover:bg-[#450F1A] text-white font-semibold text-xs uppercase tracking-wider rounded-md transition shadow-xs"
          >
            Create Your Account
          </Link>
          <Link
            href="/login"
            className="py-3 px-6 bg-white border border-[#EEEEEE] hover:border-[#5B1422] hover:text-[#5B1422] text-xs font-semibold uppercase tracking-wider text-[#121212] rounded-md transition"
          >
            Sign In
          </Link>
        </div>
      </main>
    </div>
  );
}
