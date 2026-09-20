export interface EventItem {
  id: string;
  slug: string;
  name: string;
  day: number;
  dateLabel: string;
  tagline: string;
  description: string;
  teamSize: string;
  format: string;
  venue: string;
  timing: string;
  badgeColor: string;
  tagType: "orange" | "blue" | "lime" | "violet";
  iconName: string;
  rounds: {
    round: number;
    title: string;
    desc: string;
  }[];
  rewards: string[];
  internshipOpportunity?: string;
  featured?: boolean;
}

export const EVENTS_DATA: EventItem[] = [
  {
    id: "startup-roulette",
    slug: "startup-roulette",
    name: "STARTUP ROULETTE",
    day: 1,
    dateLabel: "DAY 01",
    tagline: "Fast-Paced Pitch Pivot Challenge",
    description: "Pitch your own startup, swap decks with a rival in Round 2, and defend a notorious bankrupt startup in Sell the Scam.",
    teamSize: "3–5 Members (12 Teams Max)",
    format: "3 Elimination Rounds",
    venue: "Main Auditorium",
    timing: "11:00 AM – 4:00 PM",
    badgeColor: "#FF5A36",
    tagType: "orange",
    iconName: "Sparkles",
    featured: true,
    rounds: [
      { round: 1, title: "Home Pitch", desc: "Teams deliver their original 3-minute venture pitch to the investor jury." },
      { round: 2, title: "Steal the Startup", desc: "Startup decks are randomly shuffled. Defend and pitch your competitor's idea." },
      { round: 3, title: "Sell the Scam", desc: "Receive a famous collapsed startup (Theranos, WeWork, FTX) and pitch it as viable." }
    ],
    rewards: [
      "Top 3 Teams: Physical Certificates & Exclusive Goodies",
      "Best Individual Pitch: 3-Month Founder's Office Internship"
    ],
    internshipOpportunity: "3-Month Founder's Office Internship"
  },
  {
    id: "bay-area",
    slug: "bay-area",
    name: "BAY AREA STALLS",
    day: 1,
    dateLabel: "DAY 01 & 02",
    tagline: "55 Premier High-Footfall Commercial & Startup Stalls",
    description: "The commercial heartbeat of Cabinet Valley. Student startups, brand pop-ups, and merchandise booths across 2 high-energy days.",
    teamSize: "Individual / Startup Teams",
    format: "2-Day Expo Floor",
    venue: "Near C5 & D5 Hostels",
    timing: "10:00 AM – 6:00 PM",
    badgeColor: "#7C3AED",
    tagType: "violet",
    iconName: "Store",
    featured: true,
    rounds: [
      { round: 1, title: "Main Stalls (55 Units)", desc: "Near C5 & D5 Hostels · 55 curated stalls · Dedicated power & spotlight booths." }
    ],

    rewards: [
      "Guaranteed footfall of 2,000+ students & visitors",
      "Direct commerce, brand activation & merchant recognition"
    ]
  },
  {
    id: "the-war-room",
    slug: "the-war-room",
    name: "THE WAR ROOM",
    day: 2,
    dateLabel: "DAY 02",
    tagline: "High-Stakes Live Asset Bidding & Emergency Pitching",
    description: "Points-based auction strategy: bid on mystery corporate assets, formulate a turnaround plan, and pitch to emergency turnaround judges.",
    teamSize: "3–5 Members",
    format: "2 Elimination Rounds",
    venue: "Strategy Arena - Hall B",
    timing: "11:00 AM – 3:30 PM",
    badgeColor: "#2F6FED",
    tagType: "blue",
    iconName: "Swords",
    rounds: [
      { round: 1, title: "The Asset Auction", desc: "Teams receive initial points to bid on distressed tech companies and real-world IP." },
      { round: 2, title: "Turnaround Pitch", desc: "Teams deliver a 4-minute crisis pitch to venture judges explaining how they will rebuild the asset." }
    ],
    rewards: [
      "Top Team: Physical Certificates & Exclusive Goodies",
      "Best Individual Negotiator: 3-Month Founder's Office Internship"
    ],
    internshipOpportunity: "3-Month Founder's Office Internship"
  },
  {
    id: "the-boardroom",
    slug: "the-boardroom",
    name: "THE BOARDROOM",
    day: 2,
    dateLabel: "DAY 02",
    tagline: "Executive Case-Study Resolution Simulation",
    description: "High-intensity corporate problem solving: receive a real-world enterprise crisis file and pitch your turnaround framework to the executive board.",
    teamSize: "2 Members (Duos)",
    format: "Case Resolution",
    venue: "Executive Conference Suite",
    timing: "2:00 PM – 5:30 PM",
    badgeColor: "#FF5A36",
    tagType: "orange",
    iconName: "Briefcase",
    rounds: [
      { round: 1, title: "Crisis Dossier Analysis", desc: "Duos receive confidential business dilemma and 90-minute structured analysis window." },
      { round: 2, title: "Board Presentation", desc: "Present strategic diagnostic framework and actionable roadmap directly to the mock board." }
    ],
    rewards: [
      "Winning Duos: Physical Certificates & Direct Venture Mentorship Access"
    ]
  },
  {
    id: "entre-prenormie",
    slug: "entre-prenormie",
    name: "ENTREPRE-NORMIE",
    day: 3,
    dateLabel: "DAY 03",
    tagline: "Intimate 1-on-1 Founder Dialogues",
    description: "Exclusive closed-room 1-on-1 mentorship sessions between students and top tech founders to dissect startups, fundraising, and career blueprints.",
    teamSize: "Individual (1-on-1)",
    format: "Direct Mentorship",
    venue: "Mentor Lounge - Block 4",
    timing: "10:00 AM – 1:00 PM",
    badgeColor: "#7C3AED",
    tagType: "violet",
    iconName: "Users",
    rounds: [
      { round: 1, title: "Founder Dialogue", desc: "Curated 1-to-1 deep dive into career, fundraising, or product feedback with seasoned entrepreneurs." }
    ],
    rewards: [
      "All Participants: Verified Digital Certificates Signed by Mentors"
    ]
  },
  {
    id: "bulls-and-bears",
    slug: "bulls-and-bears",
    name: "BULLS & BEARS",
    day: 3,
    dateLabel: "DAY 03",
    tagline: "Real-Time Stock Market Quiz & Trading Battle",
    description: "Fast-paced financial trivia and portfolio management simulation with dynamic live leaderboard and real-time market shift scenarios.",
    teamSize: "Individual Only",
    format: "Speed Quiz & Trading",
    venue: "Terminal Lab 1",
    timing: "1:30 PM – 3:30 PM",
    badgeColor: "#C6F135",
    tagType: "lime",
    iconName: "TrendingUp",
    rounds: [
      { round: 1, title: "Market Sprint", desc: "Fast-paced financial analysis quiz with live ticker updates and elimination rounds." },
      { round: 2, title: "Portfolio Run", desc: "Rapid capital allocation game testing market intuition under sudden volatility spikes." }
    ],
    rewards: [
      "Certificate of Financial Mastery + Featured spot on Cabinet Wall of Fame"
    ]
  }
];

