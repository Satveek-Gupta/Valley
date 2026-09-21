"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminDashboard from "@/components/admin/admin-dashboard";
import { Lock, ArrowRight, Mail, KeyRound, AlertCircle, Sparkles, QrCode } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("admin");
  const [isVerifyingRole, setIsVerifyingRole] = useState(true);
  const [volunteerBlocked, setVolunteerBlocked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [byEvent, setByEvent] = useState<any>({});

  const verifyAdminRole = async (emailToCheck: string) => {
    setIsVerifyingRole(true);
    try {
      const res = await fetch("/api/admin/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToCheck }),
      });
      const data = await res.json();

      if (data.authorized && (data.role === "admin" || data.role === "superadmin")) {
        setIsAuthenticated(true);
        setUserEmail(emailToCheck);
        setUserRole(data.role);
        setVolunteerBlocked(false);
        sessionStorage.setItem("cv_user_role", data.role);
        sessionStorage.setItem("cv_supabase_admin", emailToCheck);
        await fetchRegistrations();
        return true;
      } else if (data.isVolunteer || data.role === "volunteer") {
        // Explicitly block volunteer accounts from viewing the admin dashboard
        setIsAuthenticated(false);
        setVolunteerBlocked(true);
        sessionStorage.setItem("cv_user_role", "volunteer");
        setTimeout(() => {
          router.push("/vol/scan");
        }, 2200);
        return false;
      } else {
        setIsAuthenticated(false);
        setAuthError(data.error || "Access denied. Administrator privileges required.");
        return false;
      }
    } catch (e: any) {
      console.error("Admin verification error:", e);
      setIsAuthenticated(false);
      setAuthError("Failed to verify administrator privileges.");
      return false;
    } finally {
      setIsVerifyingRole(false);
    }
  };

  useEffect(() => {
    // Check if volunteer is already flagged in session
    const savedRole = sessionStorage.getItem("cv_user_role");
    if (savedRole === "volunteer") {
      setVolunteerBlocked(true);
      setTimeout(() => {
        router.push("/vol/scan");
      }, 1500);
      setIsVerifyingRole(false);
      return;
    }

    // 1. Check existing Supabase auth session
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session?.user?.email) {
          await verifyAdminRole(session.user.email);
        } else {
          setIsVerifyingRole(false);
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user?.email) {
          await verifyAdminRole(session.user.email);
        } else {
          setIsAuthenticated(false);
          setUserEmail(null);
          setIsVerifyingRole(false);
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    } else {
      // Preview / dev mode
      const sessionAuth = sessionStorage.getItem("cv_supabase_admin");
      if (sessionAuth) {
        verifyAdminRole(sessionAuth);
      } else {
        setIsVerifyingRole(false);
      }
    }
  }, []);

  const fetchRegistrations = async () => {
    try {
      const res = await fetch("/api/admin/registrations");
      const json = await res.json();
      if (json.registrations) {
        setRegistrations(json.registrations);
      }
      if (json.byEvent) {
        setByEvent(json.byEvent);
      }
    } catch (e) {
      console.error("Failed to fetch admin registrations", e);
    }
  };

  const handleDeleteRegistration = (id: string, eventSlug: string) => {
    setRegistrations((prev) => prev.filter((r) => r.id !== id));
    setByEvent((prev: any) => {
      const copy = { ...prev };
      if (copy[eventSlug]) {
        copy[eventSlug] = copy[eventSlug].filter((r: any) => r.id !== id);
      }
      return copy;
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);
    setVolunteerBlocked(false);

    const cleanEmail = email.trim();

    if (isSupabaseConfigured && supabase) {
      // Live Supabase Authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      if (error) {
        setAuthError(error.message || "Invalid Supabase admin credentials");
        setIsLoading(false);
        return;
      }

      if (data.session?.user?.email) {
        await verifyAdminRole(data.session.user.email);
      }
      setIsLoading(false);
    } else {
      // Local preview / test mode
      if (!cleanEmail || !password.trim()) {
        setAuthError("Please enter your admin email and password");
        setIsLoading(false);
        return;
      }

      await verifyAdminRole(cleanEmail);
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    sessionStorage.removeItem("cv_supabase_admin");
    sessionStorage.removeItem("cv_user_role");
    setIsAuthenticated(false);
    setUserEmail(null);
    setVolunteerBlocked(false);
  };

  // State: Volunteer Blocked View
  if (volunteerBlocked) {
    return (
      <div className="min-h-screen bg-[#F4F4F6] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border-4 border-brand-ink p-8 shadow-[8px_8px_0px_0px_rgba(10,10,10,1)] text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 border-2 border-amber-300 text-amber-800 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
              VOLUNTEER ACCOUNT DETECTED
            </span>
            <h1 className="font-display text-2xl font-black uppercase mt-3 text-brand-ink">
              ADMIN ACCESS RESTRICTED
            </h1>
            <p className="text-xs text-zinc-600 font-medium mt-2 leading-relaxed">
              You are authenticated as a <strong>Gate Volunteer</strong>. Administrative fest management and sensitive export tables are strictly reserved for Cabinet Core organizers.
            </p>
          </div>

          <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs font-mono text-zinc-600 flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-lime animate-ping" />
            <span>Redirecting to Gate Scanner station...</span>
          </div>

          <div className="pt-2">
            <Link
              href="/vol/scan"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-brand-violet text-white font-black text-xs uppercase tracking-wider hover:bg-brand-ink transition-colors shadow-md"
            >
              <span>GO TO GATE SCANNER STATION</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isVerifyingRole) {
    return (
      <div className="min-h-screen bg-[#F4F4F6] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-10 h-10 border-4 border-brand-violet border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-xs text-zinc-500 uppercase font-bold tracking-wider">
            Verifying Admin Privileges...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F4F4F6] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border-2 border-brand-ink/20 p-8 shadow-xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-violet text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-violet/25">
            <Lock className="w-7 h-7" />
          </div>

          <span className="text-[10px] font-black uppercase tracking-widest text-brand-violet bg-brand-violet/10 px-3 py-1 rounded-full">
            SUPABASE AUTHENTICATED
          </span>

          <h1 className="font-display text-3xl font-black uppercase text-brand-ink mt-3 mb-2">
            ADMIN CONSOLE
          </h1>

          <p className="text-xs text-zinc-500 font-semibold mb-6">
            Sign in with your registered Student Cabinet Supabase credentials.
          </p>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-brand-ink mb-1">
                ADMIN EMAIL
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="admin@cabinet.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-zinc-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-violet"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-brand-ink mb-1">
                PASSWORD
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-zinc-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-violet"
                />
              </div>
            </div>

            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-brand-ink hover:bg-brand-violet text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md disabled:opacity-50"
            >
              {isLoading ? <span>AUTHENTICATING...</span> : (
                <>
                  <span>SIGN IN TO CONSOLE</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {!isSupabaseConfigured && (
            <div className="mt-6 p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-[10px] text-zinc-500 font-bold uppercase text-left">
              <span className="text-brand-violet">ℹ SUPABASE SETUP:</span> Add your <code className="text-brand-ink">NEXT_PUBLIC_SUPABASE_URL</code> & <code className="text-brand-ink">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in <code className="text-brand-ink">.env.local</code> to authenticate against live Supabase Auth users.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <AdminDashboard
      initialRegistrations={registrations}
      byEvent={byEvent}
      userEmail={userEmail}
      onLogout={handleLogout}
      onDeleteRegistration={handleDeleteRegistration}
    />
  );
}

