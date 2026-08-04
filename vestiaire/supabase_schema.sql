-- ====================================================================
-- FULL SUPABASE SETUP: TABLES, TRIGGERS, RLS & SEED DEMO ACCOUNTS
-- ====================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create Public User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    style_preference TEXT DEFAULT 'Editorial'
);

-- 3. Create Multi-User Garments Table (Single Source of Truth)
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

-- 4. Create Performance Indexes
CREATE INDEX idx_garments_user_category ON public.garments (user_id, category);

-- 5. Automatic Profile Creation Trigger Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, style_preference)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'style_preference', 'Editorial')
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind Trigger to auth.users Table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update garments updated_at trigger
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

-- 6. Insert Seed Demo Users in auth.users
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, role, raw_user_meta_data, created_at, updated_at)
VALUES
(
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'demo@vestiaire.app',
    crypt('Password123!', gen_salt('bf')),
    now(),
    'authenticated',
    '{"full_name": "Demo Curator", "style_preference": "Editorial"}',
    now(),
    now()
),
(
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'admin@vestiaire.app',
    crypt('Password123!', gen_salt('bf')),
    now(),
    'authenticated',
    '{"full_name": "Admin Stylist", "style_preference": "Minimalist"}',
    now(),
    now()
)
ON CONFLICT (id) DO NOTHING;

-- 7. Seed Profiles (Fallback if trigger did not auto-insert)
INSERT INTO public.profiles (id, full_name, style_preference)
VALUES
('11111111-1111-1111-1111-111111111111', 'Demo Curator', 'Editorial'),
('22222222-2222-2222-2222-222222222222', 'Admin Stylist', 'Minimalist')
ON CONFLICT (id) DO NOTHING;

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE public.garments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can select their own garments" ON public.garments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own garments" ON public.garments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own garments" ON public.garments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own garments" ON public.garments FOR DELETE USING (auth.uid() = user_id);

-- Storage Bucket Policies
INSERT INTO storage.buckets (id, name, public) VALUES ('garment-images', 'garment-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Users can read garment images" ON storage.objects FOR SELECT USING (bucket_id = 'garment-images');
CREATE POLICY "Users can upload to their user folder" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'garment-images' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can delete from their user folder" ON storage.objects FOR DELETE USING (
    bucket_id = 'garment-images' AND auth.uid()::text = (storage.foldername(name))[1]
);

NOTIFY pgrst, 'reload schema';
