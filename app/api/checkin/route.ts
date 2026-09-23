import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { EVENTS_DATA } from "@/lib/mock-data";
import { getRestrictedEventSlug } from "@/lib/volunteer-gates";

export const dynamic = "force-dynamic";

const EVENT_TABLE_MAP: Record<string, { table: string; name: string }> = {
  "startup-roulette": {
    table: "registrations_startup_roulette",
    name: "STARTUP ROULETTE",
  },
  "the-war-room": {
    table: "registrations_the_war_room",
    name: "THE WAR ROOM",
  },
  "the-boardroom": {
    table: "registrations_the_boardroom",
    name: "THE BOARDROOM",
  },
  "entre-prenormie": {
    table: "registrations_entre_prenormie",
    name: "ENTRE-NORMIE",
  },
  "bulls-and-bears": {
    table: "registrations_bulls_and_bears",
    name: "BULLS & BEARS",
  },
};

// Helper to extract clean UUID or code from a scanned string (raw token, code, or URL)
function extractQrToken(rawInput: string): string {
  if (!rawInput) return "";
  const trimmed = rawInput.trim();

  // If input contains a UUID in a URL path like /verify/uuid
  const urlMatch = trimmed.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);
  if (urlMatch) {
    return urlMatch[0];
  }

  // If input contains /verify/<code_or_token>
  const verifyPathMatch = trimmed.match(/\/verify\/([a-zA-Z0-9_-]+)\/?$/i);
  if (verifyPathMatch) {
    return verifyPathMatch[1];
  }

  return trimmed;
}

