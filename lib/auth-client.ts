import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * Retrieves standard Authorization headers containing the verified Supabase
 * session access token for API requests.
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      if (token) {
        return {
          Authorization: `Bearer ${token}`,
        };
      }
    }

    // Preview / development mode fallback when Supabase is not configured
    const adminEmail = sessionStorage.getItem("cv_supabase_admin");
    const volEmail = sessionStorage.getItem("cv_vol_email");
    const fallbackEmail = adminEmail || volEmail;

    if (fallbackEmail) {
      return {
        Authorization: `Bearer ${fallbackEmail}`,
      };
    }
  } catch (err) {
    console.warn("Could not retrieve auth headers:", err);
  }

  return {};
}

/**
 * Retrieves the raw session access token if available.
 */
export async function getAuthToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  try {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.auth.getSession();
      return data?.session?.access_token || null;
    }
    return sessionStorage.getItem("cv_supabase_admin") || sessionStorage.getItem("cv_vol_email") || null;
  } catch {
    return null;
  }
}
