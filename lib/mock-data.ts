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
    teamSize: "5 Members (12 Teams Max)",
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
    tagline: "50+ Premier High-Footfall Commercial & Food Stalls",
    description: "The commercial heartbeat of Cabinet Valley. Student startups, brand pop-ups, merchandise booths, and culinary outlets across 2 high-energy days.",
    teamSize: "Individual / Startup Teams",
    format: "2-Day Expo Floor",
    venue: "German Hangar & D5 Stage Ground",
    timing: "10:00 AM – 6:00 PM",
    badgeColor: "#7C3AED",
    tagType: "violet",
    iconName: "Store",
    featured: true,
    rounds: [
      { round: 1, title: "Main Stalls (50 Units)", desc: "German Hangar · ₹4,000 per stall · Dedicated power & spotlight booths." },
      { round: 2, title: "Food Stalls", desc: "D5 Stage Ground · Continuous live festival dining till 6:00 PM." }
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
    description: "Teams receive initial point reserves, battle in real-time blind bidding for business assets, and immediately craft market go-to strategies.",
    teamSize: "5 Members",
    format: "Live Auction + Pitch Battle",
    venue: "Strategy Arena - Hall B",
    timing: "11:00 AM – 3:30 PM",
    badgeColor: "#2F6FED",
    tagType: "blue",
    iconName: "Swords",
    rounds: [
      { round: 1, title: "The Bid", desc: "Strategic points auction. Bid on mystery assets and product patents on screen." },
      { round: 2, title: "The Pitch", desc: "Synthesize acquired assets into a unified enterprise and pitch to venture evaluators." }
    ],
    rewards: [
      "Winning Team: Physical Certificates + Goodie Packs",
      "Best Individual Pitch: 3-Month Founder's Office Internship"
    ],
    internshipOpportunity: "3-Month Founder's Office Internship"
  },
  {
    id: "the-boardroom",
    slug: "the-boardroom",
    name: "THE BOARDROOM",
    day: 2,
    dateLabel: "DAY 02",
    tagline: "Executive Case Study Simulation",
    description: "Duos are thrust into a sudden corporate crisis. Deconstruct balance sheets, craft turnaround roadmaps, and withstand ruthless board interrogation.",
    teamSize: "2 Members (Duos)",
    format: "90-Min Case Crack + Board Defense",
    venue: "Executive Suite A",
    timing: "2:00 PM – 5:30 PM",
    badgeColor: "#FF5A36",
    tagType: "orange",
    iconName: "Briefcase",
    rounds: [
      { round: 1, title: "Crisis Dossier", desc: "Confidential crisis dossier revealed with 90-minute deliberation clock." },
      { round: 2, title: "Executive Defense", desc: "Present strategic restructuring roadmap directly to the mock boardroom." }
    ],
    rewards: [
      "Winning Duos: Physical Certificates + Mentorship Access"
    ]
  },
  {
    id: "entre-prenormie",
    slug: "entre-prenormie",
    name: "ENTRE-PRENORMIE",
    day: 3,
    dateLabel: "DAY 03",
    tagline: "1-on-1 Closed-Door Dialogue with Tech Founders",
    description: "Cut through the noise. Get uninterrupted 1-to-1 mentoring, pitch feedback, and career guidance directly from verified startup founders.",
    teamSize: "Individual (1-on-1)",
    format: "Private Founder Sessions",
    venue: "Founder Lounge - Block 4",
    timing: "10:00 AM – 1:00 PM",
    badgeColor: "#7C3AED",
    tagType: "violet",
    iconName: "Users",
    rounds: [
      { round: 1, title: "1-to-1 Session", desc: "Personalized 20-minute breakout on fundraising, growth, or product teardown." }
    ],
    rewards: [
      "All Participants: Verified Digital Certificates signed by the founders",
      "Direct investor & founder network connections"
    ]
  },
  {
    id: "bulls-and-bears",
    slug: "bulls-and-bears",
    name: "BULLS & BEARS",
    day: 3,
    dateLabel: "DAY 03",
    tagline: "Live Stock Market Quiz & Portfolio Trading Simulation",
    description: "Fastest-finger-first financial analytics, algorithmic market shocks, and live portfolio rebalancing on the Cabinet trading floor.",
    teamSize: "Individual Participation",
    format: "Speed Quiz + Real-Time Trading",
    venue: "Terminal Lab 1",
    timing: "1:30 PM – 3:30 PM",
    badgeColor: "#C6F135",
    tagType: "lime",
    iconName: "TrendingUp",
    rounds: [
      { round: 1, title: "Market Sprint Quiz", desc: "Rapid-fire equity, crypto, and macro finance quiz on live terminals." },
      { round: 2, title: "Portfolio Sim", desc: "Simulated market shock scenarios with dynamic real-time leaderboard." }
    ],
    rewards: [
      "Featured on Cabinet Wall of Fame",
      "Official Certificate of Financial Mastery"
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
        venue: "German Hangar",
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
        name: "Food Street Live",
        venue: "D5 Stage Ground",
        type: "Food & Social",
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
        venue: "German Hangar",
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
        name: "Entre-Prenormie: 1-on-1 Sessions",
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
  { value: "6 EVENTS", label: "COMPETITIONS & EXPO", highlight: true },
  { value: "50+ STALLS", label: "BAY AREA FLOOR", highlight: false },
  { value: "₹1,00,000+", label: "PRIZE POOL & GRANTS", highlight: false },
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
    category: "Startup Roulette & War Room",
    highlight: "3-Month Direct Placement",
    description: "Best individual pitchers win a paid 3-month tenure working directly under tier-1 founders.",
    badgeColor: "#FF5A36"
  },
  {
    title: "Physical Trophies & Grants",
    category: "All Competitive Tracks",
    highlight: "₹1,00,000+ Total Value",
    description: "Custom engraved trophies, winner cash grants, and curated founder goodie crates.",
    badgeColor: "#7C3AED"
  },
  {
    title: "Venture Incubation Access",
    category: "Entre-Prenormie & Boardroom",
    highlight: "Seed Mentorship Pipeline",
    description: "Direct fast-tracked evaluation with angel syndicates and incubator demo days.",
    badgeColor: "#2F6FED"
  }
];
