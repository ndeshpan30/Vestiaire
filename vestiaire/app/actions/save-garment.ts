'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { Garment, SaveGarmentInput, SaveGarmentError } from '@/types/garment';

/**
 * Server action: Inserts a new garment record into public.garments.
 * Enforces null values for accessory fields if category is not "Accessory".
 *
 * @param input SaveGarmentInput containing storage info and AI vision analysis
 * @returns Promise<Garment> inserted database row
 * @throws SaveGarmentError on failure
 */
export async function saveGarment(input: SaveGarmentInput): Promise<Garment> {
  const { userId: inputUserId, imagePath, imageUrl, analysis } = input;

  if (!imagePath || !imageUrl) {
    throw new SaveGarmentError('Storage image path and public URL are required.');
  }

  if (!analysis || !analysis.category) {
    throw new SaveGarmentError('Garment analysis payload is missing or invalid.');
  }

  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  const isValidUuid = (id?: string) =>
    !!id && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);

  // Priority: 1. Active Supabase Auth user ID, 2. Valid input UUID, 3. Demo User UUID fallback
  const resolvedUserId = authUser?.id || (isValidUuid(inputUserId) ? inputUserId : '11111111-1111-1111-1111-111111111111');

  console.log(`[saveGarment] Inserting new garment row into Supabase with user_id: ${resolvedUserId} (Auth session email: ${authUser?.email || 'unauthenticated/demo'})`);

  const isAccessory = analysis.category === 'Accessory';

  const garmentPayload = {
    user_id: resolvedUserId,
    image_path: imagePath,
    image_url: imageUrl,
    category: analysis.category,
    subcategory: analysis.subcategory || null,
    taxonomy_path: analysis.taxonomy_path || null,
    primary_color: analysis.primary_color || null,
    secondary_colors: analysis.secondary_colors || [],
    pattern: analysis.pattern || null,
    material_guess: analysis.material_guess || null,
    warmth: analysis.warmth ?? null,
    formality: analysis.formality ?? null,
    season: analysis.season || [],
    vibe_tags: analysis.vibe_tags || [],
    // Enforce null values if category is not "Accessory"
    accessory_type: isAccessory ? analysis.accessory_type ?? null : null,
    metal_tone: isAccessory ? analysis.metal_tone ?? null : null,
    delicacy: isAccessory ? analysis.delicacy ?? null : null,
  };

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('garments')
      .insert(garmentPayload)
      .select()
      .single();

    if (error) {
      throw new SaveGarmentError(`Supabase database insert failed: ${error.message}`, error);
    }

    if (!data) {
      throw new SaveGarmentError('Garment inserted successfully but no row data was returned.');
    }

    // Revalidate catalog & closet routes immediately after inserting the new garment row
    revalidatePath('/closet');
    revalidatePath('/catalog');
    revalidatePath('/inventory');

    return data as Garment;
  } catch (err: any) {
    if (err instanceof SaveGarmentError) {
      throw err;
    }
    throw new SaveGarmentError(`Unexpected error saving garment: ${err.message || err}`, err);
  }
}
