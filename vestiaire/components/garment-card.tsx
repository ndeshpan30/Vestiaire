'use client';

import React from 'react';
import { Garment } from '@/types/garment';
import { getGarmentPublicUrl } from '@/lib/supabase/get-public-url';

interface GarmentCardProps {
  garment: Garment;
  onArchive?: (id: string) => void;
  isArchiving?: boolean;
}

export function GarmentCard({ garment, onArchive, isArchiving }: GarmentCardProps) {
  // Resolve full public URL using Supabase storage public URL helper if relative path
  const imageUrl = getGarmentPublicUrl(garment?.image_url, garment?.image_path);
  const title = garment?.title || garment?.subcategory || garment?.category || 'Curated Garment';
  const category = garment?.category || 'Uncategorized';
  const color = garment?.primary_color || garment?.color || 'White';
  const material = garment?.material_guess || garment?.material || 'Cotton';
  const formality = typeof garment?.formality === 'number' ? garment.formality : null;
  const seasons = Array.isArray(garment?.season) ? garment.season.join(', ') : (garment?.season || 'All Seasons');

  return (
    <article className="group border border-[#EEEEEE] rounded-lg bg-white overflow-hidden flex flex-col justify-between hover:border-[#4A121A] transition-all duration-200 shadow-2xs">
      <div>
        {/* Top: Aspect-Square Garment Image with Rounded Top Corners */}
        <div className="relative aspect-square w-full bg-[#FAF9F6] overflow-hidden rounded-t-lg border-b border-[#EEEEEE]">
          <img
            src={imageUrl}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover rounded-t-lg group-hover:scale-105 transition duration-300"
          />
          {/* Category Tag Overlay */}
          <span className="absolute top-2 left-2 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider bg-white/90 text-[#4A121A] rounded shadow-2xs backdrop-blur-xs">
            {category}
          </span>
          {formality !== null && (
            <span className="absolute top-2 right-2 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider bg-[#121212]/80 text-white rounded backdrop-blur-xs">
              {formality}/10
            </span>
          )}
        </div>

        {/* Bottom: Garment Details (Title, Subtitle, Tags, Archive Button) */}
        <div className="p-3.5 space-y-1">
          <h4 className="text-xs font-semibold text-[#121212] line-clamp-1">
            {title}
          </h4>
          <p className="text-[11px] text-[#737373] line-clamp-1">
            {color} • {material}
          </p>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="p-3.5 pt-0 flex items-center justify-between border-t border-[#FAFAFA] mt-2">
        <span className="text-[10px] text-[#A3A3A3] truncate max-w-[110px]">
          {seasons}
        </span>
        {onArchive && (
          <button
            onClick={() => onArchive(garment.id)}
            disabled={isArchiving}
            className="text-[10px] font-semibold text-red-600 hover:text-red-800 hover:underline transition disabled:opacity-50"
          >
            {isArchiving ? 'Archiving...' : 'Archive'}
          </button>
        )}
      </div>
    </article>
  );
}
