'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { Garment, SaveGarmentInput, SaveGarmentResult } from '@/types/garment';

/**
 * Server action: Inserts a new garment record into public.garments.
 * Returns a result object { success: true, data } or { success: false, error }
 * to prevent uncaught exceptions from crashing Server Components.
 *
 * @param input SaveGarmentInput containing storage info and AI vision analysis
 * @returns Promise<SaveGarmentResult>
 */
export async function saveGarment(input: SaveGarmentInput): Promise<SaveGarmentResult> {
  try {
    const { userId: inputUserId, imagePath, imageUrl, analysis } = input;

    if (!imagePath || !imageUrl) {
      return { success: false, error: 'Storage image path and public URL are required.' };
    }

    if (!analysis || !analysis.category) {
      return { success: false, error: 'Garment analysis payload is missing or invalid.' };
    }

    const supabase = createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    const isValidUuid = (id?: string) =>
      !!id && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);

    // Priority: 1. Active Supabase Auth user ID, 2. Valid input UUID, 3. Demo User UUID fallback
    const resolvedUserId = authUser?.id || (isValidUuid(inputUserId) ? inputUserId : '11111111-1111-1111-1111-111111111111');

    console.log(`[saveGarment] Target Table: 'garments' | User ID: ${resolvedUserId} | Auth Email: ${authUser?.email || 'unauthenticated/demo'}`);

    const isAccessory = analysis.category === 'Accessory';
    const constructedTitle = analysis.subcategory
      ? `${analysis.primary_color || ''} ${analysis.subcategory}`.trim()
      : `${analysis.primary_color || ''} ${analysis.category}`.trim();

    const garmentPayload: Record<string, any> = {
      user_id: resolvedUserId,
      title: constructedTitle || 'Curated Garment',
      category: analysis.category,
      color: analysis.primary_color || 'Neutral',
      secondary_color: Array.isArray(analysis.secondary_colors) ? (analysis.secondary_colors.join(', ') || 'None') : 'None',
      material: analysis.material_guess || 'Cotton',
      pattern: analysis.pattern || 'Solid',
      formality: typeof analysis.formality === 'number' ? analysis.formality : 5,
      season: Array.isArray(analysis.season) && analysis.season.length > 0 ? analysis.season : ['Spring', 'Summer', 'Fall', 'Winter'],
      image_url: imageUrl,
      image_path: imagePath,
      subcategory: analysis.subcategory || null,
      taxonomy_path: analysis.taxonomy_path || null,
      primary_color: analysis.primary_color || null,
      secondary_colors: analysis.secondary_colors || [],
      material_guess: analysis.material_guess || null,
      warmth: analysis.warmth ?? null,
      vibe_tags: analysis.vibe_tags || [],
      accessory_type: isAccessory ? analysis.accessory_type ?? null : null,
      metal_tone: isAccessory ? analysis.metal_tone ?? null : null,
      delicacy: isAccessory ? analysis.delicacy ?? null : null,
    };

    const { data, error } = await supabase
      .from('garments')
      .insert(garmentPayload)
      .select()
      .single();

    if (error) {
      console.error('[saveGarment DB Error]:', error.message, error.details, error.hint);
      return { success: false, error: `Supabase database insert failed: ${error.message}` };
    }

    if (!data) {
      console.error('[saveGarment DB Error]: No row data returned after insert.');
      return { success: false, error: 'Garment inserted successfully but no row data was returned.' };
    }

    console.log('[saveGarment DB Success]: Inserted garment row ID:', data.id);

    // Revalidate catalog & closet routes immediately after inserting the new garment row
    revalidatePath('/closet');
    revalidatePath('/catalog');
    revalidatePath('/inventory');

    return { success: true, data: data as Garment };
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    console.error('[saveGarment DB Error]:', errMsg, err?.details, err?.hint);
    return { success: false, error: `Unexpected error saving garment: ${errMsg}` };
  }
}
