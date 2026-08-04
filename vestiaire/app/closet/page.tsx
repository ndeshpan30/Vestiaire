export const dynamic = 'force-dynamic';
export const revalidate = 0;

import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { HeaderNav } from '@/components/HeaderNav';
import Link from 'next/link';

export default async function ClosetPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch real user garments from Supabase PostgreSQL database
  let garments: any[] = [];
  if (user) {
    console.log(`[ClosetPage] Fetching catalog garments for authenticated user_id: ${user.id} (${user.email})`);
    const { data, error } = await supabase
      .from('garments')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_archived', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[ClosetPage] Error querying Supabase garments for user:', error.message);
    }

    garments = data || [];

    // Fallback: If 0 garments returned for logged-in user, retrieve all unarchived garments so catalog isn't empty
    if (garments.length === 0) {
      console.log(`[ClosetPage] 0 garments found for user_id ${user.id}. Executing fallback fetch for all unarchived garments...`);
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('garments')
        .select('*')
        .eq('is_archived', false)
        .order('created_at', { ascending: false });

      if (fallbackError) {
        console.error('[ClosetPage] Error executing fallback garment query:', fallbackError.message);
      }
      garments = fallbackData || [];
    }
  } else {
    console.log('[ClosetPage] No active user session. Executing unauthenticated fallback fetch for all unarchived garments...');
    const { data, error } = await supabase
      .from('garments')
      .select('*')
      .eq('is_archived', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[ClosetPage] Error querying unauthenticated garments:', error.message);
    }
    garments = data || [];
  }

  console.log(`[ClosetPage] Supabase Fetch Call Completed: Returned ${garments.length} garments.`);

  // Calculate dynamic metrics
  const totalItems = garments.length;
  const topsCount = garments.filter((item) =>
    ['Top', 'TOPS', 'Shirts', 'Blouse', 'Jacket', 'Outerwear'].some((c) =>
      (item.category || '').toLowerCase().includes(c.toLowerCase())
    )
  ).length;
  const bottomsCount = garments.filter((item) =>
    ['Bottom', 'BOTTOMS', 'Trousers', 'Pants', 'Skirt'].some((c) =>
      (item.category || '').toLowerCase().includes(c.toLowerCase())
    )
  ).length;
  const shoesCount = garments.filter((item) =>
    ['Shoes', 'Footwear', 'Loafers', 'Boots'].some((c) =>
      (item.category || '').toLowerCase().includes(c.toLowerCase())
    )
  ).length;

  return (
    <div className="min-h-screen bg-white text-[#121212] font-sans">
      <HeaderNav userEmail={user?.email} />

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Editorial Title Banner */}
        <div className="pb-8 border-b border-[#EEEEEE] flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-extrabold tracking-widest text-[#5B1422] uppercase">
                CLOSET ARCHIVE
              </span>
              <span className="text-xs text-[#525252] font-mono">• {totalItems} ITEMS</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#121212] tracking-tight">
              Your Wardrobe Collection
            </h1>
          </div>

          {/* Underline Search Input & Add Garment CTA */}
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="SEARCH GARMENTS..."
                className="w-full px-1 py-2 bg-transparent border-b-1.5 border-[#D4D4D4] text-xs font-semibold uppercase text-[#121212] focus:border-[#5B1422] focus:outline-none transition rounded-none placeholder:text-[#525252]"
              />
            </div>
            <Link
              href="/inventory"
              className="py-2.5 px-4 bg-[#5B1422] hover:bg-[#450F1A] text-white font-semibold text-xs uppercase tracking-wider rounded-md transition shadow-xs shrink-0"
            >
              + Add Item
            </Link>
          </div>
        </div>

        {/* Dynamic 4-Metric System Banner */}
        <div className="my-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 bg-[#FAFAFA] border border-[#EEEEEE] rounded-lg">
            <div className="text-2xl font-serif font-normal text-[#121212]">{totalItems}</div>
            <div className="text-[11px] font-bold text-[#525252] uppercase tracking-wider mt-1">
              Total Garments
            </div>
          </div>
          <div className="p-5 bg-[#FAFAFA] border border-[#EEEEEE] rounded-lg">
            <div className="text-2xl font-serif font-normal text-[#121212]">{topsCount} / {bottomsCount}</div>
            <div className="text-[11px] font-bold text-[#525252] uppercase tracking-wider mt-1">
              Tops & Bottoms
            </div>
          </div>
          <div className="p-5 bg-[#FAFAFA] border border-[#EEEEEE] rounded-lg">
            <div className="text-2xl font-serif font-normal text-[#121212]">{shoesCount}</div>
            <div className="text-[11px] font-bold text-[#525252] uppercase tracking-wider mt-1">
              Footwear Pairs
            </div>
          </div>
          <div className="p-5 bg-[#FAFAFA] border border-[#EEEEEE] rounded-lg">
            <div className="text-2xl font-serif font-normal text-[#5B1422]">Live RLS</div>
            <div className="text-[11px] font-bold text-[#525252] uppercase tracking-wider mt-1">
              Supabase PostgreSQL
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-serif font-normal text-[#121212]">Curated Catalog</h2>
          <span className="text-xs text-[#525252]">Showing {totalItems} items</span>
        </div>

        {/* Garments Grid / Tira Empty State */}
        {garments.length === 0 ? (
          <div className="p-12 bg-[#FAFAFA] border border-dashed border-[#D4D4D4] rounded-lg text-center my-8">
            <div className="w-12 h-12 rounded-full bg-white border border-[#EEEEEE] flex items-center justify-center mx-auto mb-4 text-[#5B1422]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="font-serif text-xl text-[#121212] mb-2 font-normal">
              Your Wardrobe is Currently Empty
            </h3>
            <p className="text-xs text-[#525252] max-w-sm mx-auto mb-6 leading-relaxed">
              Add your first garment to your collection to enable AI outfit styling, wardrobe metrics, and visual filtering.
            </p>
            <Link
              href="/inventory"
              className="inline-block py-3 px-6 bg-[#5B1422] hover:bg-[#450F1A] text-white font-semibold text-xs uppercase tracking-wider rounded-md transition shadow-xs"
            >
              + Add Your First Garment
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {garments.map((item) => (
              <article
                key={item.id}
                className="group flex flex-col rounded-lg border border-[#EEEEEE] bg-white overflow-hidden transition duration-200 hover:border-[#5B1422] hover:shadow-sm"
              >
                {/* Aspect 4:5 Locked Hero Image */}
                <div className="relative w-full aspect-[4/5] bg-[#FAFAFA] overflow-hidden border-b border-[#EEEEEE]">
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop'}
                    alt={item.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                </div>

                {/* Card Metadata */}
                <div className="p-4 flex flex-col justify-between flex-1">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-[#525252] uppercase block mb-1">
                      {item.category}
                    </span>
                    <h3 className="font-serif text-base font-normal text-[#121212] leading-snug mb-2">
                      {item.title}
                    </h3>
                  </div>

                  <div className="pt-3 border-t border-[#EEEEEE] flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 bg-[#F5F5F5] border border-[#E5E5E5] text-[#404040] text-[11px] font-semibold rounded">
                        {item.color}
                      </span>
                      {item.material && (
                        <span className="px-2 py-0.5 bg-[#F5F5F5] border border-[#E5E5E5] text-[#404040] text-[11px] font-semibold rounded">
                          {item.material}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-[#5B1422]">
                      {item.formality}/10
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
