import { NextRequest, NextResponse } from "next/server";
import { registrationSchema } from "@/lib/schema";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

// In-memory fallback store for development/preview when Supabase env keys are not provided
const fallbackRegistrations: any[] = [];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = registrationSchema.parse(body);

    const submissionId = `REG-${Math.floor(100000 + Math.random() * 900000)}`;
    const timestamp = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      // 1. Insert participant
      const { data: participantData, error: pError } = await supabase
        .from("participants")
        .insert({
          full_name: validatedData.fullName,
          email: validatedData.email,
          phone: validatedData.phone,
        })
        .select("id")
        .single();

      if (pError) throw pError;

      // 2. Insert registration record
      const { data: regData, error: rError } = await supabase
        .from("registrations")
        .insert({
          participant_id: participantData.id,
          confirmed_rules: validatedData.confirmedRules,
          status: "confirmed",
        })
        .select("id")
        .single();

      if (rError) throw rError;

      // 3. Insert junction records per selected event
      const eventRows = validatedData.selectedEvents.map((slug) => {
        let details: any = {};
        if (slug === "startup-roulette") details = validatedData.startupRoulette || {};
        if (slug === "the-war-room") details = validatedData.theWarRoom || {};
        if (slug === "the-boardroom") details = validatedData.theBoardroom || {};
        if (slug === "entre-prenormie") details = validatedData.entrePrenormie || {};
        if (slug === "bay-area") details = validatedData.bayArea || {};

        return {
          registration_id: regData.id,
          event_slug: slug,
          details,
        };
      });

      const { error: eError } = await supabase.from("registration_events").insert(eventRows);
      if (eError) throw eError;

      return NextResponse.json({
        success: true,
        registrationId: regData.id,
        submissionCode: submissionId,
        message: "Registration successfully recorded in Supabase",
        data: validatedData,
      });
    }

    // Fallback in-memory storage
    const record = {
      id: submissionId,
      ...validatedData,
      createdAt: timestamp,
      status: "confirmed",
    };
    fallbackRegistrations.unshift(record);

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
  return NextResponse.json({
    total: fallbackRegistrations.length,
    registrations: fallbackRegistrations,
  });
}