export const TIMELINE_SCHEDULE = [
  {
    dayNumber: "01",
    dayTitle: "DAY ONE",
    date: "SEPTEMBER 24, 2026",
    summary: "Kickoff, Bay Area Expo Inauguration & Startup Roulette",
    featuredEvent: EVENTS_DATA[0],
    subEvents: [
      {
        time: "10:00 AM",
        name: "Bay Area Grand Opening",
        venue: "Near C5 & D5 Hostels",
        type: "Expo",
        badgeColor: "#7C3AED"
      },
      {
        time: "11:00 AM – 4:00 PM",
        name: "Startup Roulette: Rounds 1-3",
        venue: "Main Auditorium",
        type: "Pitch",
        badgeColor: "#FF5A36"
      },
      {
        time: "All Day till 6:00 PM",
        name: "Commercial Showcase & Expo",
        venue: "Near C5 & D5 Hostels",
        type: "Networking",
        badgeColor: "#C6F135"
      }
    ]
  },
  {
    dayNumber: "02",
    dayTitle: "DAY TWO",
    date: "SEPTEMBER 25, 2026",
    summary: "The War Room Asset Bidding & The Boardroom Case Resolution",
    featuredEvent: EVENTS_DATA[2],
    subEvents: [
      {
        time: "10:00 AM – 6:00 PM",
        name: "Bay Area Stalls Day 2",
        venue: "Near C5 & D5 Hostels",
        type: "Expo",
        badgeColor: "#7C3AED"
      },
      {
        time: "11:00 AM – 3:30 PM",
        name: "The War Room: Auction & Pitch",
        venue: "Strategy Arena - Hall B",
        type: "Bidding",
        badgeColor: "#2F6FED"
      },
      {
        time: "2:00 PM – 5:30 PM",
        name: "The Boardroom: Crisis Case Crack",
        venue: "Executive Suite A",
        type: "Case Study",
        badgeColor: "#FF5A36"
      }
    ]
  },
  {
    dayNumber: "03",
    dayTitle: "DAY THREE",
    date: "SEPTEMBER 26, 2026",
    summary: "Founder Mentorship, Bulls & Bears Quiz, Grand Rewarding Ceremony",
    featuredEvent: EVENTS_DATA[5],
    subEvents: [
      {
        time: "10:00 AM – 1:00 PM",
        name: "Entrepre-Normie: 1-on-1 Sessions",
        venue: "Founder Lounge",
        type: "Mentorship",
        badgeColor: "#7C3AED"
      },
      {
        time: "1:30 PM – 3:30 PM",
        name: "Bulls & Bears Trading Battle",
        venue: "Terminal Lab 1",
        type: "Trading Sim",
        badgeColor: "#C6F135"
      },
      {
        time: "5:00 PM – 7:30 PM",
        name: "Grand Rewarding Ceremony & Fest Finale",
        venue: "Grand Open Air Arena",
        type: "Ceremony",
        badgeColor: "#0A0A0A"
      }
    ]
  }
];

