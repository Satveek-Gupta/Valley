-- Cabinet Valley Database Schema (Supabase / Postgres)
-- Run this in your Supabase SQL editor to create all event-specific tables, indexes, and RLS policies.

-- ==============================================================================
-- 1. SEPARATE EVENT REGISTRATION TABLES
-- ==============================================================================

-- 1.1 Startup Roulette Registrations
CREATE TABLE IF NOT EXISTS public.registrations_startup_roulette (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    team_name TEXT NOT NULL,
    team_leader_name TEXT NOT NULL,
    team_members_names TEXT NOT NULL,
    idea_name TEXT,
    idea_description TEXT,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure nullable columns if table was created previously with NOT NULL
ALTER TABLE public.registrations_startup_roulette ALTER COLUMN idea_name DROP NOT NULL;
ALTER TABLE public.registrations_startup_roulette ALTER COLUMN idea_description DROP NOT NULL;

-- 1.2 The War Room Registrations
CREATE TABLE IF NOT EXISTS public.registrations_the_war_room (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    team_name TEXT NOT NULL,
    team_leader_name TEXT NOT NULL,
    team_members_names TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.3 The Boardroom Registrations
CREATE TABLE IF NOT EXISTS public.registrations_the_boardroom (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    team_name TEXT NOT NULL,
    team_leader_name TEXT NOT NULL,
    partner_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.4 Entre-Prenormie Registrations
CREATE TABLE IF NOT EXISTS public.registrations_entre_prenormie (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    founder_discussion_topic TEXT,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.5 Bulls & Bears Registrations
CREATE TABLE IF NOT EXISTS public.registrations_bulls_and_bears (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 2. DYNAMIC EVENTS & TRACKS CATALOG
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    day INT NOT NULL CHECK (day BETWEEN 1 AND 3),
    date_label TEXT,
    tagline TEXT,
    description TEXT NOT NULL,
    team_size TEXT NOT NULL,
    format TEXT,
    venue TEXT,
    timing TEXT,
    badge_color TEXT DEFAULT '#7C3AED',
    tag_type TEXT DEFAULT 'violet',
    icon_name TEXT DEFAULT 'Sparkles',
    rounds JSONB DEFAULT '[]'::jsonb,
    rewards JSONB DEFAULT '[]'::jsonb,
    internship_opportunity TEXT,
    featured BOOLEAN DEFAULT false,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure newly added columns exist if table was previously created
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS date_label TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS tag_type TEXT DEFAULT 'violet';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS icon_name TEXT DEFAULT 'Sparkles';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS internship_opportunity TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS rewards JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS rounds JSONB DEFAULT '[]'::jsonb;

-- ==============================================================================
-- 3. BAY AREA STALLS (FLOOR PLAN & STALL MANAGEMENT)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.stalls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stall_number TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL DEFAULT 'main' CHECK (type IN ('main')),
    venue TEXT NOT NULL DEFAULT 'Near C5 & D5 Hostels',
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'pending', 'allocated', 'paid')),
    business_name TEXT,
    contact_person TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sponsors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    tier TEXT NOT NULL DEFAULT 'Partner',
    category TEXT DEFAULT 'Ecosystem',
    logo_url TEXT,
    website_url TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add any missing columns to existing sponsors table
ALTER TABLE public.sponsors ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'Partner';
ALTER TABLE public.sponsors ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Ecosystem';
ALTER TABLE public.sponsors ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE public.sponsors ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.sponsors ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;
ALTER TABLE public.sponsors ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Drop constraints from older schema versions
ALTER TABLE public.sponsors ALTER COLUMN logo_url DROP NOT NULL;
ALTER TABLE public.sponsors DROP CONSTRAINT IF EXISTS sponsors_tier_check;

CREATE TABLE IF NOT EXISTS public.leaderboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_name TEXT NOT NULL,
    handle TEXT NOT NULL,
    score INT NOT NULL,
    portfolio_value NUMERIC(12, 2) NOT NULL,
    rank INT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. SEED INITIAL EVENTS
-- ==============================================================================
INSERT INTO public.events (
    slug, name, day, date_label, tagline, description, team_size, format,
    venue, timing, badge_color, tag_type, icon_name, rounds, rewards,
    internship_opportunity, featured, sort_order
)
VALUES
(
    'startup-roulette',
    'STARTUP ROULETTE',
    1,
    'DAY 01',
    'Fast-Paced Pitch Pivot Challenge',
    'Pitch your own startup, swap decks with a rival in Round 2, and defend a notorious bankrupt startup in Sell the Scam.',
    '5 Members (12 Teams Max)',
    '3 Elimination Rounds',
    'Main Auditorium',
    '11:00 AM – 4:00 PM',
    '#FF5A36',
    'orange',
    'Sparkles',
    '[
        {"round": 1, "title": "Home Pitch", "desc": "Teams deliver their original 3-minute venture pitch to the investor jury."},
        {"round": 2, "title": "Steal the Startup", "desc": "Startup decks are randomly shuffled. Defend and pitch your competitor''s idea."},
        {"round": 3, "title": "Sell the Scam", "desc": "Receive a famous collapsed startup (Theranos, WeWork, FTX) and pitch it as viable."}
    ]'::jsonb,
    '[
        "Top 3 Teams: Physical Certificates & Exclusive Goodies",
        "Best Individual Pitch: 3-Month Founder''s Office Internship"
    ]'::jsonb,
    '3-Month Founder''s Office Internship',
    true,
    1
),
(
    'bay-area',
    'BAY AREA STALLS',
    1,
    'DAY 01 & 02',
    '55 Premier High-Footfall Commercial & Startup Stalls',
    'The premier marketplace & startup exhibition floor of Cabinet Valley running across Day 1 & Day 2 (Near C5 & D5 Hostels).',
    'Individual or Team',
    'Exhibition Floor',
    'Near C5 & D5 Hostels',
    '10:00 AM – 6:00 PM',
    '#7C3AED',
    'violet',
    'Store',
    '[
        {"round": 1, "title": "Main Stalls", "desc": "Near C5 & D5 Hostels · 55 curated stalls · Application via MS Forms."}
    ]'::jsonb,
    '[
        "Maximum footfall exhibition, direct student sales, brand partnerships."
    ]'::jsonb,
    NULL,
    false,
    2
),
(
    'the-war-room',
    'THE WAR ROOM',
    2,
    'DAY 02',
    'Strategic High-Stakes Turnaround & Pitching Simulation',
    'Teams receive points to bid on mystery assets, then immediately construct and present a market strategy under pressure.',
    '5 Members',
    '2 Rounds',
    'Strategy Arena - Hall B',
    '11:00 AM – 3:30 PM',
    '#2F6FED',
    'blue',
    'Swords',
    '[
        {"round": 1, "title": "The Bid", "desc": "Teams receive points budget and bid live on high-value asset packages."},
        {"round": 2, "title": "The Pitch", "desc": "Pitch the acquired asset portfolio to venture judges under time pressure."}
    ]'::jsonb,
    '[
        "Winning Team: Physical Certificates & Exclusive Goodies",
        "Best Individual Pitch: 3-Month Founder''s Office Internship"
    ]'::jsonb,
    '3-Month Founder''s Office Internship',
    false,
    3
),
(
    'the-boardroom',
    'THE BOARDROOM',
    2,
    'DAY 02',
    'Executive Case-Study Resolution Simulation',
    'Duos receive an intense real-world corporate dilemma and must present their diagnostic framework to industry veterans.',
    '2 Members (Duos)',
    'Case Resolution',
    'Executive Conference Suite',
    '2:00 PM – 5:30 PM',
    '#FF5A36',
    'orange',
    'Briefcase',
    '[
        {"round": 1, "title": "Crisis Briefing", "desc": "Receive confidential case study file and 90-minute analysis window."},
        {"round": 2, "title": "Executive Presentation", "desc": "Present strategic turnaround roadmap directly to the mock board."}
    ]'::jsonb,
    '[
        "Winning Duos: Physical Certificates & Venture Mentorship Access"
    ]'::jsonb,
    NULL,
    false,
    4
),
(
    'entre-prenormie',
    'ENTRE-PRENORMIE',
    3,
    'DAY 03',
    'Intimate 1-on-1 Founder Dialogues',
    'Exclusive closed-room 1-on-1 mentorship sessions between students and top tech founders.',
    'Individual (1-on-1)',
    'Direct Mentorship',
    'Mentor Lounge - Block 4',
    '10:00 AM – 1:00 PM',
    '#7C3AED',
    'violet',
    'Users',
    '[
        {"round": 1, "title": "Founder Dialogue", "desc": "Curated 1-to-1 deep dive into career, fundraising, or product feedback."}
    ]'::jsonb,
    '[
        "All Participants: Verified Digital Certificates Signed by Founders"
    ]'::jsonb,
    NULL,
    false,
    5
),
(
    'bulls-and-bears',
    'BULLS & BEARS',
    3,
    'DAY 03',
    'Real-Time Stock Market Quiz & Trading Battle',
    'Fast-paced individual financial quiz and trading simulation with dynamic leaderboard.',
    'Individual Only',
    'Speed Quiz & Trading',
    'Terminal Lab 1',
    '1:30 PM – 3:30 PM',
    '#C6F135',
    'lime',
    'TrendingUp',
    '[
        {"round": 1, "title": "Market Sprint", "desc": "Speed financial analysis quiz with live ticker updates."},
        {"round": 2, "title": "Portfolio Run", "desc": "Rapid market scenario simulation for highest return on capital."}
    ]'::jsonb,
    '[
        "Certificate of Financial Mastery + Featured spot on Cabinet Wall of Fame"
    ]'::jsonb,
    NULL,
    false,
    6
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    day = EXCLUDED.day,
    date_label = EXCLUDED.date_label,
    tagline = EXCLUDED.tagline,
    description = EXCLUDED.description,
    team_size = EXCLUDED.team_size,
    format = EXCLUDED.format,
    venue = EXCLUDED.venue,
    timing = EXCLUDED.timing,
    badge_color = EXCLUDED.badge_color,
    tag_type = EXCLUDED.tag_type,
    icon_name = EXCLUDED.icon_name,
    rounds = EXCLUDED.rounds,
    rewards = EXCLUDED.rewards,
    internship_opportunity = EXCLUDED.internship_opportunity,
    featured = EXCLUDED.featured,
    sort_order = EXCLUDED.sort_order;

