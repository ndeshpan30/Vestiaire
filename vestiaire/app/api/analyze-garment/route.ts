import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 1. Read API Key strictly from server-side environment variables
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Server configuration error: GEMINI_API_KEY is not set on backend environment.' },
        { status: 500 }
      );
    }

    const { imageBase64, mimeType } = await request.json();

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Missing required image payload.' },
        { status: 400 }
      );
    }

    // 2. Call Google Gemini 2.5 Flash Vision REST API securely from serverless backend
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const prompt = `Analyze this garment image for a luxury editorial wardrobe application. Return a JSON object with:
    {
      "title": "Short descriptive title (e.g. Navy Double-Breasted Wool Blazer)",
      "category": "One of: Tops, Bottoms, Outerwear, Footwear, Accessories",
      "primary_color": "Primary color name",
      "material": "Estimated fabric/material",
      "pattern": "Solid, Striped, Plaid, Patterned, etc.",
      "formality": Integer from 1 (Casual) to 10 (Black Tie Formal),
      "seasons": Array of applicable seasons from ["Spring", "Summer", "Autumn", "Winter"]
    }`;

    const payload = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: mimeType || 'image/jpeg',
                data: imageBase64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        response_mime_type: 'application/json',
      },
    };

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: 'Gemini AI Vision processing failed on backend server.', details: errorText },
        { status: response.status }
      );
    }

    const result = await response.json();
    const candidateText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsedData = JSON.parse(candidateText || '{}');

    return NextResponse.json({ success: true, garment: parsedData });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal Server Error during AI analysis.', message: error.message },
      { status: 500 }
    );
  }
}
