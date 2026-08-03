import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { HeaderNav } from '@/components/HeaderNav';
import Link from 'next/link';

export default async function InventoryPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-white text-[#121212] font-sans">
      <HeaderNav userEmail={user?.email} />

      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Header Title */}
        <div className="mb-8 border-b border-[#EEEEEE] pb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-extrabold tracking-widest text-[#5B1422] uppercase">
                INVENTORY MANAGEMENT
              </span>
            </div>
            <h1 className="text-3xl font-serif font-normal text-[#121212]">
              Add New Garment
            </h1>
            <p className="text-xs text-[#525252] mt-1">
              Upload garment metadata to expand your personal editorial closet.
            </p>
          </div>

          <Link
            href="/closet"
            className="py-2 px-4 bg-white border border-[#EEEEEE] hover:border-[#5B1422] hover:text-[#5B1422] text-xs font-semibold uppercase tracking-wider rounded-md transition"
          >
            ← Back to Closet
          </Link>
        </div>

        {/* Form Container */}
        <div className="bg-white border border-[#EEEEEE] rounded-lg p-8 shadow-xs">
          <form className="space-y-6">
            {/* Garment Title */}
            <div>
              <label className="block text-xs font-bold text-[#121212] uppercase tracking-wider mb-1">
                Garment Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Italian Double-Breasted Wool Blazer"
                className="w-full px-1 py-2.5 bg-transparent border-b-1.5 border-[#D4D4D4] text-sm text-[#121212] focus:border-[#5B1422] focus:outline-none transition rounded-none"
              />
            </div>

            {/* Category Select & Color Input Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-[#121212] uppercase tracking-wider mb-1">
                  Category
                </label>
                <select className="w-full px-1 py-2.5 bg-transparent border-b-1.5 border-[#D4D4D4] text-sm text-[#121212] focus:border-[#5B1422] focus:outline-none transition rounded-none">
                  <option value="Tops">Tops & Shirts</option>
                  <option value="Bottoms">Bottoms & Trousers</option>
                  <option value="Outerwear">Outerwear & Jackets</option>
                  <option value="Footwear">Footwear & Shoes</option>
                  <option value="Accessories">Accessories & Leather</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#121212] uppercase tracking-wider mb-1">
                  Primary Color
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Oxblood / Navy / Charcoal"
                  className="w-full px-1 py-2.5 bg-transparent border-b-1.5 border-[#D4D4D4] text-sm text-[#121212] focus:border-[#5B1422] focus:outline-none transition rounded-none"
                />
              </div>
            </div>

            {/* Material & Formality Rating Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-[#121212] uppercase tracking-wider mb-1">
                  Material / Fabric
                </label>
                <input
                  type="text"
                  placeholder="e.g. 100% Virgin Wool / Silk"
                  className="w-full px-1 py-2.5 bg-transparent border-b-1.5 border-[#D4D4D4] text-sm text-[#121212] focus:border-[#5B1422] focus:outline-none transition rounded-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#121212] uppercase tracking-wider mb-1">
                  Formality Rating (1-10)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  defaultValue="8"
                  className="w-full px-1 py-2.5 bg-transparent border-b-1.5 border-[#D4D4D4] text-sm text-[#121212] focus:border-[#5B1422] focus:outline-none transition rounded-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex items-center justify-end gap-3">
              <Link
                href="/closet"
                className="py-3 px-6 bg-white border border-[#EEEEEE] text-xs font-semibold uppercase tracking-wider text-[#121212] rounded-md transition hover:bg-[#FAFAFA]"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="py-3 px-6 bg-[#5B1422] hover:bg-[#450F1A] text-white font-semibold text-xs uppercase tracking-wider rounded-md transition shadow-xs"
              >
                Save Garment to Closet
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
