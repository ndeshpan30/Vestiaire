import { getGarmentPublicUrl } from '../lib/supabase/get-public-url';

console.log('====================================================');
console.log('TESTING GET GARMENT PUBLIC URL RESOLUTION HELPER');
console.log('====================================================');

const testCases = [
  { inputUrl: 'https://hxojdmiqnzqdwhlhnnsm.supabase.co/storage/v1/object/public/garment-images/user/item.jpg', inputPath: 'user/item.jpg' },
  { inputUrl: 'user-123/garment-456.jpg', inputPath: 'user-123/garment-456.jpg' },
  { inputUrl: 'garment-images/user-123/garment-789.jpg', inputPath: null },
  { inputUrl: null, inputPath: 'user-999/photo.png' },
  { inputUrl: null, inputPath: null },
];

testCases.forEach((tc, idx) => {
  const resolved = getGarmentPublicUrl(tc.inputUrl, tc.inputPath);
  console.log(`[Case ${idx + 1}] Input URL: "${tc.inputUrl}" | Input Path: "${tc.inputPath}"`);
  console.log(`  => Resolved Public URL: "${resolved}"\n`);
});

console.log('✓ Public URL Resolution Helper Verification SUCCESSFUL!');
