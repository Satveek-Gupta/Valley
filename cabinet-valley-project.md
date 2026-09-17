# Cabinet Valley — Project Spec

Official event website for **Cabinet Valley**, a 3-day university fest organized by the Student Cabinet. Built as a Next.js monolith with Supabase, plus an internal admin panel for registrations, event content, and stall management.

> **v2 — theme replaced.** The Minecraft-inspired direction (and everything before it: Nether, floating-island, desi maximalism) is dropped entirely. Design direction is now a bold, flat, high-contrast "awards show" look, based on a specific reference. See §1 and §9.

---

## 1. Overview

| | |
|---|---|
| **Event name** | Cabinet Valley |
| **Organizer** | Student Cabinet |
| **Duration** | 3 days |
| **Public pages** | 2 — Landing page, Registration page |
| **Internal** | Admin panel (auth-gated) |
| **Architecture** | Next.js monolith (App Router) |
| **Database** | Supabase (Postgres + Auth + Storage) |
| **Theme** | Bold flat/neo-brutalist "awards show" — high-contrast black/white base, two saturated accent colors, oversized condensed display type. **Not** Minecraft, **not** glassmorphic. |

**Design reference:** a Dribbble concept for a gaming-awards event site (dark stats band, giant stacked hero wordmark, event carousel, bento-style timeline). Cabinet Valley should follow its structural pattern and typographic energy closely — same information architecture, same component vocabulary — reskinned with Cabinet Valley's own content, copy, and color choices rather than copied verbatim. Full breakdown in §9.

---

## 2. Tech Stack

- **Framework:** Next.js 15 (App Router), TypeScript, monolith structure (no separate backend)
- **Database/Auth/Storage:** Supabase (Postgres, Row Level Security, Supabase Auth for admin login, Storage for sponsor/event images)
- **UI:** Tailwind CSS + shadcn/ui as the component base
- **Motion/visual extras:** magicui.design components where they fit the flat style — `NumberTicker` (stats band, countdown), `Marquee` (sponsors), `BentoGrid` (timeline), `InteractiveHoverButton`/`ShinyButton` for CTAs. Skip the glossy/blur components (`MagicCard`, `BorderBeam`, `ShineBorder`) — they belong to the old glassmorphic direction, not this one.
- **Scroll/animation:** Lenis (smooth scroll) + GSAP/ScrollTrigger (sequenced/scroll-linked moments) + Motion for React (component-level UI, carousel interactions, `AnimatePresence`) — unchanged from prior decision, still the right stack for this direction too. No anime.js, no StringTune.
- **Forms:** react-hook-form + Zod for the registration form, including conditional/dynamic field groups per selected event
- **Layouts:** Bento grids for the timeline and events showcase; horizontal carousel for the events section

---

## 3. Site Map

### A. Landing Page (`/`)
1. **Header** — minimal: small logo mark, nav links in caps (Home / Events / Timeline / Sponsors / Register), sticky
2. **Hero** — oversized stacked/condensed wordmark ("CABINET VALLEY", tight leading, ghosted repeat line for depth), small accent-colored card (top-right or inline) holding quick stats + live countdown + "Register Now" CTA, event-name pill tags below the wordmark, one bold-caps intro line on what Cabinet Valley brings together, social row
3. **Stats band** — full-width black band, large bold numbers (3 Days / 6 Events / 40 Stalls, etc. — pull real figures from §5), small-caps labels underneath
4. **Events showcase** — horizontal scrollable carousel of the 6 events, center card scaled/highlighted in the accent color, arrow navigation, countdown+CTA repeated in the section header
5. **Spotlight section** *(optional — see §8)* — full-bleed accent-color block with a video/photo moment; only include if there's real content for it (e.g. a promo teaser or judge/mentor intros) — don't fabricate placeholder "winner" content for what may be a first edition
6. **Timeline — "The Road to Cabinet Valley"** — bento-grid layout: one large highlighted card for a featured moment + smaller uniform cards for the rest, each showing big date numbers, day label, and a detail/register link — this is where the full Day 1/2/3 breakdown from §5 lives
7. **Sponsors** — logo grid or marquee
8. **Prizes** — highlight cards reusing the stat-band/pill visual language
9. **CTA section** — short "join/register" block before the footer
10. **Footer** — full-bleed accent-color block: logo, link columns (Main Menu / Events / Help), countdown+CTA repeated, tag pills, socials, copyright

### B. Registration Page (`/register`)
Single form, dynamic sections based on selected event(s) — see §6 for exact fields. Restyled to the flat/bold system — no glass surfaces.

