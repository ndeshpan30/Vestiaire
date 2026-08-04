import { createClient } from '@/utils/supabase/client';
import { processAndCompressImage } from '@/lib/utils/image-processor';

export class UploadError extends Error {
  constructor(message: string, public readonly originalError?: any) {
    super(message);
    this.name = 'UploadError';
  }
}

/**
 * Storage Bucket Name for Garments with fallback default to 'garment-images'
 */
const BUCKET_NAME = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'garment-images';

/**
 * Uploads a garment image file to the Supabase Storage bucket `garment-images`.
 * Automatically compresses, resizes to max 1200px, converts to image/jpeg,
 * and generates a clean randomized filename.
 *
 * Path convention: ${userId}/${Date.now()}-${randomHash}.jpg
 *
 * @param file File object to upload
 * @param userId Authenticated user UUID
 * @returns Promise resolving to { path: string; publicUrl: string }
 * @throws UploadError on failure
 */
export async function uploadGarmentImage(
  file: File,
  userId: string
): Promise<{ path: string; publicUrl: string }> {
  if (!file) {
    throw new UploadError('No file provided for upload.');
  }

  if (!userId) {
    throw new UploadError('User authentication required for garment upload.');
  }

  try {
    const supabase = createClient();

    // 1. Process image client-side: resize to 1200px, compress to JPEG < 2MB, sanitize filename
    const processedFile = await processAndCompressImage(file);

    // 2. Generate clean randomized UUID filename (no spaces or special characters)
    const randomHash = Math.random().toString(36).substring(2, 9);
    const cleanFileName = `${Date.now()}-${randomHash}.jpg`;
    const storagePath = `${userId}/${cleanFileName}`;

    const bucketName = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'garment-images';

    // 3. Upload standardized JPEG file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(storagePath, processedFile, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'image/jpeg',
      });

    if (error) {
      console.error('Supabase Storage Error:', error.message);
      throw new UploadError(`Supabase Storage upload rejected: ${error.message}`, error);
    }

    if (!data?.path) {
      throw new UploadError('Upload succeeded but no storage path was returned.');
    }

    // 4. Retrieve public URL for storage object
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    if (!publicUrlData?.publicUrl) {
      throw new UploadError('Failed to generate public URL for uploaded garment image.');
    }

    return {
      path: data.path,
      publicUrl: publicUrlData.publicUrl,
    };
  } catch (err: any) {
    if (err instanceof UploadError) {
      throw err;
    }
    const errorMessage = err?.message || String(err);
    console.error('Supabase Storage Error:', errorMessage);
    throw new UploadError(`Unexpected error uploading garment image: ${errorMessage}`, err);
  }
}
