import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { HeaderNav } from '@/components/HeaderNav';
import { NavigationTabs } from '@/components/navigation-tabs';
import { StylingSuiteView } from '@/components/styling-suite-view';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function GeneratePage() {
  let user: any = null;
  let garmentCount = 0;

  try {
    const supabase = createClient();
    const authResult = await supabase.auth.getUser();
    user = authResult?.data?.user || null;

    const resolvedUserId = user?.id || process.env.DEMO_USER_ID || '11111111-1111-1111-1111-111111111111';

    const { count, error } = await supabase
      .from('garments')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', resolvedUserId)
      .eq('is_archived', false);

    if (error) {
      console.error('[GeneratePage] Count query error:', error.message);
    } else {
      garmentCount = count || 0;
    }
  } catch (err) {
    console.error('[GeneratePage] Exception during load:', err);
    garmentCount = 0;
  }

  const userId = user && typeof user.id === 'string' ? user.id : undefined;

  return (
    <div className="min-h-screen bg-white text-[#121212] font-sans flex flex-col">
      {/* Top Header Navigation */}
      <HeaderNav userEmail={user?.email} />

      {/* Sticky Tab Bar Navigation */}
      <NavigationTabs />

      {/* Main Tab 2 Content */}
      <main className="max-w-5xl mx-auto px-6 py-8 flex-1 w-full">
        <StylingSuiteView initialGarmentCount={garmentCount} userId={userId} />
      </main>
    </div>
  );
}
