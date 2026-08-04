-- Migration: Recreate garments table from scratch as single source of truth
-- File: supabase/migrations/20260804000001_recreate_garments_table.sql

DROP TABLE IF EXISTS public.garments CASCADE;

CREATE TABLE public.garments (
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

-- Index on (user_id, category)
CREATE INDEX idx_garments_user_category ON public.garments (user_id, category);

-- Enable Row Level Security (RLS)
ALTER TABLE public.garments ENABLE ROW LEVEL SECURITY;

-- RLS Policies scoped to user_id = auth.uid()
CREATE POLICY "Users can select their own garments" ON public.garments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own garments" ON public.garments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own garments" ON public.garments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own garments" ON public.garments
    FOR DELETE USING (auth.uid() = user_id);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_garments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_garments_updated_at
    BEFORE UPDATE ON public.garments
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_garments_updated_at();

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
