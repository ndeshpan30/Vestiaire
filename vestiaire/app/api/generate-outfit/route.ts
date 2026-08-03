/**
 * VESTIAIRE Core AI Outfit Stylist Route Handler
 * Endpoint: POST /api/generate-outfit
 * Uses Gemini 2.5 Flash with structured responseSchema to generate complete outfit recommendations.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

// Native Gemini Response Schema Definition
const outfitRecommendationSchema = {
  type: SchemaType.OBJECT,
  properties: {
    outfit: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          slot: {
            type: SchemaType.STRING,
            enum: [
              'Top',
              'Bottom',
              'Dress',
              'Outerwear',
              'Footwear',
              'Jewelry',
              'Watch',
              'Bag',
              'Belt',
              'Scarf',
              'Hat',
              'Layering',
            ],
          },
          item_id: {
            type: SchemaType.STRING,
            description: 'The exact item UUID from the provided wardrobe context',
          },
        },
        required: ['slot', 'item_id'],
      },
    },
    styling_notes: {
      type: SchemaType.STRING,
      description: 'Plain-language editorial styling rationale explaining color harmony, formality alignment, and aesthetic coherence.',
    },
    unfilled_slots: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          slot: { type: SchemaType.STRING },
          reason: { type: SchemaType.STRING },
        },
        required: ['slot', 'reason'],
      },
    },
  },
  required: ['outfit', 'styling_notes', 'unfilled_slots'],
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { anchorItemId, userId } = body;

    if (!anchorItemId || !userId) {
      return NextResponse.json(
        { error: 'Both anchorItemId and userId are required.' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // 1. Query Anchor Garment Item
    const { data: anchorGarment, error: anchorError } = await supabase
      .from('garments')
      .select('id, category, subcategory, taxonomy_path, primary_color, secondary_colors, pattern, material_guess, warmth, formality, season, vibe_tags, accessory_type, metal_tone, delicacy')
      .eq('id', anchorItemId)
      .single();

    if (anchorError || !anchorGarment) {
      return NextResponse.json(
        { error: `Anchor garment not found: ${anchorError?.message || 'Invalid ID'}` },
        { status: 404 }
      );
    }

    // 2. Query Wardrobe Items (Lean Payload)
    const { data: wardrobeGarments, error: wardrobeError } = await supabase
      .from('garments')
      .select('id, category, subcategory, primary_color, secondary_colors, pattern, material_guess, warmth, formality, season, vibe_tags, accessory_type, metal_tone, delicacy')
      .eq('user_id', userId)
      .neq('id', anchorItemId);

    if (wardrobeError) {
      return NextResponse.json(
        { error: `Failed to query wardrobe items: ${wardrobeError.message}` },
        { status: 500 }
      );
    }

    const allItems = [anchorGarment, ...(wardrobeGarments || [])];
    const validItemIds = new Set(allItems.map((i) => i.id));

    // 3. Group Wardrobe Items by Category & Accessory Sub-Types
    const groupedWardrobe: Record<string, any> = {
      Top: [],
      Bottom: [],
      Dress: [],
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

    (wardrobeGarments || []).forEach((item) => {
      const cat = item.category;
      if (cat === 'Accessory') {
        const subType = item.accessory_type || 'Other';
        if (groupedWardrobe.Accessories[subType]) {
          groupedWardrobe.Accessories[subType].push(item);
        } else {
          groupedWardrobe.Accessories.Other.push(item);
        }
      } else if (groupedWardrobe[cat]) {
        groupedWardrobe[cat].push(item);
      } else {
        groupedWardrobe[cat] = [item];
      }
    });

    // Unconfigured Key Development Fallback Payload
    if (!apiKey) {
      return NextResponse.json({
        recommendation: {
          outfit: [
            { slot: anchorGarment.category, item_id: anchorGarment.id },
            ...(wardrobeGarments && wardrobeGarments.length > 0
              ? [{ slot: wardrobeGarments[0].category, item_id: wardrobeGarments[0].id }]
              : []),
          ],
          styling_notes: `Curated editorial outfit anchored around your ${anchorGarment.subcategory || anchorGarment.category} in ${anchorGarment.primary_color}.`,
          unfilled_slots: [],
        },
      });
    }

    // 4. Construct Explicit Gemini Prompt Text
    const prompt = `You are VESTIAIRE's lead editorial stylist and wardrobe architect.

ANCHOR ITEM (The outfit MUST be built around this central piece):
${JSON.stringify(anchorGarment, null, 2)}

AVAILABLE WARDROBE CONTEXT (Organized by Category and Accessory Sub-Types):
${JSON.stringify(groupedWardrobe, null, 2)}

STYLING DIRECTIVES:
1. ANCHOR ITEM INTEGRATION: The outfit MUST include the anchor item with item_id "${anchorGarment.id}" in its appropriate slot (${anchorGarment.category}).
2. COMPLETE OUTFIT COMPOSITION:
   - Base Layer: Either a Top + Bottom combination, or a single Dress.
   - Outerwear: Include Outerwear if the anchor item's warmth or season implies cool/cold weather (Fall/Winter).
   - Footwear: Always select appropriate Footwear.
   - Accessories: IF the wardrobe context contains items under Accessories (Jewelry, Watch, Bag, Belt, Scarf, Hat, Layering), YOU MUST SELECT AT LEAST ONE ACCESSORY FROM AT LEAST TWO DIFFERENT ACCESSORY GROUPS. Do not skip accessories.
3. ID INTEGRITY: You MUST ONLY use the exact 'id' strings present in the provided wardrobe context or anchor item. NEVER invent or hallucinate an item_id string.
4. UNFILLED SLOTS: If the available wardrobe lacks suitable items for a required slot (e.g. no bottoms exist), list that slot in 'unfilled_slots' with a clear explanatory reason instead of failing or hallucinating.
5. EDITORIAL STYLING NOTES: Provide a sophisticated 2-3 sentence editorial rationale explaining color coordination, formality pairing, and aesthetic harmony.`;

    // 5. Initialize Gemini 2.5 Flash Model
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: outfitRecommendationSchema as any,
      },
    });

    let result;
    try {
      result = await model.generateContent([prompt]);
    } catch (apiErr: any) {
      console.error('Gemini Outfit Generation Error (2.5 Flash):', apiErr);
      try {
        console.warn('Attempting fallback to gemini-1.5-flash...');
        const fallbackModel = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: outfitRecommendationSchema as any,
          },
        });
        result = await fallbackModel.generateContent([prompt]);
      } catch (fallbackErr: any) {
        console.error('Gemini Outfit Generation Error (Fallback 1.5 Flash):', fallbackErr);
        return NextResponse.json(
          { error: 'Upstream AI styling engine error. Please try again later.' },
          { status: 502 }
        );
      }
    }

    const text = result.response.text();
    let rawRecommendation;
    try {
      rawRecommendation = JSON.parse(text);
    } catch (parseErr) {
      console.error('Failed to parse Gemini outfit response:', text);
      return NextResponse.json(
        { error: 'AI styling engine returned an unparseable response.' },
        { status: 422 }
      );
    }

    // 6. Server-Side Validation against Hallucinated Item IDs
    const validatedOutfit: { slot: string; item_id: string }[] = [];
    const unfilledSlots: { slot: string; reason: string }[] = [
      ...(rawRecommendation.unfilled_slots || []),
    ];

    (rawRecommendation.outfit || []).forEach((slotItem: { slot: string; item_id: string }) => {
      if (validItemIds.has(slotItem.item_id)) {
        validatedOutfit.push(slotItem);
      } else {
        console.warn(`Stripped hallucinated item_id: "${slotItem.item_id}" for slot "${slotItem.slot}"`);
        unfilledSlots.push({
          slot: slotItem.slot,
          reason: 'AI referenced an invalid item',
        });
      }
    });

    const finalRecommendation = {
      outfit: validatedOutfit,
      styling_notes: rawRecommendation.styling_notes || 'Curated editorial outfit ensemble.',
      unfilled_slots: unfilledSlots,
    };

    return NextResponse.json({ recommendation: finalRecommendation }, { status: 200 });
  } catch (error: any) {
    console.error('Unhandled Outfit Generation Error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred during outfit generation.' },
      { status: 500 }
    );
  }
}
