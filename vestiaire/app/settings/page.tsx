import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { HeaderNav } from '@/components/HeaderNav';
import { handleSignOut } from '@/app/login/actions';
import Link from 'next/link';

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-white text-[#121212] font-sans">
      <HeaderNav userEmail={user?.email} />

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Header Title */}
        <div className="mb-8 border-b border-[#EEEEEE] pb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-extrabold tracking-widest text-[#5B1422] uppercase">
                SYSTEM CONFIGURATION
              </span>
            </div>
            <h1 className="text-3xl font-serif font-normal text-[#121212]">
              Account Settings & Preferences
            </h1>
            <p className="text-xs text-[#525252] mt-1">
              Manage your style profile and authentication preferences.
            </p>
          </div>

          <Link
            href="/closet"
            className="py-2 px-4 bg-white border border-[#EEEEEE] hover:border-[#5B1422] hover:text-[#5B1422] text-xs font-semibold uppercase tracking-wider rounded-md transition"
          >
            ← Back to Closet
          </Link>
        </div>

        {/* Settings Card */}
        <div className="bg-white border border-[#EEEEEE] rounded-lg p-8 shadow-xs space-y-8">
          {/* User Profile Form */}
          <div>
            <h2 className="text-xl font-serif font-normal text-[#121212] mb-4">
              Profile Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-[#121212] uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  defaultValue="Editorial Curator"
                  className="w-full px-1 py-2.5 bg-transparent border-b-1.5 border-[#D4D4D4] text-sm text-[#121212] focus:border-[#5B1422] focus:outline-none transition rounded-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#121212] uppercase tracking-wider mb-1">
                  Style Preference
                </label>
                <select className="w-full px-1 py-2.5 bg-transparent border-b-1.5 border-[#D4D4D4] text-sm text-[#121212] focus:border-[#5B1422] focus:outline-none transition rounded-none">
                  <option value="Editorial">Editorial</option>
                  <option value="Minimalist">Minimalist</option>
                  <option value="Classic Luxury">Classic Luxury</option>
                  <option value="Streetwear">Streetwear</option>
                  <option value="Bohemian">Bohemian</option>
                  <option value="Vintage">Vintage</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cloud Status (No API Key Input Field) */}
          <div className="border-t border-[#EEEEEE] pt-8">
            <h2 className="text-xl font-serif font-normal text-[#121212] mb-4">
              Cloud & Environment Integration
            </h2>

            <div className="space-y-4">
              <div className="p-4 bg-[#FAFAFA] border border-[#EEEEEE] rounded-md flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#121212] uppercase tracking-wider block mb-1">
                    Google Gemini 2.5 Flash Vision API
                  </span>
                  <span className="text-xs text-[#525252]">
                    Managed securely via server-side environment variables (<code className="font-mono bg-white px-1.5 py-0.5 border border-[#EEEEEE] text-[#5B1422]">GEMINI_API_KEY</code>).
                  </span>
                </div>
                <span className="px-2.5 py-1 bg-[#5B1422] text-white text-[11px] font-semibold rounded">
                  Server Active
                </span>
              </div>

              <div className="p-4 bg-[#FAFAFA] border border-[#EEEEEE] rounded-md flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#121212] uppercase tracking-wider block mb-1">
                    Supabase Project Endpoint
                  </span>
                  <span className="text-xs text-[#525252] font-mono">
                    https://hxojdmiqnzqdwhlhnnsm.supabase.co
                  </span>
                </div>
                <span className="px-2.5 py-1 bg-[#F5F5F5] border border-[#E5E5E5] text-[#404040] text-[11px] font-semibold rounded">
                  Connected
                </span>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="border-t border-[#EEEEEE] pt-6 flex items-center justify-between">
            <form action={handleSignOut}>
              <button
                type="submit"
                className="py-2.5 px-4 bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 font-semibold text-xs uppercase tracking-wider rounded-md transition"
              >
                Sign Out of Session
              </button>
            </form>

            <button
              type="button"
              className="py-2.5 px-6 bg-[#5B1422] hover:bg-[#450F1A] text-white font-semibold text-xs uppercase tracking-wider rounded-md transition shadow-xs"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
