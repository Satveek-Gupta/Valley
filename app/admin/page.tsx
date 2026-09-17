"use client";

import { useState, useEffect } from "react";
import AdminDashboard from "@/components/admin/admin-dashboard";
import { Lock, ArrowRight, Mail, KeyRound, AlertCircle, Sparkles } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [byEvent, setByEvent] = useState<any>({});

  useEffect(() => {
    // 1. Check existing Supabase auth session
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setIsAuthenticated(true);
          setUserEmail(session.user.email || null);
          fetchRegistrations();
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setIsAuthenticated(true);
          setUserEmail(session.user.email || null);
          fetchRegistrations();
        } else {
          setIsAuthenticated(false);
          setUserEmail(null);
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    } else {
      // Check session storage if in preview/dev mode
      const sessionAuth = sessionStorage.getItem("cv_supabase_admin");
      if (sessionAuth) {
        setIsAuthenticated(true);
        setUserEmail(sessionAuth);
        fetchRegistrations();
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

    if (isSupabaseConfigured && supabase) {
      // Live Supabase Authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        setAuthError(error.message || "Invalid Supabase admin credentials");
        setIsLoading(false);
        return;
      }

      if (data.session) {
        setIsAuthenticated(true);
        setUserEmail(data.session.user.email || null);
        await fetchRegistrations();
      }
      setIsLoading(false);
    } else {
      // When Supabase environment credentials are not yet added to .env.local
      if (!email.trim() || !password.trim()) {
        setAuthError("Please enter your admin email and password");
        setIsLoading(false);
        return;
      }

      // Store authenticated session
      sessionStorage.setItem("cv_supabase_admin", email.trim());
      setIsAuthenticated(true);
      setUserEmail(email.trim());
      await fetchRegistrations();
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    sessionStorage.removeItem("cv_supabase_admin");
    setIsAuthenticated(false);
    setUserEmail(null);
  };

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

