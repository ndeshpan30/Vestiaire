import fs from 'fs';
import path from 'path';

// Parse .env natively
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

import { POST } from '../app/api/generate-outfit/route';
import { NextRequest } from 'next/server';
import { createClient } from '../utils/supabase/server';

async function runSection5Verification() {
  console.log('====================================================');
  console.log('SECTION 5: END-TO-END VERIFICATION TEST SUITE');
  console.log('====================================================\n');

  const supabase = createClient();

  // Seed test user with complete wardrobe (Top, Bottom, Footwear, Accessory)
  const fullWardrobeUserId = '11111111-1111-1111-1111-111111111111';
  
  // Ensure top, bottom, footwear, accessory exist for test user
  const seedItems = [
    {
      user_id: fullWardrobeUserId,
      title: 'Silk Ivory Blouse',
      category: 'Top',
      color: 'Ivory',
      material: 'Silk',
      pattern: 'Solid',
      formality: 7,
      season: ['Spring', 'Summer', 'Fall'],
      image_url: 'https://hxojdmiqnzqdwhlhnnsm.supabase.co/storage/v1/object/public/garment-images/demo/silk_blouse.jpg',
      is_archived: false,
      subcategory: 'Blouse',
      primary_color: 'Ivory',
      warmth: 4,
    },
    {
      user_id: fullWardrobeUserId,
      title: 'Tailored Wool Trousers',
      category: 'Bottom',
      color: 'Charcoal',
      material: 'Wool',
      pattern: 'Solid',
      formality: 8,
      season: ['Fall', 'Winter'],
      image_url: 'https://hxojdmiqnzqdwhlhnnsm.supabase.co/storage/v1/object/public/garment-images/demo/trousers.jpg',
      is_archived: false,
      subcategory: 'Trousers',
      primary_color: 'Charcoal',
      warmth: 6,
    },
    {
      user_id: fullWardrobeUserId,
      title: 'Leather Oxford Shoes',
      category: 'Footwear',
      color: 'Black',
      material: 'Leather',
      pattern: 'Solid',
      formality: 9,
      season: ['Spring', 'Fall', 'Winter'],
      image_url: 'https://hxojdmiqnzqdwhlhnnsm.supabase.co/storage/v1/object/public/garment-images/demo/oxford_shoes.jpg',
      is_archived: false,
      subcategory: 'Oxfords',
      primary_color: 'Black',
      warmth: 5,
    },
    {
      user_id: fullWardrobeUserId,
      title: 'Gold Minimalist Watch',
      category: 'Accessory',
      accessory_type: 'Watch',
      color: 'Gold',
      material: 'Stainless Steel',
      pattern: 'Solid',
      formality: 8,
      season: ['Spring', 'Summer', 'Fall', 'Winter'],
      image_url: 'https://hxojdmiqnzqdwhlhnnsm.supabase.co/storage/v1/object/public/garment-images/demo/gold_watch.jpg',
      is_archived: false,
      subcategory: 'Watch',
      primary_color: 'Gold',
      metal_tone: 'Gold',
      delicacy: 7,
    },
    {
      user_id: fullWardrobeUserId,
      title: 'Structured Leather Tote Bag',
      category: 'Accessory',
      accessory_type: 'Bag',
      color: 'Black',
      material: 'Leather',
      pattern: 'Solid',
      formality: 8,
      season: ['Spring', 'Summer', 'Fall', 'Winter'],
      image_url: 'https://hxojdmiqnzqdwhlhnnsm.supabase.co/storage/v1/object/public/garment-images/demo/leather_bag.jpg',
      is_archived: false,
      subcategory: 'Tote Bag',
      primary_color: 'Black',
      delicacy: 8,
    },
  ];

  await supabase.from('garments').insert(seedItems as any);

  // ----------------------------------------------------
  // TEST CASE 1: Full Wardrobe Outfit Generation
  // ----------------------------------------------------
  console.log('--- TEST CASE 1: Full Wardrobe (>= 2 Garments + Accessories) ---');
  const reqFull = new NextRequest('http://localhost:3000/api/generate-outfit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: fullWardrobeUserId,
      occasion: 'Work',
      weather: 'Cold',
    }),
  });

  const resFull = await POST(reqFull);
  const jsonFull = await resFull.json();
  console.log('TEST CASE 1 ACTUAL JSON RESPONSE:');
  console.log(JSON.stringify(jsonFull, null, 2));
  console.log('\n----------------------------------------------------\n');

  // ----------------------------------------------------
  // TEST CASE 2: Insufficient Wardrobe (< 2 Garments)
  // ----------------------------------------------------
  console.log('--- TEST CASE 2: Insufficient Wardrobe (0-1 Garments) ---');
  const insufficientUserId = '99999999-9999-9999-9999-999999999999';

  const reqInsufficient = new NextRequest('http://localhost:3000/api/generate-outfit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: insufficientUserId,
      occasion: 'Casual',
      weather: 'Mild',
    }),
  });

  const resInsufficient = await POST(reqInsufficient);
  const jsonInsufficient = await resInsufficient.json();
  console.log('TEST CASE 2 ACTUAL JSON RESPONSE:');
  console.log(JSON.stringify(jsonInsufficient, null, 2));
  console.log('\n====================================================');

  if (jsonFull.success && jsonInsufficient.success === false && jsonInsufficient.reason === 'INSUFFICIENT_GARMENTS') {
    console.log('✓ ALL SECTION 5 TEST CASES PASSED SUCCESSFULLY!');
  } else {
    console.error('❌ Verification failed: Output did not match expected structure.');
    process.exit(1);
  }
}

runSection5Verification().catch((err) => {
  console.error('Unhandled Verification Test Error:', err);
  process.exit(1);
});
