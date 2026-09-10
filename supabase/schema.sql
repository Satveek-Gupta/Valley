-- Cabinet Valley Database Schema (Supabase / Postgres)
-- Run this in your Supabase SQL editor to create all tables, indexes, and RLS policies.

-- 1. Events Catalog
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    day INT NOT NULL CHECK (day BETWEEN 1 AND 3),
    tagline TEXT,
    description TEXT NOT NULL,
    team_size TEXT NOT NULL,
    format TEXT,
    rounds JSONB DEFAULT '[]'::jsonb,
    rewards TEXT,
    venue TEXT,
    timing TEXT,
    icon TEXT,
    badge_color TEXT DEFAULT '#7C3AED',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Participants
CREATE TABLE IF NOT EXISTS public.participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Registrations (Submissions)
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
    confirmed_rules BOOLEAN NOT NULL DEFAULT true,
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Registration Events (Junction for multi-selected events and event-specific form data)
CREATE TABLE IF NOT EXISTS public.registration_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
    event_slug TEXT NOT NULL REFERENCES public.events(slug) ON DELETE CASCADE,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Bay Area Stalls
CREATE TABLE IF NOT EXISTS public.stalls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stall_number TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('main', 'food')),
    venue TEXT NOT NULL,
    price INT NOT NULL DEFAULT 4000,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'pending', 'allocated', 'paid')),
    business_name TEXT,
    contact_person TEXT,
    phone TEXT,
    registration_id UUID REFERENCES public.registrations(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Sponsors
CREATE TABLE IF NOT EXISTS public.sponsors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    tier TEXT NOT NULL CHECK (tier IN ('title', 'platinum', 'gold', 'silver', 'associate')),
    logo_url TEXT NOT NULL,
    website_url TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Bulls & Bears Leaderboard (Simulated & Live)
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

-- 8. Seed Initial Data
INSERT INTO public.events (slug, name, day, tagline, description, team_size, format, rounds, rewards, venue, timing, icon, badge_color, sort_order)
VALUES
(
    'startup-roulette',
    'Startup Roulette',
    1,
    'Fast-paced pitch pivot challenge',
    'Teams pitch their startup, then ideas are swapped in Round 2, ending with pitching a bankrupt startup in Sell the Scam.',
    '5 members (12 teams max)',
    '3 Rounds',
    '[
        {"round": 1, "title": "Home Pitch", "desc": "Teams pitch their own original startup concept to the panel."},
        {"round": 2, "title": "Steal the Startup", "desc": "Ideas are randomly swapped between teams; pitch your competitor idea."},
        {"round": 3, "title": "Sell the Scam", "desc": "Receive a famous bankrupt startup idea and convince the jury it is viable."}
    ]'::jsonb,
    'Top 3 teams win physical certificates + goodies. Best Individual Pitch wins a 3-month Founder''s Office Internship.',
    'Main Auditorium',
    'Day 1 · 11:00 AM - 4:00 PM',
    'Sparkles',
    '#FF5A36',
    1
),
(
    'bay-area',
    'Bay Area Stalls',
    1,
    '40+ high-energy student & brand storefronts',
    'The premier marketplace & startup exhibition floor of Cabinet Valley running across Day 1 & Day 2.',
    'Individual or Team',
    'Exhibition Floor',
    '[
        {"round": 1, "title": "Main Stalls", "desc": "German Hangar · 40 curated stalls @ ₹4,000 per stall."},
        {"round": 2, "title": "Food Stalls", "desc": "D5 Stage Ground · Continuous live stalls till 6:00 PM."}
    ]'::jsonb,
    'Maximum footfall exhibition, direct student sales, brand partnerships.',
    'German Hangar & D5 Stage',
    'Day 1 & 2 · 10:00 AM - 6:00 PM',
    'Store',
    '#7C3AED',
    2
),
(
    'the-war-room',
    'The War Room',
    2,
    'High-stakes bidding & impromptu product pitching',
    'Teams receive points to bid on mystery assets, then immediately construct and present a market strategy under pressure.',
    '5 members',
    '2 Rounds',
    '[
        {"round": 1, "title": "The Bid", "desc": "Teams receive points budget and bid live on high-value asset packages."},
        {"round": 2, "title": "The Pitch", "desc": "Pitch the acquired asset portfolio to venture judges under time pressure."}
    ]'::jsonb,
    'Winning team receives physical certificates. Best Individual Pitch wins a 3-month Founder''s Office Internship.',
    'Strategy Arena - Hall B',
    'Day 2 · 11:00 AM - 3:30 PM',
    'Swords',
    '#2F6FED',
    3
),
(
    'the-boardroom',
    'The Boardroom',
    2,
    'Executive case-study simulation',
    'Duos receive an intense real-world corporate dilemma and must present their diagnostic framework to industry veterans.',
    '2 members',
    'Case Resolution',
    '[
        {"round": 1, "title": "Crisis Briefing", "desc": "Receive confidential case study file and 90-minute analysis window."},
        {"round": 2, "title": "Executive Presentation", "desc": "Present strategic turnaround roadmap directly to the mock board."}
    ]'::jsonb,
    'Winning duos receive physical certificates + venture mentorship access.',
    'Executive Conference Suite',
    'Day 2 · 2:00 PM - 5:30 PM',
    'Briefcase',
    '#FF5A36',
    4
),
(
    'entre-prenormie',
    'Entre-Prenormie',
    3,
    '1-on-1 intimate founder dialogues',
    'Exclusive closed-room 1-on-1 mentorship sessions between students and top tech founders.',
    'Individual (1-on-1)',
    'Direct Mentorship',
    '[
        {"round": 1, "title": "Founder Dialogue", "desc": "Curated 1-to-1 deep dive into career, fundraising, or product feedback."}
    ]'::jsonb,
    'All participants receive verified digital certificates signed by the founders.',
    'Mentor Lounge - Block 4',
    'Day 3 · 10:00 AM - 1:00 PM',
    'Users',
    '#7C3AED',
    5
),
(
    'bulls-and-bears',
    'Bulls & Bears',
    3,
    'Real-time stock market quiz & trading battle',
    'Fast-paced individual financial quiz and trading simulation with dynamic leaderboard.',
    'Individual only',
    'Speed Quiz & Trading',
    '[
        {"round": 1, "title": "Market Sprint", "desc": "Speed financial analysis quiz with live ticker updates."},
        {"round": 2, "title": "Portfolio Run", "desc": "Rapid market scenario simulation for highest return on capital."}
    ]'::jsonb,
    'Certificate of Financial Mastery + featured spot on Cabinet Wall of Fame.',
    'Terminal Lab 1',
    'Day 3 · 1:30 PM - 3:30 PM',
    'TrendingUp',
    '#C6F135',
    6
)
ON CONFLICT (slug) DO NOTHING;

