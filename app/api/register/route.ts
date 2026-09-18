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

    if (isSupabaseConfigured && supabaseAdmin) {
      let insertedId = submissionId;

      if (eventSlug === "startup-roulette") {
        const { data, error } = await supabaseAdmin
          .from("registrations_startup_roulette")
          .insert({
            full_name: validatedData.fullName,
            email: validatedData.email,
            phone: validatedData.phone,
            team_name: validatedData.startupRoulette?.teamName || "",
            team_leader_name: validatedData.startupRoulette?.teamLeaderName || validatedData.fullName || "",
            team_members_names: validatedData.startupRoulette?.teamMembersNames || "",
            idea_name: validatedData.startupRoulette?.ideaName || "",
            idea_description: validatedData.startupRoulette?.ideaDescription || "",
            status: "confirmed",
          })
          .select("id")
          .single();

        if (error) throw error;
        if (data?.id) insertedId = data.id;
      } else if (eventSlug === "the-war-room") {
        const { data, error } = await supabaseAdmin
          .from("registrations_the_war_room")
          .insert({
            full_name: validatedData.fullName,
            email: validatedData.email,
            phone: validatedData.phone,
            team_name: validatedData.theWarRoom?.teamName || "",
            team_leader_name: validatedData.theWarRoom?.teamLeaderName || validatedData.fullName || "",
            team_members_names: validatedData.theWarRoom?.teamMembersNames || "",
            status: "confirmed",
          })
          .select("id")
          .single();

        if (error) throw error;
        if (data?.id) insertedId = data.id;
      } else if (eventSlug === "the-boardroom") {
        const { data, error } = await supabaseAdmin
          .from("registrations_the_boardroom")
          .insert({
            full_name: validatedData.fullName,
            email: validatedData.email,
            phone: validatedData.phone,
            team_name: validatedData.theBoardroom?.teamName || "",
            team_leader_name: validatedData.theBoardroom?.teamLeaderName || validatedData.fullName || "",
            partner_name: validatedData.theBoardroom?.teamMembersNames || "",
            status: "confirmed",
          })
          .select("id")
          .single();

        if (error) throw error;
        if (data?.id) insertedId = data.id;
      } else if (eventSlug === "entre-prenormie") {
        const { data, error } = await supabaseAdmin
          .from("registrations_entre_prenormie")
          .insert({
            full_name: validatedData.fullName,
            email: validatedData.email,
            phone: validatedData.phone,
            founder_discussion_topic: validatedData.entrePrenormie?.founderDiscussionTopic || "",
            status: "confirmed",
          })
          .select("id")
          .single();

        if (error) throw error;
        if (data?.id) insertedId = data.id;
      } else if (eventSlug === "bulls-and-bears") {
        const { data, error } = await supabaseAdmin
          .from("registrations_bulls_and_bears")
          .insert({
            full_name: validatedData.fullName,
            email: validatedData.email,
            phone: validatedData.phone,
            status: "confirmed",
          })
          .select("id")
          .single();

        if (error) throw error;
        if (data?.id) insertedId = data.id;
      }

      return NextResponse.json({
        success: true,
        registrationId: insertedId,
        submissionCode: submissionId,
        message: `Registration recorded in table registrations_${eventSlug.replace(/-/g, "_")}`,
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

