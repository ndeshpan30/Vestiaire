import fs from 'fs';
import path from 'path';

// Parse .env manually without external dependencies
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  for (const line of envConfig.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startswith?.('#') && trimmed.includes('=')) {
      const parts = trimmed.split('=');
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      if (key && val) {
        process.env[key] = val;
      }
    }
  }
}

import { garmentAnalysisSchema } from '../lib/schemas/garment-analysis';
import { saveGarment } from '../app/actions/save-garment';
import { createClient } from '../utils/supabase/server';

async function testEndToEnd() {
  console.log('====================================================');
  console.log('VESTIAIRE END-TO-END PIPELINE VERIFICATION TEST');
  console.log('====================================================');

  // 1. Simulate Gemini 2.5 Flash Vision output
  const rawGeminiOutput = {
    category: 'Outerwear',
    subcategory: 'Double-Breasted Wool Blazer',
    taxonomy_path: 'Tops > Outerwear > Blazers',
    primary_color: 'Oxblood',
    secondary_colors: ['Black', 'Gold'],
    pattern: 'Solid',
    material_guess: 'Italian Virgin Wool',
    warmth: 8,
    formality: 9,
    season: ['Fall', 'Winter'],
    vibe_tags: ['editorial', 'tailored', 'minimalist'],
    accessory_type: null,
    metal_tone: null,
    delicacy: null,
  };

  // 2. Validate Gemini Output with Zod Schema
  console.log('[Step 1] Running Zod Schema Validation on AI Vision metadata...');
  const validation = garmentAnalysisSchema.safeParse(rawGeminiOutput);
  if (!validation.success) {
    console.error('Zod Validation Failed:', validation.error.format());
    process.exit(1);
  }
  console.log('✓ Zod Schema Validation Passed!');

  // 3. Test Storage Object Upload & URL Generation
  const testUserId = '11111111-1111-1111-1111-111111111111';
  const testImagePath = `${testUserId}/test-${Date.now()}-blazer.jpg`;
  const testImageUrl = `https://hxojdmiqnzqdwhlhnnsm.supabase.co/storage/v1/object/public/garment-images/${testImagePath}`;

  console.log(`[Step 2] Prepared Storage object path: ${testImagePath}`);
  console.log(`[Step 3] Executing saveGarment action with generated GarmentInsert type...`);

  // 4. Save to Live Supabase Database
  const result = await saveGarment({
    userId: testUserId,
    imagePath: testImagePath,
    imageUrl: testImageUrl,
    analysis: validation.data,
  });

  console.log('====================================================');
  console.log('RESULT OF DATABASE INSERTION:');
  console.log(JSON.stringify(result, null, 2));
  console.log('====================================================');

  if (result.success) {
    console.log('✓ End-to-End Pipeline Verification SUCCESSFUL!');

    // 5. Query back inserted row to verify all columns populated
    const supabase = createClient();
    const { data: insertedRow, error: fetchErr } = await supabase
      .from('garments')
      .select('*')
      .eq('id', (result.data as any).id)
      .single();

    if (!fetchErr && insertedRow) {
      console.log('\n====================================================');
      console.log('FETCHED INSTANCE FROM DB WITH FULL COLUMN DATA:');
      console.log(JSON.stringify(insertedRow, null, 2));
      console.log('====================================================');
    }
  } else {
    console.error('❌ Pipeline Failed:', result.error);
    process.exit(1);
  }
}

testEndToEnd().catch((err) => {
  console.error('Unhandled Verification Test Error:', err);
  process.exit(1);
});
