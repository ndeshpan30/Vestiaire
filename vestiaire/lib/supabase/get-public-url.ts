import { createClient } from '@/utils/supabase/client';

/**
 * Resolves full public image URL for a garment.
 * If imageUrl is already a full http/https URL, returns it directly.
 * If imageUrl or imagePath is a relative storage path (e.g. 'userId/file.jpg' or 'garment-images/userId/file.jpg'),
 * computes the Supabase public storage URL.
 */
export function getGarmentPublicUrl(imageUrl?: string | null, imagePath?: string | null): string {
  const target = imageUrl || imagePath;

  if (!target || target === '/placeholder.png') {
    return '/placeholder.png';
  }

  if (target.startsWith('http://') || target.startsWith('https://')) {
    return target;
  }

  let cleanPath = target.replace(/^\/+/, '');
  if (cleanPath.startsWith('garment-images/')) {
    cleanPath = cleanPath.replace(/^garment-images\//, '');
  }

  try {
    const supabase = createClient();
    const { data } = supabase.storage.from('garment-images').getPublicUrl(cleanPath);
    return data?.publicUrl || `/placeholder.png`;
  } catch (err) {
    console.warn('[getGarmentPublicUrl] Error resolving public URL:', err);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hxojdmiqnzqdwhlhnnsm.supabase.co';
    return `${supabaseUrl}/storage/v1/object/public/garment-images/${cleanPath}`;
  }
}