### C. Admin Panel (`/admin`, auth-gated via Supabase Auth)
Functional internal tool — doesn't need the marketing-site visual treatment. Clean shadcn defaults, brand accent colors for actions/status, no need for the stacked-type/carousel styling here.
1. **Dashboard** — total registrations, per-event breakdown, stall fill status
2. **Registrations** — table of all submissions, filter by event/day, view detail, export CSV
3. **Event management** — CRUD for event content that drives the public timeline and events showcase
4. **Stall management & bidding** — manage Bay Area stall inventory (50 Main Stalls in German Hangar), view stall registrations, allocate/confirm stalls, track payment status; extensible to points-based bidding (open question, see §8)
5. **Sponsors & Prizes** — CRUD for what's shown on the landing page
6. **Settings** — countdown target datetime, site content toggles

---

## 4. Event Selection (for registration & timeline)

- Startup Roulette
- The War Room
- The Boardroom
- Entre-Prenormie
- Bulls & Bears
- Bay Area

---

## 5. Event Content (Timeline Source Data)

### Day 1

**Bay Area**
- *Main Stalls* — Venue: German Hangar · 50 stalls · ₹4,000 per stall

**Startup Roulette**
- Team size: 5 members · Total teams: 12 · Winning teams: Top 3
- Round 1 — *Home Pitch*: teams pitch their own idea
- Round 2 — *Steal the Startup*: ideas are swapped between teams; each team pitches the idea assigned to them
- Round 3 — *Sell the Scam*: teams are given a bankrupt startup idea and must pitch it
- Rewards: Top 3 teams get physical certificates + goodies; best individual pitch wins a 3-month Founder's Office Internship

### Day 2

**Bay Area** — continues from Day 1

**The War Room**
- Team size: 5 members · Winning teams: TBD
- Round 1 — *The Bid*: teams get points and bid on items displayed on screen
- Round 2 — *The Pitch*: teams pitch the items they acquired; judges score the pitches
- Rewards: winning team gets a physical certificate; best individual pitch wins a 3-month Founder's Office Internship

**The Boardroom**
- Team size: 2 members · Winning teams: TBD
- Teams receive a case study and must analyze and solve it

### Day 3

**Entre-Prenormie**
- Format: 1-to-1 session with a founder · No teams · No winners
- All participants receive a digital certificate

**Bulls & Bears**
- Format: individual participation, no teams, no winners
- A stock market quiz — natural fit for a **live leaderboard** component (see §9), since it's individual and score-based unlike the other team events

**Rewarding Ceremony**
- Closes out the event

---

## 6. Registration Form Spec

*(source: provided requirements PDF — one submission per participant)*

**1. Basic Participant Details**
- Full Name
- Email ID
- Phone Number

**2. Event Selection** — multi-select
- Startup Roulette / The War Room / The Boardroom / Entre-Prenormie / Bulls & Bears / Bay Area

**3. Event-specific fields** (rendered conditionally per event selected)

| Event | Fields |
|---|---|
| Startup Roulette | Team Name, Team Leader Name, Team Members' Names, Idea Name, Idea Description |
| The War Room | Team Name, Team Leader Name, Team Members' Names |
| The Boardroom | Team Name, Team Leader Name, Team Members' Names |
| Entre-Prenormie | What would you like to discuss with the founder? *(optional)* |
| Bulls & Bears | None — individual registration only |
| Bay Area (stall registration) | Stall Name/Business Name, Contact Person, Phone Number |

**4. Confirmation**
- Required checkbox: "I confirm that the information provided is correct and agree to follow the rules and guidelines of Cabinet Valley."

**Explicit exclusion:** do **not** include a "How did you hear about Cabinet Valley?" field.

---

## 7. Proposed Supabase Schema

```sql
-- Event catalog, editable from admin, drives the public timeline
events (
  id, slug, name, day int, description text,
  team_size text, rounds jsonb, rewards text,
  sort_order int, created_at, updated_at
)

-- One row per registration submission
participants (
  id, full_name, email, phone, created_at
)

registrations (
  id, participant_id -> participants,
  confirmed_rules boolean,
  created_at
)

-- Junction: which events a registration covers, with event-specific
-- fields in a flexible jsonb column (team name, members, idea, etc.)
registration_events (
  id, registration_id -> registrations,
  event_slug, details jsonb,
  created_at
)

-- Bay Area stall inventory
stalls (
  id, type ('main'), label, price,
  status ('available' | 'pending' | 'allocated' | 'paid'),
  registration_event_id -> registration_events,
  created_at
)

-- Optional, only if stalls are actually auctioned rather than fixed-price
stall_bids (
  id, stall_id -> stalls, registration_event_id -> registration_events,
  bid_amount, status, created_at
)

sponsors ( id, name, logo_url, tier, link, sort_order )
admins ( id, email, role )  -- backed by Supabase Auth
```