// Deterministic 4-character code derived from the suffix of qr_token or id
function getShortCode(val: string | null | undefined): string {
  if (!val) return "";
  return val.replace(/[^a-zA-Z0-9]/g, "").slice(-4).toUpperCase();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawToken = (body.qrToken || body.token || body.code || body.registrationId || "").toString().trim();
    const volunteerEmail = body.volunteerEmail?.trim() || null;
    const restrictedSlug = getRestrictedEventSlug(volunteerEmail);
    const isAdminOverride = (body.adminOverride === true || body.isAdmin === true) && !restrictedSlug;
    const gateEventSlug = (restrictedSlug && !isAdminOverride)
      ? restrictedSlug
      : (body.gateEventSlug || body.eventSlug || "any");
    const action = body.action || body.mode || "checkin"; // "lookup" | "checkin" | "undo" | "reset"

    if (!rawToken && !body.registrationId) {
      return NextResponse.json(
        {
          success: false,
          code: "INVALID_QR",
          error: "QR token, attendee email, or 4-digit gate pass code is required",
        },
        { status: 400 }
      );
    }

    if (!gateEventSlug && !isAdminOverride) {
      return NextResponse.json(
        {
          success: false,
          code: "GATE_REQUIRED",
          error: "Selected gate event is required",
        },
        { status: 400 }
      );
    }

    const qrToken = extractQrToken(rawToken);
    const cleanToken = qrToken.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const isShortCode = cleanToken.length > 0 && cleanToken.length <= 4;
    const isEmail = rawToken.includes("@");

    if (!isSupabaseConfigured || !supabaseAdmin) {
      return NextResponse.json(
        {
          success: false,
          code: "CONFIG_ERROR",
          error: "Database is not connected to process check-in",
        },
        { status: 500 }
      );
    }

    const db = supabaseAdmin;
    let foundRecord: any = null;
    let foundEventSlug: string = "";
    let foundTable: string = "";

    // Search helper that tests email, 4-char shortcode, or full QR token/UUID
    const searchInTable = async (table: string): Promise<any | null> => {
      try {
        if (body.registrationId) {
          const { data: byRegId } = await db
            .from(table)
            .select("*")
            .eq("id", body.registrationId)
            .maybeSingle();
          if (byRegId) return byRegId;
        }

        if (isEmail) {
          const { data } = await db
            .from(table)
            .select("*")
            .ilike("email", rawToken.trim());
          if (data && data.length > 0) {
            return data.find((r: any) => !r.checked_in_at) || data[0];
          }
        } else if (isShortCode) {
          const { data: rows } = await db.from(table).select("*");
          if (rows && rows.length > 0) {
            const matches = rows.filter((r: any) => {
              const codeId = getShortCode(r.id);
              const codeToken = getShortCode(r.qr_token);
              return codeId === cleanToken || codeToken === cleanToken;
            });
            if (matches.length > 0) {
              return matches.find((r: any) => !r.checked_in_at) || matches[0];
            }
          }
        } else {
          // Direct token or UUID or id match
          const { data } = await db
            .from(table)
            .select("*")
            .or(`qr_token.eq.${qrToken},id.eq.${qrToken}`)
            .maybeSingle();
          if (data) return data;

          const { data: byId } = await db
            .from(table)
            .select("*")
            .eq("id", qrToken)
            .maybeSingle();
          if (byId) return byId;
        }
      } catch (err) {
        console.error(`Error searching table ${table}:`, err);
      }
      return null;
    };

    // 1. If a specific gate event is given and valid, check that table first
    if (gateEventSlug && gateEventSlug !== "any" && EVENT_TABLE_MAP[gateEventSlug]) {
      const info = EVENT_TABLE_MAP[gateEventSlug];
      const match = await searchInTable(info.table);
      if (match) {
        foundRecord = match;
        foundEventSlug = gateEventSlug;
        foundTable = info.table;
      }
    }

    // 2. If not found or if checking across all gates ("any"), check remaining tables
    if (!foundRecord) {
      for (const [slug, info] of Object.entries(EVENT_TABLE_MAP)) {
        if (slug === gateEventSlug) continue;
        const match = await searchInTable(info.table);
        if (match) {
          foundRecord = match;
          foundEventSlug = slug;
          foundTable = info.table;
          break;
        }
      }
    }

    // CASE 1: Token does not match any record anywhere
    if (!foundRecord) {
      return NextResponse.json(
        {
          success: false,
          code: "INVALID_QR",
          error: `No registration found matching "${rawToken}". Check 4-digit code, email, or pass ID.`,
        },
        { status: 404 }
      );
    }

    const attendeeInfo = {
      fullName: foundRecord.team_leader_name || foundRecord.full_name || "Attendee",
      email: foundRecord.email || "",
      phone: foundRecord.phone || "",
      teamName: foundRecord.team_name || null,
      teamMembersNames: foundRecord.team_members_names || foundRecord.partner_name || null,
      partnerName: foundRecord.partner_name || null,
    };

    const actualEventName =
      EVENT_TABLE_MAP[foundEventSlug]?.name ||
      EVENTS_DATA.find((e) => e.slug === foundEventSlug)?.name ||
      foundEventSlug.toUpperCase().replace(/-/g, " ");

    const gateEventName =
      gateEventSlug === "any"
        ? actualEventName
        : EVENT_TABLE_MAP[gateEventSlug]?.name ||
          EVENTS_DATA.find((e) => e.slug === gateEventSlug)?.name ||
          gateEventSlug.toUpperCase().replace(/-/g, " ");

    const matchedShortCode = getShortCode(foundRecord.qr_token || foundRecord.id);
    const existingCheckin = foundRecord.checked_in_at || foundRecord.details?.checked_in_at;

    // ACTION: LOOKUP / VERIFY ONLY (inspect details before confirming)
    if (action === "lookup") {
      return NextResponse.json({
        success: true,
        code: "RECORD_FOUND",
        message: "Registration found",
        attendee: attendeeInfo,
        event: actualEventName,
        eventSlug: foundEventSlug,
        shortCode: matchedShortCode,
        isAlreadyCheckedIn: !!existingCheckin,
        checkedInAt: existingCheckin || null,
        checkedInBy: foundRecord.checked_in_by || null,
        registrationId: foundRecord.id,
      });
    }

    // ACTION: UNDO / RESET CHECK-IN
    if (action === "undo" || action === "reset") {
      if (foundTable) {
        await db
          .from(foundTable)
          .update({
            checked_in_at: null,
            checked_in_by: null,
          })
          .eq("id", foundRecord.id);
      }
      return NextResponse.json({
        success: true,
        code: "CHECKIN_RESET",
        message: `Check-in for ${attendeeInfo.fullName} has been reset.`,
        attendee: attendeeInfo,
        event: actualEventName,
        eventSlug: foundEventSlug,
        shortCode: matchedShortCode,
        registrationId: foundRecord.id,
      });
    }

    // CASE 2: Wrong Gate (Strictly enforced for gate volunteer accounts and mismatched event tracks)
    if (gateEventSlug && gateEventSlug !== "any" && !isAdminOverride && foundEventSlug !== gateEventSlug) {
      const isRestrictedAccount = !!restrictedSlug;
      const errorMsg = isRestrictedAccount
        ? `Restricted Gate Account: You are signed in as ${gateEventName} Gate (${volunteerEmail}). This attendee has a pass for ${actualEventName}. You can only admit attendees for ${gateEventName}.`
        : `Wrong gate — this pass is for ${actualEventName}`;

      return NextResponse.json(
        {
          success: false,
          code: "WRONG_GATE",
          error: errorMsg,
          actualEvent: actualEventName,
          gateEvent: gateEventName,
          assignedEvent: gateEventName,
          shortCode: matchedShortCode,
          attendee: attendeeInfo,
          registrationId: foundRecord.id,
        },
        { status: isRestrictedAccount ? 403 : 400 }
      );
    }

    // CASE 3: Already Checked In
    if (existingCheckin) {
      const checkedInDate = new Date(existingCheckin);
      const formattedTime = checkedInDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
      const formattedDate = checkedInDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      return NextResponse.json(
        {
          success: false,
          code: "ALREADY_CHECKED_IN",
          error: `Already checked in at ${formattedTime} (${formattedDate}) by ${foundRecord.checked_in_by || "Staff"}`,
          checkedInAt: existingCheckin,
          checkedInBy: foundRecord.checked_in_by || null,
          formattedTime,
          formattedDate,
          event: actualEventName,
          eventSlug: foundEventSlug,
          shortCode: matchedShortCode,
          attendee: attendeeInfo,
          registrationId: foundRecord.id,
        },
        { status: 409 }
      );
    }

    // CASE 4: Valid Check-in!
    const checkinTimestamp = new Date().toISOString();
    const verifierTag = volunteerEmail || (isAdminOverride ? "Admin Console" : "Gate Volunteer");

    // Update the event table directly
    if (foundTable) {
      try {
        const { error: updErr } = await db
          .from(foundTable)
          .update({
            checked_in_at: checkinTimestamp,
            checked_in_by: verifierTag,
          })
          .eq("id", foundRecord.id);

        if (updErr) {
          console.warn(`Could not update checked_in_at on ${foundTable}:`, updErr.message);
        }
      } catch (err) {
        console.error(`Error updating checkin on ${foundTable}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      code: "CHECKIN_CONFIRMED",
      message: "Entry verified successfully",
      checkedInAt: checkinTimestamp,
      checkedInBy: verifierTag,
      event: actualEventName,
      eventSlug: foundEventSlug,
      shortCode: matchedShortCode,
      attendee: attendeeInfo,
      registrationId: foundRecord.id,
    });
  } catch (error: any) {
    console.error("Check-in route error:", error);
    return NextResponse.json(
      {
        success: false,
        code: "SERVER_ERROR",
        error: error.message || "Failed to process check-in",
      },
      { status: 500 }
    );
  }
}
