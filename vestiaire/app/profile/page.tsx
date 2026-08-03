import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { HeaderNav } from '@/components/HeaderNav';
import { handleSignOut } from '@/app/login/actions';

export default async function ProfilePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-white text-[#121212] font-sans">
      <HeaderNav userEmail={user?.email} />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-extrabold uppercase tracking-wider text-[#121212] mb-1">
          USER PROFILE & SETTINGS
        </h1>
        <p className="text-xs text-[#525252] mb-8">
          Manage your account preferences and personal style configuration.
        </p>

        <div className="bg-white border border-[#EEEEEE] rounded-lg p-6 space-y-6 shadow-xs">
          <div>
            <label className="block text-xs font-bold text-[#121212] uppercase tracking-wider mb-1">
              Email Address
            </label>
            <p className="text-sm font-semibold text-[#5B1422]">{user?.email}</p>
          </div>

          <div className="border-t border-[#EEEEEE] pt-6">
            <label className="block text-xs font-bold text-[#121212] uppercase tracking-wider mb-1">
              Account ID
            </label>
            <p className="text-xs text-[#525252] font-mono bg-[#FAFAFA] p-2 rounded border border-[#EEEEEE]">
              {user?.id}
            </p>
          </div>

          <div className="border-t border-[#EEEEEE] pt-6 flex justify-end">
            <form action={handleSignOut}>
              <button
                type="submit"
                className="py-2.5 px-5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs uppercase tracking-wider rounded-md transition shadow-xs"
              >
                Sign Out of Account
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
