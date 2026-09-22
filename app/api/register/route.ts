import { NextRequest, NextResponse } from "next/server";
import { registrationSchema } from "@/lib/schema";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

// In-memory fallback stores per event for development/preview when Supabase env keys are not provided
const fallbackStores: Record<string, any[]> = {
  "startup-roulette": [],
  "the-war-room": [],
  "the-boardroom": [],
  "entre-prenormie": [],
  "bulls-and-bears": [],
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = registrationSchema.parse(body);

    const submissionId = `REG-${Math.floor(100000 + Math.random() * 900000)}`;
    const eventSlug = validatedData.selectedEvents[0];
    const timestamp = new Date().toISOString();

    // Verify if registrations are open for this event
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data: eventRow } = await supabaseAdmin
          .from("events")
          .select("registration_open, name")
          .eq("slug", eventSlug)
          .maybeSingle();

        if (eventRow && eventRow.registration_open === false) {
          return NextResponse.json(
            {
              success: false,
              error: `Registrations for ${eventRow.name || eventSlug} are currently closed by festival organizers.`,
            },
            { status: 403 }
          );
        }
      } catch (checkErr) {
        console.warn("Could not check event registration status:", checkErr);
      }
    }

    const qrToken = crypto.randomUUID();
    let details: Record<string, any> = {};

    if (eventSlug === "startup-roulette") {
      details = {
        teamName: validatedData.startupRoulette?.teamName || "",
        teamLeaderName: validatedData.startupRoulette?.teamLeaderName || validatedData.fullName || "",
        teamMembersNames: validatedData.startupRoulette?.teamMembersNames || "",
        ideaName: validatedData.startupRoulette?.ideaName || "",
        ideaDescription: validatedData.startupRoulette?.ideaDescription || "",
      };
    } else if (eventSlug === "the-war-room") {
      details = {
        teamName: validatedData.theWarRoom?.teamName || "",
        teamLeaderName: validatedData.theWarRoom?.teamLeaderName || validatedData.fullName || "",
        teamMembersNames: validatedData.theWarRoom?.teamMembersNames || "",
      };
    } else if (eventSlug === "the-boardroom") {
      details = {
        teamName: validatedData.theBoardroom?.teamName || "",
        teamLeaderName: validatedData.theBoardroom?.teamLeaderName || validatedData.fullName || "",
        partnerName: validatedData.theBoardroom?.teamMembersNames || "",
        teamMembersNames: validatedData.theBoardroom?.teamMembersNames || "",
      };
    } else if (eventSlug === "entre-prenormie") {
      details = {
        founderDiscussionTopic: validatedData.entrePrenormie?.founderDiscussionTopic || "",
      };
    }

    if (isSupabaseConfigured && supabaseAdmin) {
      const db = supabaseAdmin;
      let insertedId = submissionId;

      // Dedicated event table (Primary and single source of truth)
      try {
        const safeInsertEventRow = async (tableName: string, payload: Record<string, any>) => {
          const { data, error: insErr } = await db
            .from(tableName)
            .insert({
              ...payload,
              qr_token: qrToken,
            })
            .select("id")
            .maybeSingle();

          if (!insErr && data?.id) {
            return data.id;
          }

          if (insErr) {
            // If qr_token column does not exist yet, fallback to inserting without it
            const { data: retryData } = await db
              .from(tableName)
              .insert(payload)
              .select("id")
              .maybeSingle();
            return retryData?.id || null;
          }
          return null;
        };

        let rowId: string | null = null;
        if (eventSlug === "startup-roulette") {
          rowId = await safeInsertEventRow("registrations_startup_roulette", {
            full_name: validatedData.fullName,
            email: validatedData.email,
            phone: validatedData.phone,
            team_name: validatedData.startupRoulette?.teamName || "",
            team_leader_name: validatedData.startupRoulette?.teamLeaderName || validatedData.fullName || "",
            team_members_names: validatedData.startupRoulette?.teamMembersNames || "",
            idea_name: validatedData.startupRoulette?.ideaName || "",
            idea_description: validatedData.startupRoulette?.ideaDescription || "",
            status: "confirmed",
          });
        } else if (eventSlug === "the-war-room") {
          rowId = await safeInsertEventRow("registrations_the_war_room", {
            full_name: validatedData.fullName,
            email: validatedData.email,
            phone: validatedData.phone,
            team_name: validatedData.theWarRoom?.teamName || "",
            team_leader_name: validatedData.theWarRoom?.teamLeaderName || validatedData.fullName || "",
            team_members_names: validatedData.theWarRoom?.teamMembersNames || "",
            status: "confirmed",
          });
        } else if (eventSlug === "the-boardroom") {
          rowId = await safeInsertEventRow("registrations_the_boardroom", {
            full_name: validatedData.fullName,
            email: validatedData.email,
            phone: validatedData.phone,
            team_name: validatedData.theBoardroom?.teamName || "",
            team_leader_name: validatedData.theBoardroom?.teamLeaderName || validatedData.fullName || "",
            partner_name: validatedData.theBoardroom?.teamMembersNames || "",
            status: "confirmed",
          });
        } else if (eventSlug === "entre-prenormie") {
          rowId = await safeInsertEventRow("registrations_entre_prenormie", {
            full_name: validatedData.fullName,
            email: validatedData.email,
            phone: validatedData.phone,
            founder_discussion_topic: validatedData.entrePrenormie?.founderDiscussionTopic || "",
            status: "confirmed",
          });
        } else if (eventSlug === "bulls-and-bears") {
          rowId = await safeInsertEventRow("registrations_bulls_and_bears", {
            full_name: validatedData.fullName,
            email: validatedData.email,
            phone: validatedData.phone,
            status: "confirmed",
          });
        }

        if (rowId) {
          insertedId = rowId;
        }
      } catch (err) {
        console.error("Error inserting into event registration table:", err);
      }

      return NextResponse.json({
        success: true,
        registrationId: insertedId,
        submissionCode: submissionId,
        qrToken: qrToken,
        message: "Registration successfully recorded",
        data: validatedData,
      });
    }

    // Fallback in-memory storage per event
    const record = {
      id: submissionId,
      ...validatedData,
      createdAt: timestamp,
      status: "confirmed",
    };

    if (!fallbackStores[eventSlug]) {
      fallbackStores[eventSlug] = [];
    }
    fallbackStores[eventSlug].unshift(record);

    return NextResponse.json({
      success: true,
      registrationId: submissionId,
      submissionCode: submissionId,
      message: "Registration successfully confirmed",
      data: record,
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.errors || error.message || "Failed to process registration",
      },
      { status: 400 }
    );
  }
}

export async function GET() {
  const allRegistrations = Object.values(fallbackStores).flat();
  return NextResponse.json({
    total: allRegistrations.length,
    stores: fallbackStores,
  });
}

