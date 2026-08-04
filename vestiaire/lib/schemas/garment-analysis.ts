import { z } from 'zod';

/**
 * SINGLE SOURCE OF TRUTH ZOD SCHEMA FOR GEMINI VISION METADATA
 * 
 * NOTE: If this Zod schema changes, the Gemini responseSchema in app/api/analyze-garment/route.ts
 * MUST be updated in lockstep to keep AI structured output and runtime validation synchronized.
 */
export const garmentAnalysisSchema = z.object({
  category: z.enum(['Top', 'Bottom', 'Dress', 'Outerwear', 'Footwear', 'Accessory']),
  subcategory: z.string().nullable().optional(),
  taxonomy_path: z.string().nullable().optional(),
  primary_color: z.string().nullable().optional(),
  secondary_colors: z.array(z.string()).default([]),
  pattern: z.enum(['Solid', 'Stripe', 'Check', 'Floral', 'Animal', 'Geometric', 'Abstract', 'PolkaDot', 'Camo']).nullable().optional(),
  material_guess: z.string().nullable().optional(),
  warmth: z.number().int().min(1).max(10).nullable().optional(),
  formality: z.number().int().min(1).max(10).nullable().optional(),
  season: z.array(z.enum(['Spring', 'Summer', 'Fall', 'Winter'])).default([]),
  vibe_tags: z.array(z.string()).default([]),
  accessory_type: z.enum(['Jewelry', 'Watch', 'Bag', 'Belt', 'Scarf', 'Hat', 'Layering']).nullable().optional(),
  metal_tone: z.enum(['Gold', 'Silver', 'RoseGold', 'Mixed', 'None']).nullable().optional(),
  delicacy: z.number().int().min(1).max(10).nullable().optional(),
});

export type GarmentAnalysis = z.infer<typeof garmentAnalysisSchema>;
