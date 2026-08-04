'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { getGarmentPublicUrl } from '@/lib/supabase/get-public-url';

interface OutfitModalProps {
  userId?: string;
}

export type OccasionType = 'Casual' | 'Work' | 'Formal' | 'Night Out';
export type WeatherType = 'Hot' | 'Mild' | 'Cold' | 'Rainy';

export function OutfitModal({ userId }: OutfitModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [occasion, setOccasion] = useState<OccasionType>('Casual');
  const [weather, setWeather] = useState<WeatherType>('Mild');
  const [isLoading, setIsLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState<{ message: string; reason?: string } | null>(null);
  const [recommendation, setRecommendation] = useState<any | null>(null);

  const occasions: OccasionType[] = ['Casual', 'Work', 'Formal', 'Night Out'];
  const weatherOptions: WeatherType[] = ['Hot', 'Mild', 'Cold', 'Rainy'];

  const handleGenerate = async () => {
    setIsLoading(true);
    setErrorInfo(null);

    try {
      const response = await fetch('/api/generate-outfit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId || '11111111-1111-1111-1111-111111111111',
          occasion,
          weather,
        }),
      });

      const resData = await response.json();

      if (!response.ok || resData.success === false) {
        if (resData.reason === 'INSUFFICIENT_GARMENTS') {
          setErrorInfo({
            message: resData.message || 'You need at least 2 garments in your wardrobe to generate an outfit — add a top and bottom to get started.',
            reason: 'INSUFFICIENT_GARMENTS',
          });
        } else {
          setErrorInfo({
            message: resData.error || 'Failed to generate outfit. Please try again.',
          });
        }
        setRecommendation(null);
        return;
      }

      setRecommendation(resData.recommendation ?? null);
    } catch (err: any) {
      console.error('[OutfitModal] API error:', err);
      setErrorInfo({
        message: 'Failed to generate outfit. Please try again.',
      });
      setRecommendation(null);
    } finally {
      setIsLoading(false);
    }
  };

  // FUTURE PERSISTENCE HOOK:
  // When Save Outfit persistence is un-stubbed in a future pass, call `revalidatePath('/inventory')`
  // immediately after writing the saved outfit row into Supabase database to invalidate stale caches.

  const handleClose = () => {
    setIsOpen(false);
    setErrorInfo(null);
    setRecommendation(null);
    setIsLoading(false);
  };

  return (
    <>
      {/* Primary Dashboard CTA Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full sm:w-auto px-6 py-3 bg-[#4A121A] hover:bg-[#380D14] text-white text-xs font-semibold uppercase tracking-wider rounded-md shadow-sm transition-all duration-200 flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4A121A] focus:ring-offset-2"
      >
        <span>Generate Outfit for the Day</span>
      </button>

      {/* Lightweight Filter & Result Modal Shell */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-300">
          <div className="bg-white border border-[#EEEEEE] rounded-xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#EEEEEE] pb-4 mb-6">
              <div>
                <span className="text-[10px] font-extrabold tracking-widest text-[#4A121A] uppercase">
                  EDITORIAL STYLIST ENGINE
                </span>
                <h3 className="text-2xl font-serif font-normal text-[#121212]">
                  Curate Daily Ensemble
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="text-[#737373] hover:text-[#121212] px-2 py-1 text-xs font-semibold uppercase tracking-wider rounded hover:bg-[#F5F5F5] transition"
                aria-label="Close modal"
              >
                Close
              </button>
            </div>

            {/* Modal Content Shell */}
            <div className="overflow-y-auto flex-1 pr-1">
              {isLoading ? (
                /* Skeleton Loader Matching Outfit-Card Layout */
                <div className="space-y-6 animate-pulse">
                  <div className="bg-[#F5F5F5] h-5 w-56 rounded mb-2" />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((idx) => (
                      <div key={idx} className="border border-[#EEEEEE] rounded-lg p-3 bg-white space-y-3">
                        <div className="bg-[#EEEEEE] h-3 w-14 rounded" />
                        <div className="bg-[#F5F5F5] aspect-3/4 rounded-md w-full" />
                        <div className="bg-[#EEEEEE] h-4 w-full rounded" />
                        <div className="bg-[#EEEEEE] h-3 w-2/3 rounded" />
                      </div>
                    ))}
                  </div>
                  <div className="bg-[#FAF9F5] border border-[#E5E0D8] p-4 rounded-lg space-y-2">
                    <div className="bg-[#E5E0D8] h-4 w-40 rounded" />
                    <div className="bg-[#E5E0D8] h-3 w-full rounded" />
                    <div className="bg-[#E5E0D8] h-3 w-4/5 rounded" />
                  </div>
                </div>
              ) : errorInfo ? (
                /* Error State Message + Retry inside Modal Shell */
                <div className="p-6 bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg text-center space-y-4 my-4">
                  <p className="text-xs sm:text-sm font-medium text-[#991B1B] max-w-md mx-auto">
                    {errorInfo.message}
                  </p>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    {errorInfo.reason === 'INSUFFICIENT_GARMENTS' ? (
                      <button
                        type="button"
                        onClick={handleClose}
                        className="px-5 py-2 bg-[#4A121A] hover:bg-[#380D14] text-white text-xs font-semibold uppercase tracking-wider rounded-md transition"
                      >
                        Add Garments to Wardrobe
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setErrorInfo(null)}
                          className="px-4 py-2 border border-[#CCCCCC] text-[#525252] hover:text-[#121212] text-xs font-semibold uppercase tracking-wider rounded-md transition"
                        >
                          Change Filters
                        </button>
                        <button
                          type="button"
                          onClick={handleGenerate}
                          className="px-5 py-2 bg-[#4A121A] hover:bg-[#380D14] text-white text-xs font-semibold uppercase tracking-wider rounded-md transition"
                        >
                          Retry Generation
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ) : recommendation ? (
                /* Curated Outfit View */
                <div className="space-y-6">
                  {/* Outfit Title Heading */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EEEEEE] pb-3">
                    <h3 className="text-xl font-serif font-medium text-[#121212]">
                      {recommendation?.outfit_title ?? `${occasion} ${weather} Ensemble`}
                    </h3>
                    <span className="text-[11px] font-semibold text-[#525252] uppercase tracking-wider">
                      <strong className="text-[#4A121A]">{occasion}</strong> • <strong className="text-[#4A121A]">{weather} Weather</strong>
                    </span>
                  </div>

                  {/* Selected Garments Image Cards Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {(recommendation?.items ?? []).map((item: any, idx: number) => {
                      const imageSrc = getGarmentPublicUrl(item?.image_url, item?.image_path);
                      return (
                        <div
                          key={item?.id ?? idx}
                          className="border border-[#EEEEEE] rounded-lg p-3 bg-white flex flex-col justify-between hover:border-[#4A121A] transition shadow-2xs group"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider bg-[#F5F5F5] text-[#4A121A] rounded">
                                {item?.category ?? 'Piece'}
                              </span>
                              {item?.accessory_type && (
                                <span className="text-[9px] text-[#737373]">
                                  {item.accessory_type}
                                </span>
                              )}
                            </div>
                            <div className="relative aspect-3/4 w-full bg-[#FAF9F6] rounded-md overflow-hidden mb-2">
                              <img
                                src={imageSrc}
                                alt={item?.title ?? item?.category ?? 'Garment'}
                                loading="lazy"
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                              />
                            </div>
                            <h4 className="text-xs font-semibold text-[#121212] line-clamp-1">
                              {item?.title ?? item?.subcategory ?? item?.category ?? 'Curated Garment'}
                            </h4>
                            <p className="text-[11px] text-[#737373] line-clamp-1 mt-0.5">
                              {item?.primary_color ?? item?.color ?? 'Neutral'} {item?.material_guess ? `• ${item.material_guess}` : ''}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Styling Reason Body Text */}
                  {recommendation?.styling_reason && (
                    <div className="bg-[#FAF9F5] border border-[#E5E0D8] p-4 rounded-lg">
                      <h5 className="text-xs font-extrabold uppercase tracking-wider text-[#4A121A] mb-1">
                        Editorial Stylist Rationale
                      </h5>
                      <p className="text-xs text-[#404040] leading-relaxed font-serif italic">
                        "{recommendation.styling_reason}"
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Filter Controls Form */
                <div className="space-y-6">
                  {/* Occasion Selection */}
                  <div>
                    <label className="block text-xs font-extrabold tracking-wider uppercase text-[#121212] mb-2">
                      1. Select Occasion
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {occasions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setOccasion(opt)}
                          className={`py-2.5 px-3 text-xs font-semibold rounded-md border transition text-center ${
                            occasion === opt
                              ? 'bg-[#4A121A] text-white border-[#4A121A] shadow-xs'
                              : 'bg-white text-[#525252] border-[#EEEEEE] hover:border-[#4A121A]'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Weather Selection */}
                  <div>
                    <label className="block text-xs font-extrabold tracking-wider uppercase text-[#121212] mb-2">
                      2. Select Weather Conditions
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {weatherOptions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setWeather(opt)}
                          className={`py-2.5 px-3 text-xs font-semibold rounded-md border transition text-center ${
                            weather === opt
                              ? 'bg-[#4A121A] text-white border-[#4A121A] shadow-xs'
                              : 'bg-white text-[#525252] border-[#EEEEEE] hover:border-[#4A121A]'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="border-t border-[#EEEEEE] pt-4 mt-6 flex items-center justify-between gap-3">
              {recommendation ? (
                <>
                  <div className="flex items-center gap-2">
                    {/* Shuffle Action Button */}
                    <button
                      type="button"
                      onClick={handleGenerate}
                      disabled={isLoading}
                      className="px-4 py-2 bg-white border border-[#4A121A] text-[#4A121A] hover:bg-[#FAF5F6] text-xs font-semibold uppercase tracking-wider rounded-md transition flex items-center justify-center"
                    >
                      <span>Shuffle</span>
                    </button>

                    {/* Disabled Stubbed Save Outfit Button */}
                    <button
                      type="button"
                      disabled
                      title="Save Outfit (Coming Soon)"
                      className="px-4 py-2 bg-[#F5F5F5] border border-[#E5E5E5] text-[#A3A3A3] text-xs font-semibold uppercase tracking-wider rounded-md cursor-not-allowed opacity-70 flex items-center justify-center"
                    >
                      <span>Save Outfit (Soon)</span>
                    </button>
                  </div>

                  {/* Close Button */}
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-5 py-2 bg-[#121212] hover:bg-[#333333] text-white text-xs font-semibold uppercase tracking-wider rounded-md transition"
                  >
                    Close
                  </button>
                </>
              ) : (
                <div className="flex items-center justify-end gap-3 w-full">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#525252] hover:text-[#121212] transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="px-6 py-2.5 bg-[#4A121A] hover:bg-[#380D14] text-white text-xs font-semibold uppercase tracking-wider rounded-md transition shadow-xs"
                  >
                    Generate Outfit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
