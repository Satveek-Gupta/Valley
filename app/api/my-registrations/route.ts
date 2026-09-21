import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { EVENTS_DATA } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const emailParam = searchParams.get("email");

    if (!emailParam || !emailParam.trim()) {
      return NextResponse.json(
        { success: false, error: "Email query parameter is required" },
        { status: 400 }
      );
    }

    const email = emailParam.trim().toLowerCase();
    const result = await fetchParticipantRegistrations(email);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error fetching participant registrations:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    const result = await fetchParticipantRegistrations(email);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error processing participant registrations:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}

async function fetchParticipantRegistrations(cleanEmail: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cabinetvalley.in";
  const eventsMap = new Map(EVENTS_DATA.map((e) => [e.slug, e]));
  const db = supabaseAdmin;

  if (!isSupabaseConfigured || !db) {
    return {
      success: true,
      participant: { email: cleanEmail, fullName: "Attendee" },
      registrations: [],
    };
  }

  // Load latest events metadata from Supabase database to ensure 100% accurate venues & timings
  try {
    const { data: dbEvents } = await db.from("events").select("*");
    if (dbEvents && dbEvents.length > 0) {
      for (const e of dbEvents) {
        eventsMap.set(e.slug, {
          id: e.slug || e.id,
          slug: e.slug,
          name: e.name,
          day: e.day,
          dateLabel: e.date_label || `DAY 0${e.day}`,
          tagline: e.tagline || "",
          description: e.description || "",
          teamSize: e.team_size || "",
          format: e.format || "",
          venue: e.venue || "",
          timing: e.timing || "",
          badgeColor: e.badge_color || "#7C3AED",
          tagType: e.tag_type || "violet",
          iconName: e.icon_name || "Sparkles",
          rounds: Array.isArray(e.rounds) ? e.rounds : [],
          rewards: Array.isArray(e.rewards) ? e.rewards : [],
          featured: Boolean(e.featured),
        });
      }
    }
  } catch (err) {
    console.warn("Could not fetch live events in my-registrations:", err);
  }

  const formattedRegistrations: any[] = [];
  const processedSlugs = new Set<string>();
  let attendeeFullName: string = "";

  // =========================================================================
  // 1. PRIMARY SOURCE OF TRUTH: The 5 Dedicated Event Registration Tables
  // =========================================================================
  const eventTableConfigs = [
    {
      slug: "startup-roulette",
      table: "registrations_startup_roulette",
      mapRow: (r: any, meta: any) => ({
        id: r.id,
        eventSlug: "startup-roulette",
        eventName: meta?.name || "STARTUP ROULETTE",
        day: meta?.day || 1,
        dateLabel: meta?.dateLabel || "DAY 01",
        tagType: meta?.tagType || "coral",
        badgeColor: meta?.badgeColor || "#FF5A36",
        venue: meta?.venue || "Hexagon",
        timing: meta?.timing || "6:30pm onwards",
        isBayArea: false,
        qrToken: r.qr_token || r.id,
        qrUrl: `${siteUrl}/verify/${r.qr_token || r.id}`,
        checkedInAt: r.checked_in_at || null,
        teamName: r.team_name || null,
        teamLeaderName: r.team_leader_name || r.full_name,
        teamMembersNames: r.team_members_names || null,
        ideaName: r.idea_name || null,
        ideaDescription: r.idea_description || null,
        createdAt: r.created_at,
      }),
    },
    {
      slug: "the-war-room",
      table: "registrations_the_war_room",
      mapRow: (r: any, meta: any) => ({
        id: r.id,
        eventSlug: "the-war-room",
        eventName: meta?.name || "THE WAR ROOM",
        day: meta?.day || 2,
        dateLabel: meta?.dateLabel || "DAY 02",
        tagType: meta?.tagType || "blue",
        badgeColor: meta?.badgeColor || "#2F6FED",
        venue: meta?.venue || "301 ALH",
        timing: meta?.timing || "6:30pm onwards",
        isBayArea: false,
        qrToken: r.qr_token || r.id,
        qrUrl: `${siteUrl}/verify/${r.qr_token || r.id}`,
        checkedInAt: r.checked_in_at || null,
        teamName: r.team_name || null,
        teamLeaderName: r.team_leader_name || r.full_name,
        teamMembersNames: r.team_members_names || null,
        createdAt: r.created_at,
      }),
    },
    {
      slug: "the-boardroom",
      table: "registrations_the_boardroom",
      mapRow: (r: any, meta: any) => ({
        id: r.id,
        eventSlug: "the-boardroom",
        eventName: meta?.name || "THE BOARDROOM",
        day: meta?.day || 2,
        dateLabel: meta?.dateLabel || "DAY 02",
        tagType: meta?.tagType || "coral",
        badgeColor: meta?.badgeColor || "#FF5A36",
        venue: meta?.venue || "Hexagon",
        timing: meta?.timing || "6:30pm onwards",
        isBayArea: false,
        qrToken: r.qr_token || r.id,
        qrUrl: `${siteUrl}/verify/${r.qr_token || r.id}`,
        checkedInAt: r.checked_in_at || null,
        teamName: r.team_name || null,
        teamLeaderName: r.team_leader_name || r.full_name,
        teamMembersNames: r.partner_name || null,
        partnerName: r.partner_name || null,
        createdAt: r.created_at,
      }),
    },
    {
      slug: "entre-prenormie",
      table: "registrations_entre_prenormie",
      mapRow: (r: any, meta: any) => ({
        id: r.id,
        eventSlug: "entre-prenormie",
        eventName: meta?.name || "ENTREPRE-NORMIE",
        day: meta?.day || 3,
        dateLabel: meta?.dateLabel || "DAY 03",
        tagType: meta?.tagType || "violet",
        badgeColor: meta?.badgeColor || "#7C3AED",
        venue: meta?.venue || "002 ALH",
        timing: meta?.timing || "6:30pm onwards",
        isBayArea: false,
        qrToken: r.qr_token || r.id,
        qrUrl: `${siteUrl}/verify/${r.qr_token || r.id}`,
        checkedInAt: r.checked_in_at || null,
        teamName: null,
        teamLeaderName: r.full_name,
        teamMembersNames: null,
        founderDiscussionTopic: r.founder_discussion_topic || null,
        createdAt: r.created_at,
      }),
    },
    {
      slug: "bulls-and-bears",
      table: "registrations_bulls_and_bears",
      mapRow: (r: any, meta: any) => ({
        id: r.id,
        eventSlug: "bulls-and-bears",
        eventName: meta?.name || "BULLS & BEARS",
        day: meta?.day || 3,
        dateLabel: meta?.dateLabel || "DAY 03",
        tagType: meta?.tagType || "lime",
        badgeColor: meta?.badgeColor || "#C6F135",
        venue: meta?.venue || "301 ALH",
        timing: meta?.timing || "6:30pm onwards",
        isBayArea: false,
        qrToken: r.qr_token || r.id,
        qrUrl: `${siteUrl}/verify/${r.qr_token || r.id}`,
        checkedInAt: r.checked_in_at || null,
        teamName: null,
        teamLeaderName: r.full_name,
        teamMembersNames: null,
        createdAt: r.created_at,
      }),
    },
  ];

  // Query each event table in parallel
  const eventTablePromises = eventTableConfigs.map(async (config) => {
    try {
      const { data, error } = await db
        .from(config.table)
        .select("*")
        .ilike("email", cleanEmail);

      if (error) {
        console.warn(`Error querying ${config.table}:`, error.message);
        return [];
      }
      return (data || []).map((row: any) => {
        processedSlugs.add(config.slug);
        if (!attendeeFullName && row.full_name) {
          attendeeFullName = row.full_name;
        }
        const meta = eventsMap.get(config.slug);
        return config.mapRow(row, meta);
      });
    } catch (e) {
      console.warn(`Exception querying ${config.table}:`, e);
      return [];
    }
  });

  const eventTableResults = await Promise.all(eventTablePromises);
  for (const group of eventTableResults) {
    formattedRegistrations.push(...group);
  }

  // =========================================================================
  // 2. BAY AREA STALLS: Query stalls table (NO QR, NO GATE CHECK-IN)
  // =========================================================================
  try {
    const { data: stalls } = await db
      .from("stalls")
      .select("*")
      .or(`contact_person.ilike.%${cleanEmail}%,business_name.ilike.%${cleanEmail}%`);

    if (stalls && stalls.length > 0) {
      processedSlugs.add("bay-area");
      for (const st of stalls) {
        if (!attendeeFullName && st.contact_person) {
          attendeeFullName = st.contact_person;
        }
        formattedRegistrations.push({
          id: st.id,
          eventSlug: "bay-area",
          eventName: "BAY AREA STALLS",
          day: 1,
          dateLabel: "DAY 01 & 02",
          tagType: "violet",
          badgeColor: "#7C3AED",
          venue: st.venue || "Near C5 & D5 Hostels",
          timing: "10:00 AM – 6:00 PM",
          isBayArea: true,
          details: {
            stallNumber: st.stall_number,
            businessName: st.business_name,
            contactPerson: st.contact_person,
            status: st.status,
          },
          createdAt: st.created_at,
        });
      }
    }
  } catch (stallErr) {
    console.warn("Error querying stalls table:", stallErr);
  }

  // =========================================================================
  // 3. RELATIONAL SCHEMA FALLBACK: registration_events & participants
  // =========================================================================
  try {
    const { data: participant } = await db
      .from("participants")
      .select("*")
      .ilike("email", cleanEmail)
      .maybeSingle();

    if (participant) {
      if (!attendeeFullName && participant.full_name) {
        attendeeFullName = participant.full_name;
      }

      const { data: regRows } = await db
        .from("registrations")
        .select("id")
        .eq("participant_id", participant.id);

      const regIds = (regRows || []).map((r: any) => r.id);
      if (regIds.length > 0) {
        const { data: eventRows } = await db
          .from("registration_events")
          .select("*")
          .in("registration_id", regIds);

        for (const row of eventRows || []) {
          const slug = row.event_slug;
          // Avoid duplicate display if already found from the 5 primary tables
          if (processedSlugs.has(slug)) continue;
          processedSlugs.add(slug);

          const meta = eventsMap.get(slug);

          if (slug === "bay-area") {
            formattedRegistrations.push({
              id: row.id,
              eventSlug: slug,
              eventName: meta?.name || "BAY AREA STALLS",
              day: meta?.day || 1,
              dateLabel: meta?.dateLabel || "DAY 01 & 02",
              tagType: meta?.tagType || "violet",
              badgeColor: meta?.badgeColor || "#7C3AED",
              venue: meta?.venue || "Near C5 & D5 Hostels",
              timing: meta?.timing || "10:00 AM – 6:00 PM",
              isBayArea: true,
              details: row.details || {},
              createdAt: row.created_at,
            });
          } else {
            const qrToken = row.qr_token || row.details?.qr_token || row.id;
            const checkedInAt = row.checked_in_at || row.details?.checked_in_at || null;

            formattedRegistrations.push({
              id: row.id,
              eventSlug: slug,
              eventName: meta?.name || slug.toUpperCase().replace(/-/g, " "),
              day: meta?.day || 1,
              dateLabel: meta?.dateLabel || "DAY 01",
              tagType: meta?.tagType || "violet",
              badgeColor: meta?.badgeColor || "#7C3AED",
              venue: meta?.venue || "Campus Venue",
              timing: meta?.timing || "6:30pm onwards",
              isBayArea: false,
              qrToken: qrToken,
              qrUrl: `${siteUrl}/verify/${qrToken}`,
              checkedInAt: checkedInAt,
              teamName: row.details?.teamName || null,
              teamLeaderName: row.details?.teamLeaderName || participant.full_name,
              teamMembersNames: row.details?.teamMembersNames || row.details?.partnerName || null,
              partnerName: row.details?.partnerName || null,
              ideaName: row.details?.ideaName || null,
              ideaDescription: row.details?.ideaDescription || null,
              founderDiscussionTopic: row.details?.founderDiscussionTopic || null,
              createdAt: row.created_at,
            });
          }
        }
      }
    }
  } catch (partErr) {
    console.warn("Error querying participants/registrations fallback:", partErr);
  }

  return {
    success: true,
    participant: {
      email: cleanEmail,
      fullName: attendeeFullName || "Attendee",
    },
    registrations: formattedRegistrations,
  };
}
