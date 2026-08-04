import { Database } from '@/lib/supabase/database.types';
import { GarmentAnalysis } from '@/lib/schemas/garment-analysis';

export type { GarmentAnalysis };

// Re-export generated database types (DO NOT hand-write or manually maintain properties here)
export type Garment = Database['public']['Tables']['garments']['Row'];
export type GarmentInsert = Database['public']['Tables']['garments']['Insert'];
export type GarmentUpdate = Database['public']['Tables']['garments']['Update'];

export interface SaveGarmentInput {
  userId: string;
  imagePath: string;
  imageUrl: string;
  analysis: GarmentAnalysis;
}

export type SaveGarmentResult =
  | { success: true; data: Garment }
  | { success: false; error: string };

export class SaveGarmentError extends Error {
  constructor(message: string, public readonly originalError?: any) {
    super(message);
    this.name = 'SaveGarmentError';
  }
}