-- Seed Stalls (Main 1-55)
INSERT INTO public.stalls (stall_number, type, venue, status)
SELECT 
    'M-' || LPAD(n::text, 2, '0'),
    'main',
    'Near C5 & D5 Hostels',
    'available'
FROM generate_series(1, 55) AS n
ON CONFLICT (stall_number) DO NOTHING;

-- ==============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stalls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations_startup_roulette ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations_the_war_room ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations_the_boardroom ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations_entre_prenormie ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations_bulls_and_bears ENABLE ROW LEVEL SECURITY;

-- 6.1 Public Read (SELECT) Policies
DROP POLICY IF EXISTS "Public read events" ON public.events;
CREATE POLICY "Public read events" ON public.events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read stalls" ON public.stalls;
CREATE POLICY "Public read stalls" ON public.stalls FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read sponsors" ON public.sponsors;
CREATE POLICY "Public read sponsors" ON public.sponsors FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read leaderboard" ON public.leaderboard;
CREATE POLICY "Public read leaderboard" ON public.leaderboard FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read registrations_startup_roulette" ON public.registrations_startup_roulette;
CREATE POLICY "Public read registrations_startup_roulette" ON public.registrations_startup_roulette FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read registrations_the_war_room" ON public.registrations_the_war_room;
CREATE POLICY "Public read registrations_the_war_room" ON public.registrations_the_war_room FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read registrations_the_boardroom" ON public.registrations_the_boardroom;
CREATE POLICY "Public read registrations_the_boardroom" ON public.registrations_the_boardroom FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read registrations_entre_prenormie" ON public.registrations_entre_prenormie;
CREATE POLICY "Public read registrations_entre_prenormie" ON public.registrations_entre_prenormie FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read registrations_bulls_and_bears" ON public.registrations_bulls_and_bears;
CREATE POLICY "Public read registrations_bulls_and_bears" ON public.registrations_bulls_and_bears FOR SELECT USING (true);

