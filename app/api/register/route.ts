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

      // 1. Unified Relational Schema: participants -> registrations -> registration_events
      try {
        // Upsert or fetch participant
        let participantId: string | null = null;
        const { data: existingParticipant } = await supabaseAdmin
          .from("participants")
          .select("id")
          .eq("email", validatedData.email.trim().toLowerCase())
          .maybeSingle();

        if (existingParticipant?.id) {
          participantId = existingParticipant.id;
          await supabaseAdmin
            .from("participants")
            .update({
              full_name: validatedData.fullName,
              phone: validatedData.phone,
            })
            .eq("id", participantId);
        } else {
          const { data: newParticipant, error: pError } = await supabaseAdmin
            .from("participants")
            .insert({
              full_name: validatedData.fullName,
              email: validatedData.email.trim().toLowerCase(),
              phone: validatedData.phone,
            })
            .select("id")
            .single();
          if (!pError && newParticipant) {
            participantId = newParticipant.id;
          }
        }

        if (participantId) {
          // Create registration record
          const { data: regData, error: regError } = await supabaseAdmin
            .from("registrations")
            .insert({
              participant_id: participantId,
              confirmed_rules: true,
              status: "confirmed",
            })
            .select("id")
            .single();

          if (!regError && regData?.id) {
            insertedId = regData.id;
            // Create registration_events with unique qr_token
            const { error: eventRegError } = await supabaseAdmin
              .from("registration_events")
              .insert({
                registration_id: regData.id,
                event_slug: eventSlug,
                details,
                qr_token: qrToken,
              });

            if (eventRegError) {
              // If qr_token column doesn't exist yet, retry without qr_token
              console.warn("Retrying registration_events insert without qr_token:", eventRegError.message);
              await supabaseAdmin
                .from("registration_events")
                .insert({
                  registration_id: regData.id,
                  event_slug: eventSlug,
                  details,
                });
            }
          }
        }
      } catch (err) {
        console.error("Error inserting into unified registration tables:", err);
      }

      // 2. Event-specific tables (primary tables shown in Supabase Table Editor)
      try {
        const safeInsertEventRow = async (tableName: string, payload: Record<string, any>) => {
          const { error: insErr } = await db.from(tableName).insert({
            ...payload,
            qr_token: qrToken,
          });
          if (insErr) {
            // If qr_token column does not exist yet, fallback to inserting without it
            await db.from(tableName).insert(payload);
          }
        };

        if (eventSlug === "startup-roulette") {
          await safeInsertEventRow("registrations_startup_roulette", {
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
          await safeInsertEventRow("registrations_the_war_room", {
            full_name: validatedData.fullName,
            email: validatedData.email,
            phone: validatedData.phone,
            team_name: validatedData.theWarRoom?.teamName || "",
            team_leader_name: validatedData.theWarRoom?.teamLeaderName || validatedData.fullName || "",
            team_members_names: validatedData.theWarRoom?.teamMembersNames || "",
            status: "confirmed",
          });
        } else if (eventSlug === "the-boardroom") {
          await safeInsertEventRow("registrations_the_boardroom", {
            full_name: validatedData.fullName,
            email: validatedData.email,
            phone: validatedData.phone,
            team_name: validatedData.theBoardroom?.teamName || "",
            team_leader_name: validatedData.theBoardroom?.teamLeaderName || validatedData.fullName || "",
            partner_name: validatedData.theBoardroom?.teamMembersNames || "",
            status: "confirmed",
          });
        } else if (eventSlug === "entre-prenormie") {
          await safeInsertEventRow("registrations_entre_prenormie", {
            full_name: validatedData.fullName,
            email: validatedData.email,
            phone: validatedData.phone,
            founder_discussion_topic: validatedData.entrePrenormie?.founderDiscussionTopic || "",
            status: "confirmed",
          });
        } else if (eventSlug === "bulls-and-bears") {
          await safeInsertEventRow("registrations_bulls_and_bears", {
            full_name: validatedData.fullName,
            email: validatedData.email,
            phone: validatedData.phone,
            status: "confirmed",
          });
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