-- Seed Stalls (Main 1-40 + Food 1-10)
INSERT INTO public.stalls (stall_number, type, venue, price, status)
SELECT 
    'M-' || LPAD(n::text, 2, '0'),
    'main',
    'German Hangar',
    4000,
    CASE WHEN n IN (3, 7, 12, 18, 24, 31) THEN 'allocated' ELSE 'available' END
FROM generate_series(1, 40) AS n
ON CONFLICT (stall_number) DO NOTHING;

INSERT INTO public.stalls (stall_number, type, venue, price, status)
SELECT 
    'F-' || LPAD(n::text, 2, '0'),
    'food',
    'D5 Stage Ground',
    4000,
    CASE WHEN n IN (1, 4, 8) THEN 'allocated' ELSE 'available' END
FROM generate_series(1, 10) AS n
ON CONFLICT (stall_number) DO NOTHING;

-- Seed Leaderboard
INSERT INTO public.leaderboard (player_name, handle, score, portfolio_value, rank)
VALUES
('Aditya Verma', '@adityav', 9850, 482500.00, 1),
('Sneha Rao', '@sneharao_fin', 9420, 421000.00, 2),
('Kabir Sharma', '@kabir_trader', 9100, 395400.00, 3),
('Ananya Deshmukh', '@ananya_d', 8850, 360000.00, 4),
('Rohan Mehta', '@rohanm_quant', 8600, 342100.00, 5);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stalls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
CREATE POLICY "Public read events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Public read stalls" ON public.stalls FOR SELECT USING (true);
CREATE POLICY "Public read sponsors" ON public.sponsors FOR SELECT USING (true);
CREATE POLICY "Public read leaderboard" ON public.leaderboard FOR SELECT USING (true);

-- Public Insert Policies (for registration submissions)
CREATE POLICY "Public insert participants" ON public.participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert registrations" ON public.registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert registration_events" ON public.registration_events FOR INSERT WITH CHECK (true);
