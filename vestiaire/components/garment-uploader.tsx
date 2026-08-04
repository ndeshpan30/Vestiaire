'use client';

import React, { useState, useRef, useCallback } from 'react';
import { uploadGarmentImage, UploadError } from '@/lib/supabase/upload-garment-image';
import { saveGarment } from '@/app/actions/save-garment';
import { processAndCompressImage } from '@/lib/utils/image-processor';
import { Garment, GarmentAnalysis } from '@/types/garment';

export interface UploadQueueItem {
  id: string;
  file: File;
  previewUrl: string;
  compressedBlob: Blob | null;
  status: 'pending' | 'uploading' | 'analyzing' | 'saving' | 'done' | 'error';
  progress: number;
  errorMessage?: string;
  storagePath?: string;
  publicUrl?: string;
  garment?: Garment;
}

export interface GarmentUploaderProps {
  userId?: string;
  onUploaded?: (result: { path: string; publicUrl: string; file: File; garment?: Garment }) => void | Promise<void>;
  onBatchComplete?: (results: { path: string; publicUrl: string; file: File; garment?: Garment }[]) => void;
  onOptimisticAdd?: (garment: Garment) => void;
}

export function GarmentUploader({
  userId = '11111111-1111-1111-1111-111111111111',
  onUploaded,
  onBatchComplete,
  onOptimisticAdd,
}: GarmentUploaderProps) {
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingUploads, setIsProcessingUploads] = useState(false);
  const [announcement, setAnnouncement] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const processSelectedFiles = useCallback(async (files: FileList | File[]) => {
    const newItems: UploadQueueItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/') && !file.name.toLowerCase().endsWith('.heic') && !file.name.toLowerCase().endsWith('.heif')) {
        continue;
      }

      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const previewUrl = URL.createObjectURL(file);

      newItems.push({
        id,
        file,
        previewUrl,
        compressedBlob: null,
        status: 'pending',
        progress: 0,
      });
    }

    if (newItems.length === 0) return;

    setQueue((prev) => [...prev, ...newItems]);
    setAnnouncement(`${newItems.length} photo${newItems.length > 1 ? 's' : ''} added to upload queue.`);

    for (const item of newItems) {
      try {
        const compressed = await processAndCompressImage(item.file);
        setQueue((prev) =>
          prev.map((q) => (q.id === item.id ? { ...q, compressedBlob: compressed } : q))
        );
      } catch (err) {
        console.warn(`Compression fallback for ${item.file.name}:`, err);
        setQueue((prev) =>
          prev.map((q) => (q.id === item.id ? { ...q, compressedBlob: item.file } : q))
        );
      }
    }
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFiles(e.target.files);
      e.target.value = '';
    }
  };

  const removeItem = (id: string) => {
    setQueue((prev) => {
      const item = prev.find((q) => q.id === id);
      if (item) {
        URL.revokeObjectURL(item.previewUrl);
        setAnnouncement(`Removed ${item.file.name} from upload queue.`);
      }
      return prev.filter((q) => q.id !== id);
    });
  };

  const uploadSingleItem = async (
    item: UploadQueueItem
  ): Promise<{ path: string; publicUrl: string; file: File; garment?: Garment } | null> => {
    // 1. Storage Upload
    setQueue((prev) =>
      prev.map((q) => (q.id === item.id ? { ...q, status: 'uploading', progress: 30 } : q))
    );
    setAnnouncement(`Uploading ${item.file.name} to storage...`);

    try {
      const fileToUpload = (item.compressedBlob as File) || item.file;
      const { path, publicUrl } = await uploadGarmentImage(fileToUpload, userId);

      // 2. Gemini Vision Analysis
      setQueue((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, status: 'analyzing', progress: 65, storagePath: path, publicUrl } : q))
      );
      setAnnouncement(`Analyzing ${item.file.name} with Gemini 2.5 Vision...`);

      const analyzeResponse = await fetch('/api/analyze-garment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: publicUrl }),
      });

      if (!analyzeResponse.ok) {
        throw new Error(`AI Vision analysis failed with status ${analyzeResponse.status}`);
      }

      const analyzeResult = await analyzeResponse.json();
      const analysis: GarmentAnalysis = analyzeResult.analysis;

      // 3. Save Garment Record via Server Action
      setQueue((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, status: 'saving', progress: 85 } : q))
      );
      setAnnouncement(`Saving ${item.file.name} to database...`);

      let savedGarment: Garment | undefined;
      try {
        const saveRes = await saveGarment({
          userId,
          imagePath: path,
          imageUrl: publicUrl,
          analysis,
        });

        if (!saveRes.success) {
          console.error('[inventory] saveGarment failed:', saveRes.error);
          setQueue((prev) =>
            prev.map((q) =>
              q.id === item.id
                ? { ...q, status: 'error', progress: 0, errorMessage: saveRes.error }
                : q
            )
          );
          setAnnouncement(`Failed to save ${item.file.name}: ${saveRes.error}`);
          return null;
        }

        savedGarment = saveRes.data;

        if (savedGarment && onOptimisticAdd) {
          onOptimisticAdd(savedGarment);
        }
      } catch (saveErr: any) {
        const errMsg = saveErr?.message || String(saveErr);
        console.error('[inventory] saveGarment failed:', saveErr);
        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? { ...q, status: 'error', progress: 0, errorMessage: errMsg }
              : q
          )
        );
        setAnnouncement(`Failed to save ${item.file.name}: ${errMsg}`);
        return null;
      }

      setQueue((prev) =>
        prev.map((q) =>
          q.id === item.id
            ? { ...q, status: 'done', progress: 100, garment: savedGarment }
            : q
        )
      );
      setAnnouncement(`Successfully processed and saved ${item.file.name}.`);

      const result = { path, publicUrl, file: item.file, garment: savedGarment };

      if (onUploaded) {
        await onUploaded(result);
      }

      return result;
    } catch (err: any) {
      const errorMsg = err instanceof UploadError ? err.message : err?.message || 'Processing failed';
      console.error('[inventory] saveGarment failed:', err?.message || err);
      setQueue((prev) =>
        prev.map((q) =>
          q.id === item.id
            ? { ...q, status: 'error', progress: 0, errorMessage: errorMsg }
            : q
        )
      );
      setAnnouncement(`Failed to process ${item.file.name}.`);
      return null;
    }
  };

  const handleStartBatchUpload = async () => {
    setIsProcessingUploads(true);
    const pendingItems = queue.filter((q) => q.status === 'pending' || q.status === 'error');
    setAnnouncement(`Starting upload and AI vision processing for ${pendingItems.length} photos.`);

    const successfulResults: { path: string; publicUrl: string; file: File; garment?: Garment }[] = [];

    for (const item of pendingItems) {
      const res = await uploadSingleItem(item);
      if (res) successfulResults.push(res);
    }

    setIsProcessingUploads(false);
    setAnnouncement(`Batch processing complete. ${successfulResults.length} of ${pendingItems.length} photos added to closet.`);

    if (successfulResults.length > 0 && onBatchComplete) {
      onBatchComplete(successfulResults);
    }
  };

  return (
    <div className="w-full font-sans">
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
          isDragging
            ? 'border-[#4A121A] bg-red-50/50'
            : 'border-[#D4D4D4] hover:border-[#4A121A] bg-[#FAFAFA]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          capture="environment"
          onChange={handleFileChange}
          aria-label="Upload garment photo files"
          className="hidden"
        />

        <div className="w-12 h-12 rounded-full bg-white border border-[#EEEEEE] flex items-center justify-center mx-auto mb-3 text-[#4A121A]">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>

        <h3 className="font-serif text-lg text-[#18181B] font-normal mb-1">
          Upload Garment Photos
        </h3>
        <p className="text-xs text-[#71717A] max-w-xs mx-auto mb-3 leading-relaxed">
          Drag and drop images here, or click to browse. Supports large photos, HEIC, PNG, & WEBP.
        </p>

        <span className="inline-block py-2 px-4 bg-white border border-[#EEEEEE] text-[11px] font-bold text-[#18181B] uppercase tracking-wider rounded-md">
          Browse Files
        </span>
      </div>

      {queue.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-serif text-base font-normal text-[#18181B]">
              Selected Photos ({queue.length})
            </h4>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setQueue([]);
                  setAnnouncement('Cleared all photos from upload queue.');
                }}
                className="text-xs text-gray-500 hover:text-gray-900 underline cursor-pointer"
                aria-label="Clear all queued photos"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={handleStartBatchUpload}
                disabled={isProcessingUploads || !queue.some((q) => q.status === 'pending' || q.status === 'error')}
                className="py-2 px-5 bg-[#4A121A] hover:bg-[#380D14] disabled:opacity-50 text-white font-medium text-xs uppercase tracking-wider rounded-none transition cursor-pointer"
                aria-label="Confirm and start uploading selected photos"
              >
                {isProcessingUploads ? 'Processing Batch...' : 'Confirm & Process Garments'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {queue.map((item) => (
              <div
                key={item.id}
                className="relative group border border-gray-200 rounded-md overflow-hidden bg-white flex flex-col"
              >
                <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
                  <img
                    src={item.previewUrl}
                    alt={`Preview of ${item.file.name}`}
                    className="w-full h-full object-cover"
                  />

                  {item.status !== 'uploading' && item.status !== 'analyzing' && item.status !== 'saving' && (
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center text-xs transition cursor-pointer"
                      aria-label={`Remove ${item.file.name} from upload queue`}
                      title={`Remove ${item.file.name}`}
                    >
                      Close
                    </button>
                  )}

                  {(item.status === 'uploading' || item.status === 'analyzing' || item.status === 'saving') && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white p-2">
                      <svg className="w-5 h-5 animate-spin mb-1 text-white" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span className="text-[10px] font-bold">
                        {item.status === 'uploading' && 'Uploading...'}
                        {item.status === 'analyzing' && 'AI Tagging...'}
                        {item.status === 'saving' && 'Saving...'}
                      </span>
                    </div>
                  )}

                  {item.status === 'done' && (
                    <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-sm shadow-xs">
                      Saved
                    </div>
                  )}

                  {item.status === 'error' && (
                    <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded-sm shadow-xs" title={item.errorMessage}>
                      Failed
                    </div>
                  )}
                </div>

                <div className="w-full bg-gray-100 h-1.5">
                  <div
                    className={`h-full transition-all duration-300 ${
                      item.status === 'error'
                        ? 'bg-red-500'
                        : item.status === 'done'
                        ? 'bg-emerald-500'
                        : 'bg-[#4A121A]'
                    }`}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>

                <div className="p-2 text-[11px] text-gray-600 truncate flex items-center justify-between">
                  <span className="truncate" title={item.file.name}>{item.file.name}</span>
                  {item.compressedBlob && (
                    <span className="text-[9px] text-gray-400 font-mono ml-1 shrink-0">
                      {(item.compressedBlob.size / 1024).toFixed(0)}KB
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
