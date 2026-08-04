'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { GarmentUploader } from '@/components/garment-uploader';
import { archiveGarment } from '@/app/actions/archive-garment';
import { Garment } from '@/types/garment';

interface WardrobeArchiveViewProps {
  initialGarments: Garment[];
  userId?: string;
}

export function WardrobeArchiveView({ initialGarments, userId }: WardrobeArchiveViewProps) {
  const [garments, setGarments] = useState<Garment[]>(initialGarments || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSeason, setSelectedSeason] = useState<string>('All');
  const [showUploader, setShowUploader] = useState(false);
  const [archivingId, setArchivingId] = useState<string | null>(null);

  // Compute Wardrobe Statistics
  const totalItems = garments.length;
  const topsCount = garments.filter((g) => g.category === 'Top').length;
  const bottomsCount = garments.filter((g) => g.category === 'Bottom').length;
  const footwearCount = garments.filter((g) => g.category === 'Footwear').length;
  const outerwearCount = garments.filter((g) => g.category === 'Outerwear').length;
  const accessoriesCount = garments.filter((g) => g.category === 'Accessory').length;

  const categories = ['All', 'Top', 'Bottom', 'Dress', 'Outerwear', 'Footwear', 'Accessory'];
  const seasons = ['All', 'Spring', 'Summer', 'Fall', 'Winter'];

  // Handle Archiving / Deleting Garment
  const handleArchive = async (garmentId: string) => {
    if (!confirm('Are you sure you want to archive this garment?')) return;

    setArchivingId(garmentId);
    try {
      const res = await archiveGarment(garmentId);
      if (res.success) {
        setGarments((prev) => prev.filter((g) => g.id !== garmentId));
      } else {
        alert(res.error || 'Failed to archive garment.');
      }
    } catch (err) {
      console.error('[handleArchive Error]:', err);
      alert('An unexpected error occurred while archiving.');
    } finally {
      setArchivingId(null);
    }
  };

  // Filter Logic
  const filteredGarments = garments.filter((garment) => {
    // Category filter
    if (selectedCategory !== 'All' && garment.category !== selectedCategory) {
      return false;
    }

    // Season filter
    if (selectedSeason !== 'All') {
      const itemSeasons = Array.isArray(garment.season)
        ? garment.season
        : (garment.season ? [garment.season] : []);
      if (!itemSeasons.includes(selectedSeason)) {
        return false;
      }
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = (garment.title || '').toLowerCase().includes(q);
      const colorMatch = (garment.primary_color || garment.color || '').toLowerCase().includes(q);
      const categoryMatch = (garment.category || '').toLowerCase().includes(q);
      const subcategoryMatch = (garment.subcategory || '').toLowerCase().includes(q);
      const materialMatch = (garment.material_guess || garment.material || '').toLowerCase().includes(q);

      if (!titleMatch && !colorMatch && !categoryMatch && !subcategoryMatch && !materialMatch) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-8">
      {/* 1. Header & Wardrobe Statistics Panel */}
      <div className="bg-[#FAF9F6] border border-[#EEEEEE] rounded-xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-6 mb-6">
          <div>
            <span className="text-[10px] font-extrabold tracking-widest text-[#4A121A] uppercase">
              WARDROBE INVENTORY
            </span>
            <h1 className="text-3xl font-serif font-normal text-[#121212] mt-0.5">
              Wardrobe Archive
            </h1>
            <p className="text-xs text-[#525252] mt-1">
              Curate, organize, and manage your digitized clothing collection.
            </p>
          </div>

          <button
            onClick={() => setShowUploader(!showUploader)}
            className="px-6 py-3 bg-[#4A121A] hover:bg-[#380D14] text-white text-xs font-semibold uppercase tracking-wider rounded-md transition shadow-xs flex items-center justify-center"
          >
            <span>{showUploader ? 'Close Form' : 'ADD ITEM'}</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-[#EEEEEE] p-4 rounded-lg">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#737373] block mb-1">
              Total Garments
            </span>
            <span className="text-2xl font-serif text-[#121212] font-semibold">
              {totalItems} <span className="text-xs font-sans text-[#737373] font-normal">items</span>
            </span>
          </div>

          <div className="bg-white border border-[#EEEEEE] p-4 rounded-lg">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#737373] block mb-1">
              Tops / Bottoms
            </span>
            <span className="text-2xl font-serif text-[#121212] font-semibold">
              {topsCount} <span className="text-xs font-serif text-[#737373] font-normal">: {bottomsCount}</span>
            </span>
          </div>

          <div className="bg-white border border-[#EEEEEE] p-4 rounded-lg">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#737373] block mb-1">
              Footwear
            </span>
            <span className="text-2xl font-serif text-[#121212] font-semibold">
              {footwearCount} <span className="text-xs font-sans text-[#737373] font-normal">pairs</span>
            </span>
          </div>

          <div className="bg-white border border-[#EEEEEE] p-4 rounded-lg">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#737373] block mb-1">
              Outerwear / Accessories
            </span>
            <span className="text-2xl font-serif text-[#121212] font-semibold">
              {outerwearCount} <span className="text-xs font-serif text-[#737373] font-normal">/ {accessoriesCount}</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Upload Section (Toggleable GarmentUploader) */}
      {showUploader && (
        <div className="bg-white border border-[#EEEEEE] rounded-xl p-6 sm:p-8 shadow-xs animate-in fade-in duration-200">
          <h2 className="text-xl font-serif font-normal text-[#121212] mb-4">
            Upload & AI Vision Auto-Tagging
          </h2>
          <GarmentUploader userId={userId} />
        </div>
      )}

      {/* 3. Search & Category / Season Filters Bar */}
      <div className="bg-white border border-[#EEEEEE] rounded-xl p-4 sm:p-6 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search garments by name, color, material..."
              className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#EEEEEE] rounded-md text-xs text-[#121212] focus:outline-none focus:border-[#4A121A] transition"
            />
          </div>

          {/* Season Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            <span className="text-[10px] font-extrabold uppercase text-[#737373] tracking-wider mr-1">
              Season:
            </span>
            {seasons.map((season) => (
              <button
                key={season}
                onClick={() => setSelectedSeason(season)}
                className={`py-1 px-3 text-[11px] font-semibold rounded-full border transition whitespace-nowrap ${
                  selectedSeason === season
                    ? 'bg-[#4A121A] text-white border-[#4A121A]'
                    : 'bg-white text-[#525252] border-[#EEEEEE] hover:border-[#4A121A]'
                }`}
              >
                {season}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto border-t border-[#EEEEEE] pt-3">
          <span className="text-[10px] font-extrabold uppercase text-[#737373] tracking-wider mr-1">
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`py-1.5 px-3.5 text-xs font-semibold rounded-md transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#121212] text-white'
                  : 'bg-[#FAFAFA] text-[#525252] hover:bg-[#EEEEEE]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Responsive Garments Grid View */}
      {filteredGarments.length === 0 ? (
        <div className="border border-dashed border-[#CCCCCC] rounded-xl p-12 text-center bg-[#FAFAFA]">
          <h3 className="text-base font-serif text-[#121212] font-semibold mb-1">
            No Garments Found
          </h3>
          <p className="text-xs text-[#525252] max-w-sm mx-auto mb-4">
            {garments.length === 0
              ? 'Your wardrobe archive is currently empty. Click "ADD ITEM" above to start uploading clothing photos.'
              : 'No garments matched your current filter criteria. Try adjusting your search query or filters.'}
          </p>
          {garments.length === 0 && (
            <button
              onClick={() => setShowUploader(true)}
              className="px-5 py-2 bg-[#4A121A] text-white text-xs font-semibold uppercase tracking-wider rounded-md transition"
            >
              Upload First Item
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredGarments.map((garment, idx) => {
            const imageUrl = garment?.image_url || '/placeholder.png';
            const title = garment?.title || garment?.subcategory || garment?.category || 'Curated Garment';
            const category = garment?.category || 'Uncategorized';
            const color = garment?.primary_color || garment?.color || 'Neutral';
            const formality = typeof garment?.formality === 'number' ? garment.formality : null;

            return (
              <article
                key={garment?.id || idx}
                className="group border border-[#EEEEEE] rounded-lg bg-white overflow-hidden flex flex-col justify-between hover:border-[#4A121A] transition-all duration-200 shadow-2xs"
              >
                <div>
                  {/* Image Container with Safe Fallback */}
                  <div className="relative aspect-3/4 w-full bg-[#FAF9F6] overflow-hidden border-b border-[#EEEEEE]">
                    <Image
                      src={imageUrl}
                      alt={title}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-300"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider bg-white/90 text-[#4A121A] rounded shadow-2xs backdrop-blur-xs">
                      {category}
                    </span>
                    {formality !== null && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider bg-[#121212]/80 text-white rounded backdrop-blur-xs">
                        {formality}/10
                      </span>
                    )}
                  </div>

                  {/* Card Content Details */}
                  <div className="p-3">
                    <h4 className="text-xs font-semibold text-[#121212] line-clamp-1">
                      {title}
                    </h4>
                    <p className="text-[11px] text-[#737373] line-clamp-1 mt-0.5">
                      {color} {garment?.material_guess ? `• ${garment.material_guess}` : ''}
                    </p>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-3 pt-0 flex items-center justify-between border-t border-[#FAFAFA] mt-2">
                  <span className="text-[10px] text-[#A3A3A3]">
                    {Array.isArray(garment?.season) ? garment.season.join(', ') : 'All Seasons'}
                  </span>
                  <button
                    onClick={() => handleArchive(garment.id)}
                    disabled={archivingId === garment.id}
                    className="text-[10px] font-semibold text-red-600 hover:text-red-800 hover:underline transition disabled:opacity-50"
                  >
                    {archivingId === garment.id ? 'Archiving...' : 'Archive'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
