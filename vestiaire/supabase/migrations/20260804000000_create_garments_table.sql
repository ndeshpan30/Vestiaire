-- Migration: Create garments table with RLS and index
-- File: supabase/migrations/20260804000000_create_garments_table.sql

CREATE TABLE IF NOT EXISTS public.garments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    image_path TEXT NOT NULL,
    image_url TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    taxonomy_path TEXT,
    primary_color TEXT,
    secondary_colors TEXT[],
    pattern TEXT,
    material_guess TEXT,
    warmth SMALLINT,
    formality SMALLINT,
    season TEXT[],
    vibe_tags TEXT[],
    accessory_type TEXT,
    metal_tone TEXT,
    delicacy SMALLINT,
    wear_count INTEGER NOT NULL DEFAULT 0,
    last_worn DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for category-filtered wardrobe queries
CREATE INDEX IF NOT EXISTS idx_garments_user_category ON public.garments (user_id, category);

-- Enable Row Level Security (RLS)
ALTER TABLE public.garments ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own garments
CREATE POLICY "Users can view their own garments" ON public.garments
    FOR SELECT USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own garments
CREATE POLICY "Users can insert their own garments" ON public.garments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own garments
CREATE POLICY "Users can update their own garments" ON public.garments
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policy: Users can delete their own garments
CREATE POLICY "Users can delete their own garments" ON public.garments
    FOR DELETE USING (auth.uid() = user_id);
