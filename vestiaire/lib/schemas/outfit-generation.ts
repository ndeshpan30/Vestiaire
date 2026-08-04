import { z } from 'zod';

/**
 * SINGLE SOURCE OF TRUTH ZOD SCHEMA FOR GEMINI OUTFIT GENERATION OUTPUT
 * 
 * Must be kept in sync with native Gemini responseSchema in app/api/generate-outfit/route.ts.
 */
export const outfitGenerationResponseSchema = z.object({
  outfit_title: z.string(),
  selected_garment_ids: z.array(z.string()),
  styling_reason: z.string(),
});

export type OutfitGenerationResponse = z.infer<typeof outfitGenerationResponseSchema>;
