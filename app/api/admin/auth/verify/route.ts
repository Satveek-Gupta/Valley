import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { authorized: false, error: "Email is required" },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured || !supabaseAdmin) {
      // Local dev / preview fallback: mock credentials
      const isVolunteer = email.includes("volunteer") || body.password === "volunteer";
      if (isVolunteer) {
        return NextResponse.json({
          authorized: false,
          isVolunteer: true,
          role: "volunteer",
          error: "Volunteer accounts are restricted to the Gate Scanner station.",
        });
      }
      return NextResponse.json({
        authorized: true,
        isVolunteer: false,
        role: "admin",
        email,
      });
    }

    // Query the admins table using the service role client (bypasses RLS safely)
    const { data: adminRow, error } = await supabaseAdmin
      .from("admins")
      .select("id, email, role")
      .ilike("email", email)
      .maybeSingle();

    if (error) {
      console.error("Error looking up admin record:", error);
      return NextResponse.json(
        { authorized: false, error: "Database error verifying authorization" },
        { status: 500 }
      );
    }

    if (!adminRow) {
      return NextResponse.json(
        {
          authorized: false,
          isVolunteer: false,
          role: null,
          error: "Access denied. Your account does not have administrator privileges.",
        },
        { status: 403 }
      );
    }

    if (adminRow.role === "volunteer") {
      return NextResponse.json({
        authorized: false,
        isVolunteer: true,
        role: "volunteer",
        error: "Volunteer accounts cannot access the Admin Dashboard. Please use the Gate Scanner.",
      });
    }

    if (adminRow.role === "admin" || adminRow.role === "superadmin") {
      return NextResponse.json({
        authorized: true,
        isVolunteer: false,
        role: adminRow.role,
        email: adminRow.email,
      });
    }

    return NextResponse.json(
      {
        authorized: false,
        isVolunteer: false,
        role: adminRow.role,
        error: "Access denied.",
      },
      { status: 403 }
    );
  } catch (err: any) {
    console.error("Admin verification error:", err);
    return NextResponse.json(
      { authorized: false, error: err.message || "Failed to verify admin status" },
      { status: 500 }
    );
  }
}
