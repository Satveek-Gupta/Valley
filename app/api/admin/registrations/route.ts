import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: regs, error } = await supabase
        .from("registrations")
        .select(`
          id,
          status,
          created_at,
          participants (
            full_name,
            email,
            phone
          ),
          registration_events (
            event_slug,
            details
          )
        `)
        .order("created_at", { ascending: false });

      if (!error && regs) {
        return NextResponse.json({
          registrations: regs.map((r: any) => ({
            id: r.id,
            fullName: r.participants?.full_name,
            email: r.participants?.email,
            phone: r.participants?.phone,
            selectedEvents: r.registration_events?.map((e: any) => e.event_slug) || [],
            createdAt: r.created_at,
            status: r.status,
          })),
        });
      }
    } catch (e) {
      console.error("Supabase fetch error:", e);
    }
  }

  return NextResponse.json({
    registrations: [],
  });
}