-- 6.2 Public Insert (INSERT) Policies
DROP POLICY IF EXISTS "Public insert events" ON public.events;
CREATE POLICY "Public insert events" ON public.events FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public insert sponsors" ON public.sponsors;
CREATE POLICY "Public insert sponsors" ON public.sponsors FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public insert registrations_startup_roulette" ON public.registrations_startup_roulette;
CREATE POLICY "Public insert registrations_startup_roulette" ON public.registrations_startup_roulette FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public insert registrations_the_war_room" ON public.registrations_the_war_room;
CREATE POLICY "Public insert registrations_the_war_room" ON public.registrations_the_war_room FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public insert registrations_the_boardroom" ON public.registrations_the_boardroom;
CREATE POLICY "Public insert registrations_the_boardroom" ON public.registrations_the_boardroom FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public insert registrations_entre_prenormie" ON public.registrations_entre_prenormie;
CREATE POLICY "Public insert registrations_entre_prenormie" ON public.registrations_entre_prenormie FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public insert registrations_bulls_and_bears" ON public.registrations_bulls_and_bears;
CREATE POLICY "Public insert registrations_bulls_and_bears" ON public.registrations_bulls_and_bears FOR INSERT WITH CHECK (true);

-- 6.3 Update (UPDATE) Policies
DROP POLICY IF EXISTS "Public update events" ON public.events;
CREATE POLICY "Public update events" ON public.events FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public update sponsors" ON public.sponsors;
CREATE POLICY "Public update sponsors" ON public.sponsors FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public update stalls" ON public.stalls;
CREATE POLICY "Public update stalls" ON public.stalls FOR UPDATE USING (true);

