'use server';

import { createClient } from '@/utils/supabase/server';

export interface GarmentAnalysis {
  category: 'Top' | 'Bottom' | 'Dress' | 'Outerwear' | 'Footwear' | 'Accessory';
  subcategory: string;
  taxonomy_path: string;
  primary_color: string;
  secondary_colors: string[];
  pattern: 'Solid' | 'Stripe' | 'Check' | 'Floral' | 'Animal' | 'Geometric' | 'Abstract' | 'PolkaDot' | 'Camo';
  material_guess: string;
  warmth: number;
  formality: number;
  season: ('Spring' | 'Summer' | 'Fall' | 'Winter')[];
  vibe_tags: string[];
  accessory_type: 'Jewelry' | 'Watch' | 'Bag' | 'Belt' | 'Scarf' | 'Hat' | 'Layering' | null;
  metal_tone: 'Gold' | 'Silver' | 'RoseGold' | 'Mixed' | 'None' | null;
  delicacy: number | null;
}

export interface Garment {
  id: string;
  user_id: string;
  image_path: string;
  image_url: string;
  category: string;
  subcategory: string | null;
  taxonomy_path: string | null;
  primary_color: string | null;
  secondary_colors: string[] | null;
  pattern: string | null;
  material_guess: string | null;
  warmth: number | null;
  formality: number | null;
  season: string[] | null;
  vibe_tags: string[] | null;
  accessory_type: string | null;
  metal_tone: string | null;
  delicacy: number | null;
  wear_count: number;
  last_worn: string | null;
  created_at: string;
  updated_at: string;
}

export class SaveGarmentError extends Error {
  constructor(message: string, public readonly originalError?: any) {
    super(message);
    this.name = 'SaveGarmentError';
  }
}

export interface SaveGarmentInput {
  userId: string;
  imagePath: string;
  imageUrl: string;
  analysis: GarmentAnalysis;
}

/**
 * Server action: Inserts a new garment record into public.garments.
 * Enforces null values for accessory fields if category is not "Accessory".
 *
 * @param input SaveGarmentInput containing storage info and AI vision analysis
 * @returns Promise<Garment> inserted database row
 * @throws SaveGarmentError on failure
 */
export async function saveGarment(input: SaveGarmentInput): Promise<Garment> {
  const { userId, imagePath, imageUrl, analysis } = input;

  if (!userId) {
    throw new SaveGarmentError('User ID is required to save garment.');
  }

  if (!imagePath || !imageUrl) {
    throw new SaveGarmentError('Storage image path and public URL are required.');
  }

  if (!analysis || !analysis.category) {
    throw new SaveGarmentError('Garment analysis payload is missing or invalid.');
  }

  const isAccessory = analysis.category === 'Accessory';

  const garmentPayload = {
    user_id: userId,
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

    return data as Garment;
  } catch (err: any) {
    if (err instanceof SaveGarmentError) {
      throw err;
    }
    throw new SaveGarmentError(`Unexpected error saving garment: ${err.message || err}`, err);
  }
}