---

## 8. Open Questions / Assumptions

- **Stall bidding:** the brief lists a fixed price (₹4,000/stall) for Main Stalls, which reads as fixed-price allocation rather than a true auction. Schema defaults to allocation (`stalls` table) with an optional `stall_bids` table if an actual bidding mechanic is wanted later.
- **Admin auth scope:** assuming Supabase Auth with a single `admin` role for now.
- **Countdown target:** assuming countdown targets Day 1 start; confirm exact date/time.
- **Payment collection:** stall fee (₹4,000) and any event fees aren't specified as collected on-site vs. via the form.
- **Spotlight section content (§3.5):** the reference design uses this slot for past-winner video stories. Confirm whether Cabinet Valley has equivalent content (teaser video, mentor/judge intros) or whether this section should be cut for a first edition.
- **Live leaderboard (§3, optional):** only build this if Bulls & Bears scoring is meant to be public/real-time — otherwise skip it, don't force the pattern in.

---

## 9. Design Direction

Reference is a Dribbble concept for a gaming-awards event site. The pattern worth carrying over is the **structure and typographic confidence**, not literal reuse of its copy, logo, or exact colors.

**What to take from it:**
- A dark full-width **stats band** with oversized bold numbers and small-caps labels underneath
- A **giant, condensed, all-caps hero wordmark** with tight leading and a ghosted/stacked repeat line behind the main line for depth — this is a deliberate, structural typographic system used consistently across the whole site, not a decorative one-off label. (This supersedes any earlier general guidance about avoiding all-caps labels — that guidance was about a *single* generic eyebrow tag bolted onto an otherwise default layout; here bold caps type is the entire visual identity, used everywhere on purpose.)
- **Pill-shaped tags** in flat solid colors for event/category names
- A **horizontal carousel** for the events showcase, with the centered card scaled up and highlighted in the accent color, simple arrow nav
- **Full-bleed accent-color block sections** breaking up white sections — sectioning done with solid color blocks, not gradients
- A **bento-grid timeline** — one large highlighted card + several smaller uniform cards, each carrying a big date number — this is the natural home for the Day 1/2/3 schedule
- Flat, hard-edged cards with generous corner radius — **no blur, no glass, no glow, no gradients.** Depth comes from color contrast and scale, not soft shadows.
- A recurring **countdown widget** (dark rounded card, DD:HH:MM:SS, last unit picked out in the second accent color) reused in the hero, the events section, and the footer
- Footer as a full-bleed accent-color block with organized link columns, the countdown+CTA repeated, and social icons

**Color tokens** (approximate — hex is a director's starting point, not exact-match-required):
```
bg base:         #FFFFFF
ink:              #0A0A0A   (text, stat band, hero wordmark)
accent primary:   #7C3AED   (violet — CTAs, active/highlighted cards, big color blocks)
accent secondary: #C6F135   (lime — countdown seconds, highlighted numbers, secondary CTA)
tag color A:      #FF5A36   (red-orange — pill tags only, never a large surface)
tag color B:      #2F6FED   (blue — pill tags only, never a large surface)
```
Keep large surfaces to white/black/violet. Lime and the two tag colors are accents used in small doses (numbers, pills, buttons) — if more than one large block uses a saturated color at once, it's off-brief.

**Typography:**
- Display: a heavy condensed grotesk, all-caps — **Anton** or **Archivo Black** (both free, easy Next.js/Google Fonts integration). Used at a huge scale for the hero and section headers, tight tracking, tight/overlapping leading for the stacked effect.
- Body/UI: a clean geometric sans — **Archivo** (pairs naturally with Archivo Black) or **Inter** — for paragraph copy, form labels, nav.
- Small-caps/uppercase tracking on labels and stat captions is intentional here, part of the same system as the display type — not a decorative afterthought.

**Motion notes (with the existing Lenis + GSAP + Motion stack):**
- Carousel: Motion drag/swipe or GSAP horizontal ScrollTrigger for the events showcase, with the active/centered card animating its scale and color fill
- Hero: subtle scroll-parallax offset between the main wordmark line and its ghosted repeat line (GSAP), not a fade — the stacked-type effect should feel like depth, not an entrance animation
- Hover states: flat color swaps and scale, not glow/shine — that belongs to the old glossy direction
- Keep `prefers-reduced-motion` handling from the earlier decision; it still applies here

**Carried over, unchanged:** avoid dot-joined meta strings, don't apply the same border-radius to every surface regardless of hierarchy, and don't fade-and-slide-up every single section — pick one or two orchestrated moments (the hero stack, the carousel) to be memorable and keep the rest of the motion quiet.
