'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface StylingSuiteViewProps {
  initialGarmentCount: number;
  userId?: string;
}

export type OccasionOption = 'Casual' | 'Work' | 'Business Formal' | 'Evening' | 'Streetwear' | 'Night Out';
export type WeatherOption = 'Hot and Sunny' | 'Mild' | 'Cold and Layered' | 'Rainy';

export function StylingSuiteView({ initialGarmentCount, userId }: StylingSuiteViewProps) {
  const [occasion, setOccasion] = useState<OccasionOption>('Casual');
  const [weather, setWeather] = useState<WeatherOption>('Mild');
  const [isLoading, setIsLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState<{ message: string; reason?: string } | null>(null);
  const [recommendation, setRecommendation] = useState<any | null>(null);

  const occasions: OccasionOption[] = ['Casual', 'Work', 'Business Formal', 'Evening', 'Streetwear', 'Night Out'];
  const weatherOptions: WeatherOption[] = ['Hot and Sunny', 'Mild', 'Cold and Layered', 'Rainy'];

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
            message: resData.message || 'You need at least 2 wardrobe items to generate an outfit. Head over to the Wardrobe Archive tab to upload items.',
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

      setRecommendation(resData.recommendation);
    } catch (err: any) {
      console.error('[StylingSuiteView] Generation API error:', err);
      setErrorInfo({
        message: 'Failed to generate outfit. Please try again.',
      });
      setRecommendation(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Hero Header */}
      <div className="bg-gradient-to-r from-[#FAF9F5] to-[#F5F0EB] border border-[#E5E0D8] rounded-xl p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-extrabold tracking-widest text-[#4A121A] uppercase">
            EDITORIAL STYLIST ENGINE
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#121212]">
          AI Wardrobe Curator and Daily Stylist
        </h1>
        <p className="text-xs sm:text-sm text-[#525252] mt-2 max-w-2xl leading-relaxed">
          Intelligently ensemble your personal clothing archive powered by Gemini AI vision intelligence. Select your current occasion and weather constraints below.
        </p>
      </div>

      {/* 2. Generation Controls Card */}
      <div className="bg-white border border-[#EEEEEE] rounded-xl p-6 sm:p-8 space-y-6 shadow-xs">
        <h2 className="text-lg font-serif font-medium text-[#121212] border-b border-[#EEEEEE] pb-3">
          Styling Directives & Environment Constraints
        </h2>

        <div className="space-y-6">
          {/* Occasion Selector */}
          <div>
            <label className="block text-xs font-extrabold tracking-wider uppercase text-[#121212] mb-2">
              Select Occasion
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
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

          {/* Weather / Vibe Input */}
          <div>
            <label className="block text-xs font-extrabold tracking-wider uppercase text-[#121212] mb-2">
              Select Weather / Climate Vibe
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

        {/* Primary CTA Button */}
        <div className="border-t border-[#EEEEEE] pt-6 flex justify-end">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#4A121A] hover:bg-[#380D14] text-white text-xs font-semibold uppercase tracking-wider rounded-md shadow-md transition-all duration-200 flex items-center justify-center cursor-pointer disabled:opacity-50"
          >
            <span>Generate Outfit for the Day</span>
          </button>
        </div>
      </div>

      {/* 3. Outfit Display Canvas */}
      <div className="bg-white border border-[#EEEEEE] rounded-xl p-6 sm:p-8 shadow-xs">
        {isLoading ? (
          /* Polished Loading Skeleton */
          <div className="space-y-6 animate-pulse">
            <div className="flex items-center justify-between border-b border-[#EEEEEE] pb-4">
              <div className="bg-[#F5F5F5] h-6 w-64 rounded" />
              <div className="bg-[#F5F5F5] h-4 w-32 rounded" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((idx) => (
                <div key={idx} className="border border-[#EEEEEE] rounded-lg p-3 bg-white space-y-3">
                  <div className="bg-[#EEEEEE] h-3 w-16 rounded" />
                  <div className="bg-[#F5F5F5] aspect-3/4 rounded-md w-full" />
                  <div className="bg-[#EEEEEE] h-4 w-full rounded" />
                  <div className="bg-[#EEEEEE] h-3 w-2/3 rounded" />
                </div>
              ))}
            </div>
            <div className="bg-[#FAF9F5] border border-[#E5E0D8] p-4 rounded-lg space-y-2">
              <div className="bg-[#E5E0D8] h-4 w-44 rounded" />
              <div className="bg-[#E5E0D8] h-3 w-full rounded" />
              <div className="bg-[#E5E0D8] h-3 w-4/5 rounded" />
            </div>
          </div>
        ) : initialGarmentCount < 2 || (errorInfo && errorInfo.reason === 'INSUFFICIENT_GARMENTS') ? (
          /* Edge Case Empty State (< 2 Garments) */
          <div className="border border-dashed border-[#CCCCCC] rounded-xl p-12 text-center bg-[#FAFAFA] space-y-4">
            <h3 className="text-lg font-serif font-medium text-[#121212]">
              Insufficient Wardrobe Items
            </h3>
            <p className="text-xs sm:text-sm text-[#525252] max-w-md mx-auto leading-relaxed">
              You need at least 2 wardrobe items to generate an outfit. Head over to the Wardrobe Archive tab to upload items.
            </p>
            <Link
              href="/inventory"
              className="inline-block px-6 py-2.5 bg-[#4A121A] hover:bg-[#380D14] text-white text-xs font-semibold uppercase tracking-wider rounded-md transition shadow-xs"
            >
              Go to Wardrobe Archive
            </Link>
          </div>
        ) : errorInfo ? (
          /* General Error State */
          <div className="p-6 bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg text-center space-y-4">
            <p className="text-xs sm:text-sm font-medium text-[#991B1B] max-w-md mx-auto">
              {errorInfo.message}
            </p>
            <button
              type="button"
              onClick={handleGenerate}
              className="px-6 py-2.5 bg-[#4A121A] text-white text-xs font-semibold uppercase tracking-wider rounded-md transition"
            >
              Retry Generation
            </button>
          </div>
        ) : recommendation ? (
          /* Rendered Outfit Result */
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header & Shuffle CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EEEEEE] pb-4">
              <div>
                <span className="text-[10px] font-extrabold tracking-widest text-[#4A121A] uppercase">
                  RECOMMENDED LOOK
                </span>
                <h3 className="text-2xl font-serif font-medium text-[#121212] mt-0.5">
                  {recommendation.outfit_title || `${occasion} Ensemble`}
                </h3>
                <p className="text-xs text-[#737373] mt-0.5">
                  Tailored for <strong className="text-[#121212]">{occasion}</strong> in <strong className="text-[#121212]">{weather}</strong> weather.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={isLoading}
                className="px-5 py-2.5 bg-white border border-[#4A121A] text-[#4A121A] hover:bg-[#FAF5F6] text-xs font-semibold uppercase tracking-wider rounded-md transition flex items-center justify-center shadow-2xs"
              >
                <span>Shuffle / Re-generate</span>
              </button>
            </div>

            {/* Side-by-Side Selected Garment Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {(recommendation.items || []).map((item: any, idx: number) => {
                const imageUrl = item?.image_url || '/placeholder.png';
                const title = item?.title || item?.subcategory || item?.category || 'Curated Piece';
                const category = item?.category || 'Piece';
                const color = item?.primary_color || item?.color || 'Neutral';

                return (
                  <div
                    key={item?.id || idx}
                    className="border border-[#EEEEEE] rounded-lg p-3 bg-white flex flex-col justify-between hover:border-[#4A121A] transition shadow-2xs group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider bg-[#F5F5F5] text-[#4A121A] rounded">
                          {category}
                        </span>
                        {item?.accessory_type && (
                          <span className="text-[9px] text-[#737373]">
                            {item.accessory_type}
                          </span>
                        )}
                      </div>

                      <div className="relative aspect-3/4 w-full bg-[#FAF9F6] rounded-md overflow-hidden mb-2">
                        <Image
                          src={imageUrl}
                          alt={title}
                          fill
                          className="object-cover group-hover:scale-105 transition duration-300"
                        />
                      </div>

                      <h4 className="text-xs font-semibold text-[#121212] line-clamp-1">
                        {title}
                      </h4>
                      <p className="text-[11px] text-[#737373] line-clamp-1 mt-0.5">
                        {color} {item?.material_guess ? `• ${item.material_guess}` : ''}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Styling Reason Blurb */}
            {recommendation.styling_reason && (
              <div className="bg-[#FAF9F5] border border-[#E5E0D8] p-5 rounded-lg">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#4A121A] mb-1.5">
                  Editorial Stylist Rationale
                </h4>
                <p className="text-xs sm:text-sm text-[#404040] leading-relaxed font-serif italic">
                  "{recommendation.styling_reason}"
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Initial Ready State */
          <div className="text-center py-12 text-[#737373]">
            <p className="text-xs sm:text-sm">
              Select your occasion and weather directives above, then click <strong>"Generate Outfit for the Day"</strong> to curate your look.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
