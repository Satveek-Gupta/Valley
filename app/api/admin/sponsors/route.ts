import { NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { verifyAuth } from "@/lib/auth-server";

export async function POST(request: Request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || !auth.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Administrator privileges required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, tier, category, website_url, logo_url } = body;

    if (!name || !tier) {
      return NextResponse.json(
        { error: "Sponsor name and partner tier are required" },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured || !supabaseAdmin) {
      return NextResponse.json({
        success: true,
        message: "Sponsor added (preview mode)",
        sponsor: { id: `mock-${Date.now()}`, ...body },
      });
    }

    const { data, error } = await supabaseAdmin
      .from("sponsors")
      .insert([
        {
          name: name.trim(),
          tier: tier.trim(),
          category: (category || "Ecosystem").trim(),
          website_url: website_url ? website_url.trim() : null,
          logo_url: logo_url ? logo_url.trim() : null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Failed to insert sponsor:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, sponsor: data });
  } catch (err: any) {
    console.error("Error creating sponsor:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || !auth.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Administrator privileges required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, name, tier, category, website_url, logo_url, sort_order } = body;

    if (!id || !name || !tier) {
      return NextResponse.json(
        { error: "Sponsor ID, name, and partner tier are required" },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured || !supabaseAdmin) {
      return NextResponse.json({
        success: true,
        message: "Sponsor updated (preview mode)",
        sponsor: body,
      });
    }

    const { data, error } = await supabaseAdmin
      .from("sponsors")
      .update({
        name: name.trim(),
        tier: tier.trim(),
        category: (category || "Ecosystem").trim(),
        website_url: website_url ? website_url.trim() : null,
        logo_url: logo_url ? logo_url.trim() : null,
        sort_order: typeof sort_order === "number" ? sort_order : 0,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Failed to update sponsor:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, sponsor: data });
  } catch (err: any) {
    console.error("Error updating sponsor:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || !auth.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Administrator privileges required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Sponsor ID is required" },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured || !supabaseAdmin) {
      return NextResponse.json({
        success: true,
        message: "Sponsor deleted (preview mode)",
      });
    }

    const { error } = await supabaseAdmin
      .from("sponsors")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Failed to delete sponsor:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Sponsor deleted successfully" });
  } catch (err: any) {
    console.error("Error deleting sponsor:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
