import { createClient } from '@/utils/supabase/client';

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
 * RLS STORAGE POLICY FLAG & CHECKLIST:
 * Ensure the `garment-images` bucket is created in Supabase Dashboard (Storage -> New Bucket -> 'garment-images', Public=true).
 * 
 * Ensure the following RLS Policies are applied on `storage.objects`:
 * 
 * 1. INSERT (Upload):
 *    CREATE POLICY "Users can upload to their own folder in garment-images" ON storage.objects
 *    FOR INSERT WITH CHECK (
 *        bucket_id = 'garment-images' AND auth.uid()::text = (storage.foldername(name))[1]
 *    );
 * 
 * 2. SELECT (Read):
 *    CREATE POLICY "Public read access for garment-images" ON storage.objects
 *    FOR SELECT USING (bucket_id = 'garment-images');
 * 
 * 3. DELETE (Remove):
 *    CREATE POLICY "Users can delete from their own folder in garment-images" ON storage.objects
 *    FOR DELETE USING (
 *        bucket_id = 'garment-images' AND auth.uid()::text = (storage.foldername(name))[1]
 *    );
 */

/**
 * Uploads a garment image file to the Supabase Storage bucket `garment-images`.
 * Path convention: ${userId}/${crypto.randomUUID()}-${sanitizedFileName}
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

    // Sanitize file name (remove special characters and spaces)
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
    const uuid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const storagePath = `${userId}/${uuid}-${sanitizedFileName}`;

    const bucketName = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'garment-images';

    // Upload to Supabase Storage bucket explicitly named `garment-images` with upsert: true
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: true, // Allow overwriting to prevent 400 duplicate file errors
        contentType: file.type || 'image/jpeg',
      });

    if (error) {
      console.error('Supabase Storage Error:', error.message);
      throw new UploadError(`Supabase Storage upload rejected: ${error.message}`, error);
    }

    if (!data?.path) {
      throw new UploadError('Upload succeeded but no storage path was returned.');
    }

    // Retrieve public URL for storage object
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

