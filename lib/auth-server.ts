import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { getRestrictedEventSlug } from "@/lib/volunteer-gates";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: "admin" | "superadmin" | "volunteer" | "attendee";
  isAdmin: boolean;
  isVolunteer: boolean;
  restrictedEventSlug: string | null;
}

/**
 * Verifies the incoming request's Supabase Auth session token via the Authorization header.
 * Cryptographically validates the JWT against Supabase Auth service and resolves the
 * user's verified permissions and gate restrictions from the database.
 */
export async function verifyAuth(req: Request): Promise<AuthenticatedUser | null> {
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "")?.trim();

  // 1. Local preview / development fallback when Supabase is not connected
  if (!isSupabaseConfigured || !supabaseAdmin) {
    if (token) {
      const isVol = token.includes("volunteer") || token.includes("gate");
      const cleanEmail = token.includes("@") ? token.toLowerCase().trim() : "admin@cabinet.local";
      const restricted = getRestrictedEventSlug(cleanEmail);

      return {
        id: "mock-user-id",
        email: cleanEmail,
        role: isVol ? "volunteer" : "admin",
        isAdmin: !isVol,
        isVolunteer: isVol || Boolean(restricted),
        restrictedEventSlug: restricted,
      };
    }
    return null;
  }

  // 2. Production mode: Strict token requirement
  if (!token) {
    return null;
  }

  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user || !data.user.email) {
      return null;
    }

    const verifiedEmail = data.user.email.toLowerCase().trim();

    // Query admin role record directly from the database using service role client
    const { data: adminRow } = await supabaseAdmin
      .from("admins")
      .select("id, email, role")
      .ilike("email", verifiedEmail)
      .maybeSingle();

    if (adminRow && (adminRow.role === "admin" || adminRow.role === "superadmin")) {
      return {
        id: data.user.id,
        email: verifiedEmail,
        role: adminRow.role,
        isAdmin: true,
        isVolunteer: false,
        restrictedEventSlug: null,
      };
    }

    // Determine volunteer status and gate restriction strictly from verified email
    const restrictedSlug = getRestrictedEventSlug(verifiedEmail);
    const isVolunteer = adminRow?.role === "volunteer" || Boolean(restrictedSlug);

    return {
      id: data.user.id,
      email: verifiedEmail,
      role: isVolunteer ? "volunteer" : "attendee",
      isAdmin: false,
      isVolunteer,
      restrictedEventSlug: restrictedSlug,
    };
  } catch (err) {
    console.error("verifyAuth server exception:", err);
    return null;
  }
}
