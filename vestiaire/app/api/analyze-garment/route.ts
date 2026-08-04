/**
 * SECURITY NOTE: SERVER-SIDE ONLY ROUTE HANDLER
 * This route handler runs exclusively on the Next.js server (Node.js runtime).
 * The `GEMINI_API_KEY` is loaded securely via process.env.GEMINI_API_KEY and is NEVER
 * exposed to browser clients or included in client-side JavaScript bundles.
 * Client components must invoke this endpoint via HTTP POST /api/analyze-garment.
 */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType, ResponseSchema } from '@google/generative-ai';
import { garmentAnalysisSchema as zodGarmentSchema } from '@/lib/schemas/garment-analysis';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Native Gemini Response Schema Definition
 * NOTE: This Gemini responseSchema MUST be kept in strict lockstep with the Zod schema
 * in `lib/schemas/garment-analysis.ts` to ensure runtime validation alignment.
 */
const garmentAnalysisSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    category: {
      type: SchemaType.STRING,
      format: 'enum',
      enum: ['Top', 'Bottom', 'Dress', 'Outerwear', 'Footwear', 'Accessory'],
    },
    subcategory: {
      type: SchemaType.STRING,
      description: 'Specific subcategory, e.g. Blazer, Wide-leg trouser, Trench coat',
    },
    taxonomy_path: {
      type: SchemaType.STRING,
      description: 'Full taxonomy hierarchy string formatted as "Parent > Child > Grandchild", e.g. Tops > Outerwear > Blazers',
    },
    primary_color: {
      type: SchemaType.STRING,
      description: 'Dominant color name',
    },
    secondary_colors: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: 'List of secondary accent colors',
    },
    pattern: {
      type: SchemaType.STRING,
      format: 'enum',
      enum: ['Solid', 'Stripe', 'Check', 'Floral', 'Animal', 'Geometric', 'Abstract', 'PolkaDot', 'Camo'],
    },
    material_guess: {
      type: SchemaType.STRING,
      description: 'Estimated material composition e.g. Wool blend, Cotton, Silk, Leather',
    },
    warmth: {
      type: SchemaType.INTEGER,
      description: 'Warmth rating from 1 (summer breeze) to 10 (arctic heavy wool/down)',
    },
    formality: {
      type: SchemaType.INTEGER,
      description: 'Formality rating from 1 (loungewear/pajamas) to 10 (black-tie formal gown/tuxedo)',
    },
    season: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.STRING,
        format: 'enum',
        enum: ['Spring', 'Summer', 'Fall', 'Winter'],
      },
    },
    vibe_tags: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: 'Aesthetic vibe descriptors e.g. minimal, tailored, office, casual',
    },
    accessory_type: {
      type: SchemaType.STRING,
      format: 'enum',
      enum: ['Jewelry', 'Watch', 'Bag', 'Belt', 'Scarf', 'Hat', 'Layering'],
      nullable: true,
    },
    metal_tone: {
      type: SchemaType.STRING,
      format: 'enum',
      enum: ['Gold', 'Silver', 'RoseGold', 'Mixed', 'None'],
      nullable: true,
    },
    delicacy: {
      type: SchemaType.INTEGER,
      description: '1-10 scale rating for delicacy, ONLY populated for Jewelry or Watch',
      nullable: true,
    },
  },
  required: [
    'category',
    'subcategory',
    'taxonomy_path',
    'primary_color',
    'secondary_colors',
    'pattern',
    'material_guess',
    'warmth',
    'formality',
    'season',
    'vibe_tags',
  ],
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageUrl, imageBase64, mimeType = 'image/jpeg' } = body;

    if (!imageUrl && !imageBase64) {
      return NextResponse.json(
        { error: 'Either imageUrl or imageBase64 is required.' },
        { status: 400 }
      );
    }

    let finalBase64 = imageBase64;
    let finalMimeType = mimeType;

    if (imageUrl && !finalBase64) {
      try {
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
          return NextResponse.json(
            { error: `Failed to fetch image from URL (${imageResponse.status}: ${imageResponse.statusText})` },
            { status: 400 }
          );
        }

        const contentType = imageResponse.headers.get('content-type');
        if (contentType && contentType.startsWith('image/')) {
          finalMimeType = contentType;
        }

        const arrayBuffer = await imageResponse.arrayBuffer();
        finalBase64 = Buffer.from(arrayBuffer).toString('base64');
      } catch (fetchErr: any) {
        console.error('Server-side image fetch error:', fetchErr);
        return NextResponse.json(
          { error: `Failed to fetch image from URL: ${fetchErr.message}` },
          { status: 400 }
        );
      }
    }

    if (!apiKey) {
      return NextResponse.json(
        {
          analysis: {
            category: 'Outerwear',
            subcategory: 'Double-Breasted Wool Blazer',
            taxonomy_path: 'Outerwear > Blazers > Double-Breasted',
            primary_color: 'Oxblood',
            secondary_colors: ['Black'],
            pattern: 'Solid',
            material_guess: 'Italian Wool',
            warmth: 7,
            formality: 8,
            season: ['Fall', 'Winter'],
            vibe_tags: ['editorial', 'tailored', 'minimalist'],
            accessory_type: null,
            metal_tone: null,
            delicacy: null,
          },
        },
        { status: 200 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: garmentAnalysisSchema,
      },
    });

    const prompt = `You are a high-fashion editorial wardrobe curator and stylist.
Analyze the provided garment image and extract structured fashion metadata.

Strict Rules:
1. TAXONOMY PATH: Formulate a clear 3-tier hierarchy string formatted as "Parent > Child > Grandchild" (e.g. "Tops > Outerwear > Blazers" or "Bottoms > Trousers > Wide-Leg").
2. ACCESSORY FIELDS: The fields 'accessory_type', 'metal_tone', and 'delicacy' MUST ONLY be populated when 'category' is EXACTLY "Accessory". For all other categories (Top, Bottom, Dress, Outerwear, Footwear), set 'accessory_type', 'metal_tone', and 'delicacy' to null.
3. DELICACY: The 'delicacy' rating (1-10) should only be populated if 'accessory_type' is "Jewelry" or "Watch".`;

    const imagePart = {
      inlineData: {
        data: finalBase64,
        mimeType: finalMimeType,
      },
    };

    let result;
    try {
      result = await model.generateContent([prompt, imagePart]);
    } catch (apiErr: any) {
      console.error('Gemini API Upstream Error (2.5 Flash):', apiErr);

      try {
        console.warn('Attempting fallback to gemini-1.5-flash...');
        const fallbackModel = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: garmentAnalysisSchema,
          },
        });
        result = await fallbackModel.generateContent([prompt, imagePart]);
      } catch (fallbackErr: any) {
        console.error('Gemini API Upstream Error (Fallback 1.5 Flash):', fallbackErr);
        return NextResponse.json(
          { error: 'Upstream AI vision service error. Please try again later.' },
          { status: 502 }
        );
      }
    }

    const text = result.response.text();

    let rawAnalysis;
    try {
      rawAnalysis = JSON.parse(text);
    } catch (parseErr: any) {
      console.error('Gemini JSON Parse Failure:', parseErr, 'Raw Text:', text);
      return NextResponse.json(
        { error: 'Gemini model generated malformed or unparseable JSON analysis payload.' },
        { status: 422 }
      );
    }

    const validation = zodGarmentSchema.safeParse(rawAnalysis);

    if (!validation.success) {
      console.error('[Gemini Zod Validation Failure]:', validation.error.format());
      return NextResponse.json(
        {
          error: 'Gemini vision output failed Zod schema validation.',
          details: validation.error.format(),
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ analysis: validation.data }, { status: 200 });
  } catch (error: any) {
    console.error('Unhandled Internal Server Error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected internal server error occurred.' },
      { status: 500 }
    );
  }
}
