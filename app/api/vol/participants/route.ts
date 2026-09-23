import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { getRestrictedEventSlug, getEventNameFromSlug } from "@/lib/volunteer-gates";
import { verifyAuth } from "@/lib/auth-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const EVENT_TABLES: Record<string, string> = {
  "startup-roulette": "registrations_startup_roulette",
  "the-war-room": "registrations_the_war_room",
  "the-boardroom": "registrations_the_boardroom",
  "entre-prenormie": "registrations_entre_prenormie",
  "bulls-and-bears": "registrations_bulls_and_bears",
};

function getShortCode(val: string | null | undefined): string {
  if (!val) return "";
  return val.replace(/[^a-zA-Z0-9]/g, "").slice(-4).toUpperCase();
}

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth || (!auth.isVolunteer && !auth.isAdmin)) {
      return NextResponse.json(
        {
          success: false,
          code: "UNAUTHORIZED",
          error: "Authentication required. Gate volunteer or administrator access required.",
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    let targetSlug = searchParams.get("eventSlug")?.trim().toLowerCase() || "startup-roulette";

    // Enforce gate restriction strictly from verified auth session
    if (!auth.isAdmin && auth.restrictedEventSlug) {
      if (targetSlug && targetSlug !== auth.restrictedEventSlug) {
        return NextResponse.json(
          {
            success: false,
            code: "RESTRICTED_ACCESS",
            error: `Your volunteer account (${auth.email}) is restricted to ${getEventNameFromSlug(
              auth.restrictedEventSlug
            )} only.`,
          },
          { status: 403 }
        );
      }
      targetSlug = auth.restrictedEventSlug;
    }

    const tableName = EVENT_TABLES[targetSlug];
    if (!tableName) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid event slug: ${targetSlug}`,
        },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured || !supabaseAdmin) {
      // Local dev fallback
      return NextResponse.json({
        success: true,
        eventSlug: targetSlug,
        eventName: getEventNameFromSlug(targetSlug),
        total: 0,
        checkedInCount: 0,
        pendingCount: 0,
        participants: [],
      });
    }

    const db = supabaseAdmin;

    // Fetch all registrations for this specific event table
    const { data: rows, error } = await db
      .from(tableName)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(`Error querying ${tableName}:`, error);
      return NextResponse.json(
        { success: false, error: `Failed to fetch event participants: ${error.message}` },
        { status: 500 }
      );
    }

    // Also fetch checkin info from registration_events for cross-table sync if needed
    const { data: regEvents } = await db
      .from("registration_events")
      .select("id, qr_token, checked_in_at, checked_in_by, details")
      .eq("event_slug", targetSlug);

    const checkinMap = new Map<string, { checkedInAt?: string; checkedInBy?: string; qrToken?: string }>();
    for (const ev of regEvents || []) {
      if (ev.qr_token) {
        checkinMap.set(ev.qr_token, {
          checkedInAt: ev.checked_in_at,
          checkedInBy: ev.checked_in_by,
          qrToken: ev.qr_token,
        });
      }
      if (ev.details?.teamName) {
        checkinMap.set(ev.details.teamName.toLowerCase().trim(), {
          checkedInAt: ev.checked_in_at,
          checkedInBy: ev.checked_in_by,
          qrToken: ev.qr_token,
        });
      }
    }

    const participants = (rows || []).map((r: any) => {
      const crossCheck =
        (r.id && checkinMap.get(r.id)) ||
        (r.team_name && checkinMap.get(r.team_name.toLowerCase().trim())) ||
        {};

      const checkedInAt = r.checked_in_at || crossCheck.checkedInAt || null;
      const checkedInBy = r.checked_in_by || crossCheck.checkedInBy || null;
      const qrToken = r.qr_token || crossCheck.qrToken || r.id;
      const shortCode = getShortCode(qrToken || r.id);

      return {
        id: r.id,
        fullName: r.team_leader_name || r.full_name || "Attendee",
        email: r.email || "",
        phone: r.phone || "",
        eventSlug: targetSlug,
        eventName: getEventNameFromSlug(targetSlug),
        shortCode,
        qrToken,
        teamName: r.team_name || null,
        teamLeaderName: r.team_leader_name || null,
        teamMembersNames: r.team_members_names || r.partner_name || null,
        partnerName: r.partner_name || null,
        ideaName: r.idea_name || null,
        ideaDescription: r.idea_description || null,
        founderDiscussionTopic: r.founder_discussion_topic || null,
        status: r.status || "CONFIRMED",
        checkedInAt,
        checkedInBy,
        createdAt: r.created_at || new Date().toISOString(),
      };
    });

    const checkedInCount = participants.filter((p) => !!p.checkedInAt).length;
    const pendingCount = participants.length - checkedInCount;

    return NextResponse.json({
      success: true,
      eventSlug: targetSlug,
      eventName: getEventNameFromSlug(targetSlug),
      total: participants.length,
      checkedInCount,
      pendingCount,
      participants,
    });
  } catch (err: any) {
    console.error("Error in GET /api/vol/participants:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load participants" },
      { status: 500 }
    );
  }
}
