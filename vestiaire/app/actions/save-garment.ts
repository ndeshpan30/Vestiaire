'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { GarmentInsert, Garment, SaveGarmentInput, SaveGarmentResult, SaveGarmentError } from '@/types/garment';

/**
 * Server Action: Inserts a validated garment into public.garments.
 * Uses generated GarmentInsert type to guarantee type safety against the live database schema.
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

    const resolvedUserId = authUser?.id || (isValidUuid(inputUserId) ? inputUserId : '11111111-1111-1111-1111-111111111111');

    console.log(`[saveGarment] Target Table: 'garments' | User ID: ${resolvedUserId} | Auth Email: ${authUser?.email || 'unauthenticated/demo'}`);

    const isAccessory = analysis.category === 'Accessory';

    const constructedTitle = analysis.subcategory
      ? `${analysis.primary_color || ''} ${analysis.subcategory}`.trim()
      : `${analysis.primary_color || ''} ${analysis.category}`.trim();

    // Format taxonomy_path safely for both scalar TEXT and TEXT[] DB definitions
    const taxonomyPathValue = typeof analysis.taxonomy_path === 'string'
      ? [analysis.taxonomy_path]
      : (Array.isArray(analysis.taxonomy_path) ? analysis.taxonomy_path : null);

    // Strictly typed insert payload adhering to live database schema
    const garmentPayload: GarmentInsert = {
      user_id: resolvedUserId,
      image_url: imageUrl,
      title: constructedTitle || 'Curated Garment',
      category: analysis.category,
      color: analysis.primary_color || 'Neutral',
      secondary_color: Array.isArray(analysis.secondary_colors) ? (analysis.secondary_colors.join(', ') || 'None') : 'None',
      material: analysis.material_guess || 'Cotton',
      subcategory: analysis.subcategory || null,
      taxonomy_path: taxonomyPathValue as any,
      primary_color: analysis.primary_color || null,
      secondary_colors: analysis.secondary_colors || [],
      pattern: analysis.pattern || null,
      material_guess: analysis.material_guess || null,
      warmth: analysis.warmth ?? null,
      formality: analysis.formality ?? null,
      season: analysis.season || [],
      vibe_tags: analysis.vibe_tags || [],
      // Explicitly null out accessory fields when category is not 'Accessory'
      accessory_type: isAccessory ? (analysis.accessory_type || null) : null,
      metal_tone: isAccessory ? (analysis.metal_tone || null) : null,
      delicacy: isAccessory ? (analysis.delicacy ?? null) : null,
    };

    const { data, error } = await supabase
      .from('garments')
      .insert(garmentPayload as any)
      .select()
      .single();

    if (error) {
      console.error('[saveGarment Postgres Error]:', error.code, error.message, error.details);
      throw new SaveGarmentError(`[${error.code}] ${error.message}`, error);
    }

    if (!data) {
      throw new SaveGarmentError('Garment inserted successfully but no row data was returned.');
    }

    console.log('[saveGarment Success]: Inserted garment ID:', (data as any)?.id);

    // Revalidate catalog & closet routes immediately after inserting the new garment row
    try {
      revalidatePath('/closet');
      revalidatePath('/catalog');
      revalidatePath('/inventory');
    } catch {
      // Ignored outside Next.js HTTP request scope
    }

    return { success: true, data: data as Garment };
  } catch (err: any) {
    const errorMsg = err instanceof SaveGarmentError ? err.message : err?.message || String(err);
    console.error('[saveGarment Failed]:', errorMsg);
    return { success: false, error: errorMsg };
  }
}
