import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { EVENTS_DATA } from "@/lib/mock-data";

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
    const rawToken = body.qrToken || body.token;
    const gateEventSlug = body.gateEventSlug || body.eventSlug;
    const volunteerEmail = body.volunteerEmail?.trim() || null;

    if (!rawToken) {
      return NextResponse.json(
        {
          success: false,
          code: "INVALID_QR",
          error: "QR token or gate pass code is required",
        },
        { status: 400 }
      );
    }

    if (!gateEventSlug) {
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

    let foundRecord: any = null;
    let foundEventSlug: string = "";
    let foundTable: string = "";

    // 1. Check primary event tables directly
    // First, check the table matching the selected gate
    const gateTableInfo = EVENT_TABLE_MAP[gateEventSlug];
    if (gateTableInfo) {
      if (isShortCode) {
        try {
          const { data: rows } = await supabaseAdmin
            .from(gateTableInfo.table)
            .select("*");

          if (rows && rows.length > 0) {
            const matches = rows.filter((r: any) => {
              const codeId = getShortCode(r.id);
              const codeToken = getShortCode(r.qr_token);
              return codeId === cleanToken || codeToken === cleanToken;
            });

            if (matches.length > 0) {
              foundRecord = matches.find((r: any) => !r.checked_in_at) || matches[0];
              foundEventSlug = gateEventSlug;
              foundTable = gateTableInfo.table;
            }
          }
        } catch (e) {
          console.error(`Error in short code search for ${gateTableInfo.table}:`, e);
        }
      } else {
        try {
          // Search by qr_token or by id in this gate's table
          const { data } = await supabaseAdmin
            .from(gateTableInfo.table)
            .select("*")
            .or(`qr_token.eq.${qrToken},id.eq.${qrToken}`)
            .maybeSingle();

          if (data) {
            foundRecord = data;
            foundEventSlug = gateEventSlug;
            foundTable = gateTableInfo.table;
          }
        } catch (e) {
          // If qr_token column doesn't exist yet, query by id
          try {
            const { data: byId } = await supabaseAdmin
              .from(gateTableInfo.table)
              .select("*")
              .eq("id", qrToken)
              .maybeSingle();
            if (byId) {
              foundRecord = byId;
              foundEventSlug = gateEventSlug;
              foundTable = gateTableInfo.table;
            }
          } catch (e2) {
            // ignore
          }
        }
      }
    }

    // 2. If not found in the selected gate's table, check the OTHER 4 tables
    // (This detects WRONG GATE scenarios accurately)
    if (!foundRecord) {
      for (const [slug, info] of Object.entries(EVENT_TABLE_MAP)) {
        if (slug === gateEventSlug) continue;

        if (isShortCode) {
          try {
            const { data: rows } = await supabaseAdmin
              .from(info.table)
              .select("*");

            if (rows && rows.length > 0) {
              const matches = rows.filter((r: any) => {
                const codeId = getShortCode(r.id);
                const codeToken = getShortCode(r.qr_token);
                return codeId === cleanToken || codeToken === cleanToken;
              });

              if (matches.length > 0) {
                foundRecord = matches.find((r: any) => !r.checked_in_at) || matches[0];
                foundEventSlug = slug;
                foundTable = info.table;
                break;
              }
            }
          } catch (e) {
            // ignore
          }
        } else {
          try {
            const { data } = await supabaseAdmin
              .from(info.table)
              .select("*")
              .or(`qr_token.eq.${qrToken},id.eq.${qrToken}`)
              .maybeSingle();

            if (data) {
              foundRecord = data;
              foundEventSlug = slug;
              foundTable = info.table;
              break;
            }
          } catch (e) {
            // Fallback to id query
            try {
              const { data: byId } = await supabaseAdmin
                .from(info.table)
                .select("*")
                .eq("id", qrToken)
                .maybeSingle();
              if (byId) {
                foundRecord = byId;
                foundEventSlug = slug;
                foundTable = info.table;
                break;
              }
            } catch (e2) {
              // ignore
            }
          }
        }
      }
    }

    // 3. Fallback: Check registration_events table (unified schema)
    if (!foundRecord) {
      try {
        let eventReg: any = null;
        if (isShortCode) {
          const { data: regEvents } = await supabaseAdmin
            .from("registration_events")
            .select("id, registration_id, event_slug, details, checked_in_at, qr_token");

          if (regEvents && regEvents.length > 0) {
            eventReg = regEvents.find((ev: any) => {
              const codeId = getShortCode(ev.id);
              const codeToken = getShortCode(ev.qr_token);
              return codeId === cleanToken || codeToken === cleanToken;
            });
          }
        } else {
          const { data } = await supabaseAdmin
            .from("registration_events")
            .select("id, registration_id, event_slug, details, checked_in_at, qr_token")
            .or(`qr_token.eq.${qrToken},id.eq.${qrToken}`)
            .maybeSingle();
          eventReg = data;
        }

        if (eventReg) {
          foundEventSlug = eventReg.event_slug;
          foundTable = "registration_events";

          // Fetch attendee participant details
          let partName = eventReg.details?.teamLeaderName || "Attendee";
          let partEmail = "";
          let partPhone = "";

          if (eventReg.registration_id) {
            const { data: reg } = await supabaseAdmin
              .from("registrations")
              .select("participant_id")
              .eq("id", eventReg.registration_id)
              .maybeSingle();

            if (reg?.participant_id) {
              const { data: part } = await supabaseAdmin
                .from("participants")
                .select("full_name, email, phone")
                .eq("id", reg.participant_id)
                .maybeSingle();
              if (part) {
                partName = part.full_name;
                partEmail = part.email;
                partPhone = part.phone;
              }
            }
          }

          foundRecord = {
            id: eventReg.id,
            qr_token: eventReg.qr_token || eventReg.id,
            full_name: partName,
            email: partEmail,
            phone: partPhone,
            team_name: eventReg.details?.teamName || null,
            team_leader_name: eventReg.details?.teamLeaderName || partName,
            team_members_names: eventReg.details?.teamMembersNames || eventReg.details?.partnerName || null,
            checked_in_at: eventReg.checked_in_at || eventReg.details?.checked_in_at,
          };
        }
      } catch (e) {
        // ignore
      }
    }

    // CASE 1: Token does not match any record anywhere
    if (!foundRecord) {
      return NextResponse.json(
        {
          success: false,
          code: "INVALID_QR",
          error: "Invalid QR pass — no matching registration found in any event table",
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
      EVENT_TABLE_MAP[gateEventSlug]?.name ||
      EVENTS_DATA.find((e) => e.slug === gateEventSlug)?.name ||
      gateEventSlug.toUpperCase().replace(/-/g, " ");

    const matchedShortCode = getShortCode(foundRecord.qr_token || foundRecord.id);

    // CASE 2: Wrong Gate
    if (foundEventSlug !== gateEventSlug) {
      return NextResponse.json(
        {
          success: false,
          code: "WRONG_GATE",
          error: `Wrong gate — this pass is for ${actualEventName}`,
          actualEvent: actualEventName,
          gateEvent: gateEventName,
          shortCode: matchedShortCode,
          attendee: attendeeInfo,
        },
        { status: 400 }
      );
    }

    // CASE 3: Already Checked In
    const existingCheckin = foundRecord.checked_in_at || foundRecord.details?.checked_in_at;
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
          error: `Already checked in at ${formattedTime} (${formattedDate})`,
          checkedInAt: existingCheckin,
          formattedTime,
          formattedDate,
          event: actualEventName,
          shortCode: matchedShortCode,
          attendee: attendeeInfo,
        },
        { status: 409 }
      );
    }

    // CASE 4: Valid Check-in!
    const checkinTimestamp = new Date().toISOString();

    // Update the event table directly
    if (foundTable && foundTable !== "registration_events") {
      try {
        const { error: updErr } = await supabaseAdmin
          .from(foundTable)
          .update({
            checked_in_at: checkinTimestamp,
            checked_in_by: volunteerEmail,
          })
          .eq("id", foundRecord.id);

        if (updErr) {
          // If checked_in_at column does not exist yet on the event table, try updating checked_in_at in registration_events
          console.warn(`Could not update checked_in_at on ${foundTable}:`, updErr.message);
        }
      } catch (err) {
        console.error(`Error updating checkin on ${foundTable}:`, err);
      }
    }

    // Also sync to registration_events if present
    try {
      await supabaseAdmin
        .from("registration_events")
        .update({
          checked_in_at: checkinTimestamp,
          checked_in_by: volunteerEmail,
        })
        .or(`id.eq.${foundRecord.id}${foundRecord.qr_token ? `,qr_token.eq.${foundRecord.qr_token}` : ""}`);
    } catch (e) {
      // ignore
    }

    return NextResponse.json({
      success: true,
      code: "CHECKIN_CONFIRMED",
      message: "Check-in verified successfully",
      checkedInAt: checkinTimestamp,
      event: actualEventName,
      eventSlug: foundEventSlug,
      shortCode: matchedShortCode,
      attendee: attendeeInfo,
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
