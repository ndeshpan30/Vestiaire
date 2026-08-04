import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { HeaderNav } from '@/components/HeaderNav';
import { GarmentUploader } from '@/components/garment-uploader';
import Link from 'next/link';

export default async function InventoryPage() {
  let user: any = null;

  try {
    const supabase = createClient();
    const authResult = await supabase.auth.getUser();
    user = authResult?.data?.user || null;
  } catch (err) {
    console.error('[InventoryPage] Auth session resolution error:', err);
    user = null;
  }

  // Ensure user is non-null before referencing user.id
  const userId = user && typeof user.id === 'string' ? user.id : undefined;

  return (
    <div className="min-h-screen bg-white text-[#121212] font-sans">
      <HeaderNav userEmail={user?.email} />

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Header Title */}
        <div className="mb-8 border-b border-[#EEEEEE] pb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-extrabold tracking-widest text-[#4A121A] uppercase">
                INVENTORY MANAGEMENT
              </span>
            </div>
            <h1 className="text-3xl font-serif font-normal text-[#121212]">
              Add New Garments
            </h1>
            <p className="text-xs text-[#525252] mt-1">
              Upload garment photos to expand your personal editorial closet database with Gemini AI vision tag auto-completion.
            </p>
          </div>

          <Link
            href="/closet"
            className="py-2 px-4 bg-white border border-[#EEEEEE] hover:border-[#4A121A] hover:text-[#4A121A] text-xs font-semibold uppercase tracking-wider rounded-md transition"
          >
            ← Back to Closet
          </Link>
        </div>

        {/* Bulk Garment Image Uploader Component */}
        <div className="bg-white border border-[#EEEEEE] rounded-lg p-8 shadow-xs mb-8">
          <h2 className="text-xl font-serif font-normal text-[#121212] mb-4">
            Upload & AI Vision Auto-Tagging
          </h2>
          <GarmentUploader userId={userId} />
        </div>
      </main>
    </div>
  );
}
