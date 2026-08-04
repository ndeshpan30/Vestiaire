-- ====================================================================
-- FULL SUPABASE SETUP: TABLES, TRIGGERS, RLS & SEED DEMO ACCOUNTS
-- Copy and paste this ENTIRE script into the Supabase SQL Editor and click Run.
-- ====================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create Public User Profiles Table (MUST BE CREATED BEFORE TRIGGERS AND INSERTS)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    style_preference TEXT DEFAULT 'Editorial'
);

-- 3. Create Multi-User Garments Table Linked to auth.users
CREATE TABLE IF NOT EXISTS public.garments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Top', 'Bottom', 'One-Piece', 'Shoes', 'Outerwear', 'Accessory')),
    color TEXT NOT NULL,
    secondary_color TEXT DEFAULT 'None',
    material TEXT DEFAULT 'Cotton',
    pattern TEXT DEFAULT 'Solid',
    formality INTEGER NOT NULL CHECK (formality >= 1 AND formality <= 10),
    season TEXT[] NOT NULL DEFAULT '{}',
    image_url TEXT NOT NULL,
    is_archived BOOLEAN NOT NULL DEFAULT false
);

-- 4. Create Performance Indexes
CREATE INDEX IF NOT EXISTS idx_garments_user_id ON public.garments(user_id);
CREATE INDEX IF NOT EXISTS idx_garments_user_category ON public.garments(user_id, category);
CREATE INDEX IF NOT EXISTS idx_garments_user_archived ON public.garments(user_id, is_archived);

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
),
(
    '33333333-3333-3333-3333-333333333333',
    '00000000-0000-0000-0000-000000000000',
    'fashionista@vestiaire.app',
    crypt('Password123!', gen_salt('bf')),
    now(),
    'authenticated',
    '{"full_name": "Elena Vance", "style_preference": "Classic Luxury"}',
    now(),
    now()
)
ON CONFLICT (id) DO NOTHING;

-- 7. Seed Profiles (Fallback if trigger did not auto-insert)
INSERT INTO public.profiles (id, full_name, style_preference)
VALUES
('11111111-1111-1111-1111-111111111111', 'Demo Curator', 'Editorial'),
('22222222-2222-2222-2222-222222222222', 'Admin Stylist', 'Minimalist'),
('33333333-3333-3333-3333-333333333333', 'Elena Vance', 'Classic Luxury')
ON CONFLICT (id) DO NOTHING;

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE public.garments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own garments" ON public.garments FOR SELECT USING (auth.uid() = user_id);
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
