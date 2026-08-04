'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';

export async function archiveGarment(garmentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!garmentId) {
      return { success: false, error: 'Garment ID is required.' };
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('garments')
      .update({ is_archived: true })
      .eq('id', garmentId);

    if (error) {
      console.error('[archiveGarment Error]:', error.message);
      return { success: false, error: error.message };
    }

    revalidatePath('/inventory');
    revalidatePath('/closet');
    revalidatePath('/generate');

    return { success: true };
  } catch (err: any) {
    const errorMsg = err?.message || String(err);
    console.error('[archiveGarment Failed]:', errorMsg);
    return { success: false, error: errorMsg };
  }
}
