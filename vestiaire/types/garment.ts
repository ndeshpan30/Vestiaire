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

export interface SaveGarmentInput {
  userId: string;
  imagePath: string;
  imageUrl: string;
  analysis: GarmentAnalysis;
}

export class SaveGarmentError extends Error {
  constructor(message: string, public readonly originalError?: any) {
    super(message);
    this.name = 'SaveGarmentError';
  }
}
