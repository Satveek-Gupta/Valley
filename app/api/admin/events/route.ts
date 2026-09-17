import { NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

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

    const payload = {
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
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from("events")
      .upsert(payload, { onConflict: "slug" })
      .select()
      .single();

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
