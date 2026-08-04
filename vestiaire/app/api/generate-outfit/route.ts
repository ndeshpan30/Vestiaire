/**
 * VESTIAIRE Core AI Outfit Stylist Route Handler
 * Endpoint: POST /api/generate-outfit
 * Uses Gemini 2.5 Flash with structured responseSchema and Zod runtime validation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { outfitGenerationResponseSchema } from '@/lib/schemas/outfit-generation';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

// Native Gemini Response Schema Definition
const outfitResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    outfit_title: {
      type: SchemaType.STRING,
      description: 'e.g. Monochrome Minimalist Workwear',
    },
    selected_garment_ids: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.STRING,
        description: 'Exact UUID string from the provided wardrobe context',
      },
    },
    styling_reason: {
      type: SchemaType.STRING,
      description: 'Exactly 2 sentences: color theory + formality + weather fit',
    },
  },
  required: ['outfit_title', 'selected_garment_ids', 'styling_reason'],
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { occasion = 'Casual', weather = 'Mild', userId: bodyUserId } = body;

    const supabase = createClient();

    // 1. Auth Resolution with Body Fallback & Warning
    let userId: string | null = null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || null;
    } catch (authErr) {
      console.warn('[generate-outfit] Error resolving auth user session:', authErr);
    }

    if (!userId) {
      const isValidUuid = (id?: string) =>
        !!id && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);

      userId = isValidUuid(bodyUserId) ? bodyUserId : (process.env.DEMO_USER_ID || '11111111-1111-1111-1111-111111111111');
      console.warn(`[generate-outfit] Unauthenticated user session. Falling back to resolved userId: ${userId}`);
    }

    const targetUserId = userId || '11111111-1111-1111-1111-111111111111';

    // 2. Query Non-Archived Garments (Lean Payload)
    const { data: rawGarments, error: fetchErr } = await supabase
      .from('garments')
      .select('id, subcategory, category, primary_color, pattern, formality, season, warmth, accessory_type, metal_tone, delicacy')
      .eq('user_id', targetUserId)
      .eq('is_archived', false);

    if (fetchErr) {
      console.error('[generate-outfit] Failed to fetch wardrobe garments:', fetchErr);
      return NextResponse.json(
        { success: false, error: 'Failed to generate outfit. Please try again.' },
        { status: 500 }
      );
    }

    const garments: any[] = (rawGarments || []) as any[];

    // 3. Edge Case: Insufficient Wardrobe (< 2 garments)
    if (!garments || garments.length < 2) {
      return NextResponse.json({
        success: false,
        reason: 'INSUFFICIENT_GARMENTS',
        message: 'You need at least 2 garments in your wardrobe to generate an outfit — add a top and bottom to get started.',
      }, { status: 200 });
    }

    const validItemIds = new Set(garments.map((g) => g.id));

    // 4. Group Wardrobe Items by Category & Accessory Sub-Types
    const groupedWardrobe: Record<string, any> = {
      Tops: [],
      Bottoms: [],
      Dresses: [],
      Outerwear: [],
      Footwear: [],
      Accessories: {
        Jewelry: [],
        Watch: [],
        Bag: [],
        Belt: [],
        Scarf: [],
        Hat: [],
        Layering: [],
        Other: [],
      },
    };

    garments.forEach((g) => {
      const cat = g.category;
      if (cat === 'Accessory') {
        const subType = g.accessory_type || 'Other';
        if (groupedWardrobe.Accessories[subType]) {
          groupedWardrobe.Accessories[subType].push(g);
        } else {
          groupedWardrobe.Accessories.Other.push(g);
        }
      } else if (cat === 'Top') {
        groupedWardrobe.Tops.push(g);
      } else if (cat === 'Bottom') {
        groupedWardrobe.Bottoms.push(g);
      } else if (cat === 'Dress') {
        groupedWardrobe.Dresses.push(g);
      } else if (cat === 'Outerwear') {
        groupedWardrobe.Outerwear.push(g);
      } else if (cat === 'Footwear') {
        groupedWardrobe.Footwear.push(g);
      } else {
        if (!groupedWardrobe[cat]) groupedWardrobe[cat] = [];
        groupedWardrobe[cat].push(g);
      }
    });

    // Unconfigured Key Development Fallback Payload
    if (!apiKey) {
      console.warn('[generate-outfit] GEMINI_API_KEY missing. Returning fallback recommendation.');
      const fallbackIds = Array.from(validItemIds).slice(0, 4);
      const { data: fallbackFullItems } = await supabase
        .from('garments')
        .select('*')
        .in('id', fallbackIds);

      return NextResponse.json({
        success: true,
        recommendation: {
          outfit_title: `${occasion} ${weather} Ensemble`,
          styling_reason: 'A balanced color palette paired with weather-appropriate layering for an effortless editorial look.',
          selected_garment_ids: fallbackIds,
          items: fallbackFullItems || [],
        },
      });
    }

    // 5. Construct Explicit Gemini Prompt
    const prompt = `You are VESTIAIRE's lead editorial stylist.

STYLING CONSTRAINTS (HARD CONSTRAINTS):
- Occasion: ${occasion}
- Weather: ${weather}

AVAILABLE WARDROBE (Grouped by Category & Accessory Sub-Types):
${JSON.stringify(groupedWardrobe, null, 2)}

DIRECTIVES:
1. OUTFIT COMPOSITION: Build a coherent, editorial-grade outfit appropriate for the "${occasion}" occasion and "${weather}" weather.
   - Base Layer: Select either (Top + Bottom) or (Dress/Jumpsuit).
   - Footwear: Always select appropriate Footwear.
   - Outerwear: MUST include Outerwear if Weather is "Cold" or "Rainy".
   - Accessories: Accessories are not optional filler. Include at least ONE accessory from the wardrobe if any eligible accessory exists for the occasion/weather. Prefer pulling from at least two different accessory_type groups (e.g. one piece of jewelry plus a bag) when enough eligible accessories exist. Only omit accessories entirely if the wardrobe genuinely has none available for this weather/occasion.

2. ID INTEGRITY: You MUST ONLY select 'id' strings present in the provided wardrobe JSON context. Never invent or hallucinate an ID.

3. STYLING REASON: Provide exactly 2 sentences explaining color theory, formality alignment, and weather fit for this ensemble.`;

    // 6. Initialize Gemini Model with Fallback
    let result;
    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: outfitResponseSchema as any,
        },
      });
      result = await model.generateContent([prompt]);
    } catch (apiErr: any) {
      console.warn('[generate-outfit] Gemini 2.5 Flash failed, attempting gemini-1.5-flash fallback:', apiErr);
      try {
        const fallbackModel = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: outfitResponseSchema as any,
          },
        });
        result = await fallbackModel.generateContent([prompt]);
      } catch (fallbackErr: any) {
        console.error('[generate-outfit] Upstream Gemini API failure:', fallbackErr);
        return NextResponse.json(
          { success: false, error: 'Failed to generate outfit. Please try again.' },
          { status: 200 }
        );
      }
    }

    const text = result.response.text();
    let rawJson;
    try {
      rawJson = JSON.parse(text);
    } catch (parseErr) {
      console.error('[generate-outfit] Failed to parse Gemini JSON output:', text);
      return NextResponse.json(
        { success: false, error: 'Failed to generate outfit. Please try again.' },
        { status: 200 }
      );
    }

    // 7. Zod Runtime Schema Validation
    const validation = outfitGenerationResponseSchema.safeParse(rawJson);
    if (!validation.success) {
      console.error('[generate-outfit] Zod validation failed on Gemini output:', validation.error.format());
      return NextResponse.json(
        { success: false, error: 'Failed to generate outfit. Please try again.' },
        { status: 200 }
      );
    }

    const parsed = validation.data;

    // 8. Filter Hallucinated Garment IDs
    const validSelectedIds = parsed.selected_garment_ids.filter((id) => {
      const exists = validItemIds.has(id);
      if (!exists) {
        console.warn(`[generate-outfit] Stripped hallucinated garment ID: "${id}"`);
      }
      return exists;
    });

    if (validSelectedIds.length === 0) {
      console.error('[generate-outfit] No valid garment IDs remained after hallucination filtering.');
      return NextResponse.json(
        { success: false, error: 'Failed to generate outfit. Please try again.' },
        { status: 200 }
      );
    }

    // 9. Fetch Full Garment Row Data for Selected Items
    const { data: rawFullItems } = await supabase
      .from('garments')
      .select('*')
      .in('id', validSelectedIds);

    const fullItems: any[] = (rawFullItems || []) as any[];

    // Preserve Gemini's selection order
    const itemMap = new Map(fullItems.map((item) => [item.id, item]));
    const orderedItems = validSelectedIds
      .map((id) => itemMap.get(id))
      .filter(Boolean);

    return NextResponse.json({
      success: true,
      recommendation: {
        outfit_title: parsed.outfit_title,
        styling_reason: parsed.styling_reason,
        selected_garment_ids: validSelectedIds,
        items: orderedItems,
      },
    }, { status: 200 });
  } catch (error: any) {
    console.error('[generate-outfit] Uncaught Route Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate outfit. Please try again.' },
      { status: 200 }
    );
  }
}
