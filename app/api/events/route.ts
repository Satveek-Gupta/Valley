import { NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { EVENTS_DATA, EventItem } from "@/lib/mock-data";

export async function GET() {
  try {
    if (!isSupabaseConfigured || !supabaseAdmin) {
      return NextResponse.json({ events: EVENTS_DATA });
    }

    const { data, error } = await supabaseAdmin
      .from("events")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ events: EVENTS_DATA });
    }

    // Transform snake_case columns from Supabase into camelCase EventItem
    const formattedEvents: EventItem[] = data.map((row: any) => ({
      id: row.slug || row.id,
      slug: row.slug,
      name: row.name,
      day: row.day,
      dateLabel: row.date_label || `DAY 0${row.day}`,
      tagline: row.tagline || "",
      description: row.description || "",
      teamSize: row.team_size || "",
      format: row.format || "",
      venue: row.venue || "",
      timing: row.timing || "",
      badgeColor: row.badge_color || "#7C3AED",
      tagType: (row.tag_type as any) || "violet",
      iconName: row.icon_name || "Sparkles",
      rounds: Array.isArray(row.rounds) ? row.rounds : [],
      rewards: Array.isArray(row.rewards) ? row.rewards : typeof row.rewards === "string" ? [row.rewards] : [],
      internshipOpportunity: row.internship_opportunity || undefined,
      featured: Boolean(row.featured),
    }));

    return NextResponse.json({ events: formattedEvents });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json({ events: EVENTS_DATA });
  }
}