export const STATS_METRICS = [
  { value: "3 DAYS", label: "TOTAL DURATION", highlight: false },
  { value: "7 EVENTS", label: "COMPETITIONS & EXPO", highlight: true },
  { value: "55 STALLS", label: "BAY AREA FLOOR", highlight: false },
  { value: "OFFICIAL", label: "CERTIFICATES & GOODIES", highlight: false },
  { value: "15,000+", label: "ATTENDEES EXPECTED", highlight: false }
];

export interface LeaderboardItem {
  rank: number;
  name: string;
  handle: string;
  score: number;
  portfolio: string;
  change: string;
  badge: string;
}

export const LEADERBOARD_PREVIEW: LeaderboardItem[] = [];

export const SPONSORS_LIST = [
  { name: "Apex Ventures", tier: "Title Partner", category: "Venture Capital" },
  { name: "Nexus Cloud", tier: "Infrastructure Partner", category: "Cloud & AI" },
  { name: "Zephyr FinTech", tier: "Track Partner", category: "Trading & Banking" },
  { name: "Pulse Beverage", tier: "Hydration Partner", category: "F&B" },
  { name: "Krypton Labs", tier: "Ecosystem Partner", category: "Web3 & Security" },
  { name: "Founders Guild", tier: "Incubation Partner", category: "Accelerators" },
  { name: "Vanguard Media", tier: "Broadcast Partner", category: "Media" }
];

export const PRIZE_HIGHLIGHTS = [
  {
    title: "Founder's Office Internships",
    category: "Exclusive Opportunity",
    highlight: "Direct Placement & Mentorship",
    description: "Top-performing pitchers and winners secure direct tenure working inside the Founder's Office of tier-1 startups and venture-backed companies.",
    badgeColor: "#FF5A36"
  }
];
