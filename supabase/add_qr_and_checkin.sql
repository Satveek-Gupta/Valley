-- ==============================================================================
-- CABINET VALLEY: PARTICIPANT QR PASSES & GATE CHECK-IN MIGRATION
-- Run this in your Supabase SQL Editor
-- Safe to run on existing data: adds new columns, leaves existing registrations untouched.
-- ==============================================================================

-- 1. ADD QR TOKEN & CHECK-IN TRACKING TO THE 5 EVENT TABLES
-- 1.1 Startup Roulette
ALTER TABLE public.registrations_startup_roulette
    ADD COLUMN IF NOT EXISTS qr_token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS checked_in_by TEXT DEFAULT NULL;

-- 1.2 The War Room
ALTER TABLE public.registrations_the_war_room
    ADD COLUMN IF NOT EXISTS qr_token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS checked_in_by TEXT DEFAULT NULL;

-- 1.3 The Boardroom
ALTER TABLE public.registrations_the_boardroom
    ADD COLUMN IF NOT EXISTS qr_token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS checked_in_by TEXT DEFAULT NULL;

-- 1.4 Entre-Prenormie
ALTER TABLE public.registrations_entre_prenormie
    ADD COLUMN IF NOT EXISTS qr_token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS checked_in_by TEXT DEFAULT NULL;

-- 1.5 Bulls & Bears
ALTER TABLE public.registrations_bulls_and_bears
    ADD COLUMN IF NOT EXISTS qr_token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS checked_in_by TEXT DEFAULT NULL;

-- Ensure all existing rows get a unique QR token if null
UPDATE public.registrations_startup_roulette SET qr_token = gen_random_uuid() WHERE qr_token IS NULL;
UPDATE public.registrations_the_war_room SET qr_token = gen_random_uuid() WHERE qr_token IS NULL;
UPDATE public.registrations_the_boardroom SET qr_token = gen_random_uuid() WHERE qr_token IS NULL;
UPDATE public.registrations_entre_prenormie SET qr_token = gen_random_uuid() WHERE qr_token IS NULL;
UPDATE public.registrations_bulls_and_bears SET qr_token = gen_random_uuid() WHERE qr_token IS NULL;


-- 2. HIGH-SPEED INDEXES FOR DOOR SCANNERS & EMAIL LOOKUPS
CREATE INDEX IF NOT EXISTS idx_roulette_qr_token ON public.registrations_startup_roulette(qr_token);
CREATE INDEX IF NOT EXISTS idx_roulette_email ON public.registrations_startup_roulette(email);

CREATE INDEX IF NOT EXISTS idx_warroom_qr_token ON public.registrations_the_war_room(qr_token);
CREATE INDEX IF NOT EXISTS idx_warroom_email ON public.registrations_the_war_room(email);

CREATE INDEX IF NOT EXISTS idx_boardroom_qr_token ON public.registrations_the_boardroom(qr_token);
CREATE INDEX IF NOT EXISTS idx_boardroom_email ON public.registrations_the_boardroom(email);

CREATE INDEX IF NOT EXISTS idx_entre_qr_token ON public.registrations_entre_prenormie(qr_token);
CREATE INDEX IF NOT EXISTS idx_entre_email ON public.registrations_entre_prenormie(email);

CREATE INDEX IF NOT EXISTS idx_bulls_qr_token ON public.registrations_bulls_and_bears(qr_token);
CREATE INDEX IF NOT EXISTS idx_bulls_email ON public.registrations_bulls_and_bears(email);


-- 3. ROW LEVEL SECURITY (RLS) & VOLUNTEER CHECK-IN PERMISSIONS
ALTER TABLE public.registrations_startup_roulette ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations_the_war_room ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations_the_boardroom ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations_entre_prenormie ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations_bulls_and_bears ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public update registrations_startup_roulette" ON public.registrations_startup_roulette;
CREATE POLICY "Public update registrations_startup_roulette" ON public.registrations_startup_roulette FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public update registrations_the_war_room" ON public.registrations_the_war_room;
CREATE POLICY "Public update registrations_the_war_room" ON public.registrations_the_war_room FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public update registrations_the_boardroom" ON public.registrations_the_boardroom;
CREATE POLICY "Public update registrations_the_boardroom" ON public.registrations_the_boardroom FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public update registrations_entre_prenormie" ON public.registrations_entre_prenormie;
CREATE POLICY "Public update registrations_entre_prenormie" ON public.registrations_entre_prenormie FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public update registrations_bulls_and_bears" ON public.registrations_bulls_and_bears;
CREATE POLICY "Public update registrations_bulls_and_bears" ON public.registrations_bulls_and_bears FOR UPDATE USING (true);


-- 4. ADMINS & VOLUNTEERS AUTH ROLES
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'volunteer', 'superadmin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on admins table
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read admins" ON public.admins;
CREATE POLICY "Public read admins" ON public.admins FOR SELECT USING (true);

DO $$
BEGIN
    ALTER TABLE public.admins DROP CONSTRAINT IF EXISTS admins_role_check;
    ALTER TABLE public.admins ADD CONSTRAINT admins_role_check CHECK (role IN ('admin', 'volunteer', 'superadmin'));
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;
