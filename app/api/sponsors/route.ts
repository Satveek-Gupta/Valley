import { NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { SPONSORS_LIST } from "@/lib/mock-data";

export async function GET() {
  try {
    if (!isSupabaseConfigured || !supabaseAdmin) {
      return NextResponse.json({ sponsors: SPONSORS_LIST });
    }

    const { data, error } = await supabaseAdmin
      .from("sponsors")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error querying sponsors table:", error);
      return NextResponse.json({ error: error.message, sponsors: [] });
    }

    // Return the actual database records (even if empty [])
    return NextResponse.json({ sponsors: data || [] });
  } catch (error) {
    console.error("Error fetching sponsors:", error);
    return NextResponse.json({ sponsors: [] });
  }
}
