import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

// Mock admin dataset with diverse sample registrations
const mockRegistrations = [
  {
    id: "REG-839201",
    fullName: "Aryan Saxena",
    email: "aryan.saxena@tier1.edu",
    phone: "9819283746",
    selectedEvents: ["startup-roulette", "bay-area"],
    createdAt: "2026-09-08T10:14:00Z",
    status: "confirmed",
    startupRoulette: {
      teamName: "Aura Solar",
      teamLeaderName: "Aryan Saxena",
      teamMembersNames: "Rohan, Sneha, Dev, Ananya",
      ideaName: "Decentralized Solar Micromarkets",
      ideaDescription: "P2P energy grid trading for university campuses",
    },
    bayArea: {
      stallName: "Aura Solar Tech Demos",
      contactPerson: "Aryan Saxena",
      phoneNumber: "9819283746",
      stallType: "main",
    },
  },
  {
    id: "REG-729104",
    fullName: "Pooja Malhotra",
    email: "pooja.m@fintech.co",
    phone: "9871234560",
    selectedEvents: ["bulls-and-bears"],
    createdAt: "2026-09-08T14:30:00Z",
    status: "confirmed",
  },
  {
    id: "REG-618293",
    fullName: "Vikram Singhania",
    email: "vikram@singhania.ventures",
    phone: "9820011223",
    selectedEvents: ["the-war-room", "the-boardroom"],
    createdAt: "2026-09-09T09:00:00Z",
    status: "confirmed",
    theWarRoom: {
      teamName: "War Room Alpha",
      teamLeaderName: "Vikram Singhania",
      teamMembersNames: "Karan, Priya, Aman, Riya",
    },
    theBoardroom: {
      teamName: "Boardroom Duo",
      teamLeaderName: "Vikram Singhania",
      teamMembersNames: "Priya Menon",
    },
  },
  {
    id: "REG-519284",
    fullName: "Tanvi Kulkarni",
    email: "tanvi.k@design.io",
    phone: "9833445566",
    selectedEvents: ["entre-prenormie"],
    createdAt: "2026-09-09T16:45:00Z",
    status: "confirmed",
    entrePrenormie: {
      founderDiscussionTopic: "Validating early design systems for vertical SaaS",
    },
  },
  {
    id: "REG-410293",
    fullName: "Chef Rahul Kapoor",
    email: "rahul@smokeygrill.in",
    phone: "9899112233",
    selectedEvents: ["bay-area"],
    createdAt: "2026-09-10T02:20:00Z",
    status: "confirmed",
    bayArea: {
      stallName: "Smokey Artisanal Burgers",
      contactPerson: "Chef Rahul Kapoor",
      phoneNumber: "9899112233",
      stallType: "food",
    },
  },
];

export async function GET(req: NextRequest) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: regs, error } = await supabase
        .from("registrations")
        .select(`
          id,
          status,
          created_at,
          participants (
            full_name,
            email,
            phone
          ),
          registration_events (
            event_slug,
            details
          )
        `)
        .order("created_at", { ascending: false });

      if (!error && regs && regs.length > 0) {
        return NextResponse.json({
          registrations: regs.map((r: any) => ({
            id: r.id,
            fullName: r.participants?.full_name,
            email: r.participants?.email,
            phone: r.participants?.phone,
            selectedEvents: r.registration_events?.map((e: any) => e.event_slug) || [],
            createdAt: r.created_at,
            status: r.status,
          })),
        });
      }
    } catch (e) {
      console.warn("Supabase fetch fallback to mock");
    }
  }

  return NextResponse.json({
    registrations: mockRegistrations,
  });
}
