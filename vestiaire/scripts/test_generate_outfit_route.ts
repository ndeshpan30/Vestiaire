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

async function testGenerateOutfitRoute() {
  console.log('====================================================');
  console.log('TESTING POST /api/generate-outfit ROUTE HANDLER');
  console.log('====================================================');

  const req = new NextRequest('http://localhost:3000/api/generate-outfit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      occasion: 'Work',
      weather: 'Cold',
    }),
  });

  const res = await POST(req);
  const data = await res.json();

  console.log(`HTTP Status: ${res.status}`);
  console.log('Response Payload:');
  console.log(JSON.stringify(data, null, 2));
  console.log('====================================================');

  if (data.success || data.reason === 'INSUFFICIENT_GARMENTS') {
    console.log('✓ Route Handler Execution SUCCESSFUL!');
  } else {
    console.error('❌ Route Handler Failed:', data.error);
    process.exit(1);
  }
}

testGenerateOutfitRoute().catch((err) => {
  console.error('Unhandled Test Error:', err);
  process.exit(1);
});