-- 6.4 Admin / Public Delete (DELETE) Policies
DROP POLICY IF EXISTS "Public delete events" ON public.events;
CREATE POLICY "Public delete events" ON public.events FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public delete sponsors" ON public.sponsors;
CREATE POLICY "Public delete sponsors" ON public.sponsors FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public delete registrations_startup_roulette" ON public.registrations_startup_roulette;
CREATE POLICY "Public delete registrations_startup_roulette" ON public.registrations_startup_roulette FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public delete registrations_the_war_room" ON public.registrations_the_war_room;
CREATE POLICY "Public delete registrations_the_war_room" ON public.registrations_the_war_room FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public delete registrations_the_boardroom" ON public.registrations_the_boardroom;
CREATE POLICY "Public delete registrations_the_boardroom" ON public.registrations_the_boardroom FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public delete registrations_entre_prenormie" ON public.registrations_entre_prenormie;
CREATE POLICY "Public delete registrations_entre_prenormie" ON public.registrations_entre_prenormie FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public delete registrations_bulls_and_bears" ON public.registrations_bulls_and_bears;
CREATE POLICY "Public delete registrations_bulls_and_bears" ON public.registrations_bulls_and_bears FOR DELETE USING (true);

-- ==============================================================================
-- 7. SEED DEFAULT SPONSORS
-- ==============================================================================
INSERT INTO public.sponsors (name, tier, category, sort_order)
VALUES
    ('Apex Ventures', 'Title Partner', 'Venture Capital', 1),
    ('Nexus Cloud', 'Infrastructure Partner', 'Cloud & AI', 2),
    ('Zephyr FinTech', 'Track Partner', 'Trading & Banking', 3),
    ('Pulse Beverage', 'Hydration Partner', 'F&B', 4),
    ('Krypton Labs', 'Ecosystem Partner', 'Web3 & Security', 5),
    ('Founders Guild', 'Incubation Partner', 'Accelerators', 6),
    ('Vanguard Media', 'Broadcast Partner', 'Media', 7)
ON CONFLICT DO NOTHING;
