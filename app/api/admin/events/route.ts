import { NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { slug } = body;

    if (!slug) {
      return NextResponse.json(
        { error: "Event slug is required" },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured || !supabaseAdmin) {
      // Return simulated success in preview/offline mode
      return NextResponse.json({
        success: true,
        message: "Event updated in preview mode (Supabase not configured)",
        event: body,
      });
    }

    // Quick toggle: if updating registration status only
    if (typeof body.registrationOpen === "boolean" && (!body.name || Object.keys(body).length <= 4)) {
      const { data: updateData, error: updateError } = await supabaseAdmin
        .from("events")
        .update({
          registration_open: body.registrationOpen,
          updated_at: new Date().toISOString(),
        })
        .eq("slug", slug)
        .select()
        .single();

      if (!updateError && updateData) {
        return NextResponse.json({
          success: true,
          message: `Registration for ${updateData.name || slug} is now ${body.registrationOpen ? "OPEN" : "CLOSED"}`,
          event: updateData,
        });
      } else if (updateError) {
        console.warn("Could not update registration_open column on events table:", updateError.message);
      }
    }

    const payload: Record<string, any> = {
      slug: body.slug,
      name: body.name,
      day: Number(body.day) || 1,
      date_label: body.dateLabel || `DAY 0${body.day || 1}`,
      tagline: body.tagline || "",
      description: body.description || "",
      team_size: body.teamSize || "",
      format: body.format || "",
      venue: body.venue || "",
      timing: body.timing || "",
      badge_color: body.badgeColor || "#7C3AED",
      tag_type: body.tagType || "violet",
      icon_name: body.iconName || "Sparkles",
      rounds: Array.isArray(body.rounds) ? body.rounds : [],
      rewards: Array.isArray(body.rewards) ? body.rewards : typeof body.rewards === "string" ? [body.rewards] : [],
      internship_opportunity: body.internshipOpportunity || null,
      featured: Boolean(body.featured),
      registration_open: body.registrationOpen !== false,
      updated_at: new Date().toISOString(),
    };

    let { data, error } = await supabaseAdmin
      .from("events")
      .upsert(payload, { onConflict: "slug" })
      .select()
      .single();

    if (error && error.message?.includes("registration_open")) {
      // If column doesn't exist yet, retry without registration_open
      console.warn("Retrying event upsert without registration_open column:", error.message);
      delete payload.registration_open;
      const retry = await supabaseAdmin
        .from("events")
        .upsert(payload, { onConflict: "slug" })
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error("Supabase event update error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to update event in database" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Event updated successfully",
      event: data,
    });
  } catch (error: any) {
    console.error("Error in admin events API:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
