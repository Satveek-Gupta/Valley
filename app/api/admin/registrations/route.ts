import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const [
        rouletteRes,
        warRoomRes,
        boardroomRes,
        entreRes,
        bullsRes,
        regEventsRes,
      ] = await Promise.all([
        supabaseAdmin
          .from("registrations_startup_roulette")
          .select("*")
          .order("created_at", { ascending: false }),
        supabaseAdmin
          .from("registrations_the_war_room")
          .select("*")
          .order("created_at", { ascending: false }),
        supabaseAdmin
          .from("registrations_the_boardroom")
          .select("*")
          .order("created_at", { ascending: false }),
        supabaseAdmin
          .from("registrations_entre_prenormie")
          .select("*")
          .order("created_at", { ascending: false }),
        supabaseAdmin
          .from("registrations_bulls_and_bears")
          .select("*")
          .order("created_at", { ascending: false }),
        supabaseAdmin
          .from("registration_events")
          .select("id, event_slug, qr_token, checked_in_at, checked_in_by, details")
          .order("created_at", { ascending: false }),
      ]);

      // Map checked_in_at and checked_in_by by qr_token or event_slug + teamName
      const checkinMap = new Map<string, { checkedInAt?: string; checkedInBy?: string; qrToken?: string }>();
      for (const ev of regEventsRes.data || []) {
        if (ev.qr_token) {
          checkinMap.set(ev.qr_token, {
            checkedInAt: ev.checked_in_at,
            checkedInBy: ev.checked_in_by,
            qrToken: ev.qr_token,
          });
        }
        if (ev.event_slug && ev.details?.teamName) {
          checkinMap.set(`${ev.event_slug}:${ev.details.teamName.toLowerCase().trim()}`, {
            checkedInAt: ev.checked_in_at,
            checkedInBy: ev.checked_in_by,
            qrToken: ev.qr_token,
          });
        }
      }

      const startupRoulette = (rouletteRes.data || []).map((r: any) => {
        const checkinInfo =
          (r.id && checkinMap.get(r.id)) ||
          (r.team_name && checkinMap.get(`startup-roulette:${r.team_name.toLowerCase().trim()}`)) ||
          {};
        return {
          id: r.id,
          fullName: r.full_name,
          email: r.email,
          phone: r.phone,
          eventSlug: "startup-roulette",
          teamName: r.team_name,
          teamLeaderName: r.team_leader_name,
          teamMembersNames: r.team_members_names,
          ideaName: r.idea_name,
          ideaDescription: r.idea_description,
          status: r.status,
          checkedInAt: r.checked_in_at || checkinInfo.checkedInAt || null,
          checkedInBy: r.checked_in_by || checkinInfo.checkedInBy || null,
          qrToken: r.qr_token || checkinInfo.qrToken || r.id,
          createdAt: r.created_at,
        };
      });

      const theWarRoom = (warRoomRes.data || []).map((r: any) => {
        const checkinInfo =
          (r.id && checkinMap.get(r.id)) ||
          (r.team_name && checkinMap.get(`the-war-room:${r.team_name.toLowerCase().trim()}`)) ||
          {};
        return {
          id: r.id,
          fullName: r.full_name,
          email: r.email,
          phone: r.phone,
          eventSlug: "the-war-room",
          teamName: r.team_name,
          teamLeaderName: r.team_leader_name,
          teamMembersNames: r.team_members_names,
          status: r.status,
          checkedInAt: r.checked_in_at || checkinInfo.checkedInAt || null,
          checkedInBy: r.checked_in_by || checkinInfo.checkedInBy || null,
          qrToken: r.qr_token || checkinInfo.qrToken || r.id,
          createdAt: r.created_at,
        };
      });

      const theBoardroom = (boardroomRes.data || []).map((r: any) => {
        const checkinInfo =
          (r.id && checkinMap.get(r.id)) ||
          (r.team_name && checkinMap.get(`the-boardroom:${r.team_name.toLowerCase().trim()}`)) ||
          {};
        return {
          id: r.id,
          fullName: r.full_name,
          email: r.email,
          phone: r.phone,
          eventSlug: "the-boardroom",
          teamName: r.team_name,
          teamLeaderName: r.team_leader_name,
          partnerName: r.partner_name,
          status: r.status,
          checkedInAt: r.checked_in_at || checkinInfo.checkedInAt || null,
          checkedInBy: r.checked_in_by || checkinInfo.checkedInBy || null,
          qrToken: r.qr_token || checkinInfo.qrToken || r.id,
          createdAt: r.created_at,
        };
      });

      const entrePrenormie = (entreRes.data || []).map((r: any) => {
        const checkinInfo = (r.id && checkinMap.get(r.id)) || {};
        return {
          id: r.id,
          fullName: r.full_name,
          email: r.email,
          phone: r.phone,
          eventSlug: "entre-prenormie",
          founderDiscussionTopic: r.founder_discussion_topic,
          status: r.status,
          checkedInAt: r.checked_in_at || checkinInfo.checkedInAt || null,
          checkedInBy: r.checked_in_by || checkinInfo.checkedInBy || null,
          qrToken: r.qr_token || checkinInfo.qrToken || r.id,
          createdAt: r.created_at,
        };
      });

      const bullsAndBears = (bullsRes.data || []).map((r: any) => {
        const checkinInfo = (r.id && checkinMap.get(r.id)) || {};
        return {
          id: r.id,
          fullName: r.full_name,
          email: r.email,
          phone: r.phone,
          eventSlug: "bulls-and-bears",
          status: r.status,
          checkedInAt: r.checked_in_at || checkinInfo.checkedInAt || null,
          checkedInBy: r.checked_in_by || checkinInfo.checkedInBy || null,
          qrToken: r.qr_token || checkinInfo.qrToken || r.id,
          createdAt: r.created_at,
        };
      });

      const all = [
        ...startupRoulette,
        ...theWarRoom,
        ...theBoardroom,
        ...entrePrenormie,
        ...bullsAndBears,
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return NextResponse.json({
        total: all.length,
        byEvent: {
          "startup-roulette": startupRoulette,
          "the-war-room": theWarRoom,
          "the-boardroom": theBoardroom,
          "entre-prenormie": entrePrenormie,
          "bulls-and-bears": bullsAndBears,
        },
        registrations: all,
      });
    } catch (e) {
      console.error("Supabase fetch error across event tables:", e);
    }
  }

  // Fallback endpoint if Supabase is not connected
  return NextResponse.json({
    total: 0,
    byEvent: {
      "startup-roulette": [],
      "the-war-room": [],
      "the-boardroom": [],
      "entre-prenormie": [],
      "bulls-and-bears": [],
    },
    registrations: [],
  });
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const eventSlug = searchParams.get("eventSlug");

    if (!id || !eventSlug) {
      return NextResponse.json(
        { success: false, error: "Both registration id and eventSlug are required" },
        { status: 400 }
      );
    }

    const tableMap: Record<string, string> = {
      "startup-roulette": "registrations_startup_roulette",
      "the-war-room": "registrations_the_war_room",
      "the-boardroom": "registrations_the_boardroom",
      "entre-prenormie": "registrations_entre_prenormie",
      "bulls-and-bears": "registrations_bulls_and_bears",
    };

    const tableName = tableMap[eventSlug];
    if (!tableName) {
      return NextResponse.json(
        { success: false, error: `Invalid event slug: ${eventSlug}` },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured && supabaseAdmin) {
      const { error } = await supabaseAdmin
        .from(tableName)
        .delete()
        .eq("id", id);

      if (error) throw error;
    }

    return NextResponse.json({
      success: true,
      message: `Registration ${id} deleted successfully from ${tableName}`,
      id,
      eventSlug,
    });
  } catch (error: any) {
    console.error("Error deleting registration:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete registration" },
      { status: 500 }
    );
  }
}


