"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Users,
  Store,
  Calendar,
  Layers,
  Sparkles,
  TrendingUp,
  Settings,
  ArrowUpRight,
  ExternalLink,
  ShieldAlert,
  Award,
  CheckCircle2,
  Clock,
  Power,
  KeyRound,
  Search,
  ShieldCheck,
  AlertCircle,
  RotateCcw,
  Check,
  X,
  UserCheck,
  QrCode,
  FileCheck2,
} from "lucide-react";
import confetti from "canvas-confetti";
import RegistrationsTable from "./registrations-table";
import StallManager from "./stall-manager";
import SettingsForm from "./settings-form";
import EventsManager from "./events-manager";
import SponsorsManager from "./sponsors-manager";
import { EVENTS_DATA, EventItem } from "@/lib/mock-data";
import { getAuthHeaders } from "@/lib/auth-client";

export default function AdminDashboard({
  initialRegistrations = [],
  byEvent,
  userEmail,
  onLogout,
  onDeleteRegistration,
}: {
  initialRegistrations: any[];
  byEvent?: any;
  userEmail?: string | null;
  onLogout?: () => void;
  onDeleteRegistration?: (id: string, eventSlug: string) => void;
}) {

  const [activeTab, setActiveTab] = useState<"overview" | "registrations" | "events" | "sponsors" | "stalls" | "settings">("overview");
  const [eventsList, setEventsList] = useState<EventItem[]>(EVENTS_DATA);
  const [togglingSlug, setTogglingSlug] = useState<string | null>(null);

  // Live registrations state
  const [registrations, setRegistrations] = useState<any[]>(initialRegistrations);

  useEffect(() => {
    setRegistrations(initialRegistrations);
  }, [initialRegistrations]);

  // Fallback Entry Verifier State
  const [fallbackInput, setFallbackInput] = useState("");
  const [fallbackGateSlug, setFallbackGateSlug] = useState("any");
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isConfirmingEntry, setIsConfirmingEntry] = useState(false);
  const [fallbackResult, setFallbackResult] = useState<any | null>(null);
  const [fallbackError, setFallbackError] = useState<string | null>(null);
  const [fallbackSuccess, setFallbackSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/events");
        const json = await res.json();
        if (json.events && json.events.length > 0) {
          setEventsList(json.events);
        }
      } catch (err) {
        console.error("Failed to load events in dashboard", err);
      }
    };
    fetchEvents();
  }, []);

  const handleToggleRegistration = async (slug: string, currentOpen: boolean) => {
    setTogglingSlug(slug);
    const newStatus = !currentOpen;
    setEventsList((prev) =>
      prev.map((e) => (e.slug === slug ? { ...e, registrationOpen: newStatus } : e))
    );
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch("/api/admin/events", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ slug, registrationOpen: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to toggle registration");
    } catch (err) {
      console.error(err);
      setEventsList((prev) =>
        prev.map((e) => (e.slug === slug ? { ...e, registrationOpen: currentOpen } : e))
      );
    } finally {
      setTogglingSlug(null);
    }
  };

  // Fallback code inspection & verification
  const handleVerifyCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = fallbackInput.trim();
    if (!clean) return;

    setIsVerifyingCode(true);
    setFallbackError(null);
    setFallbackSuccess(null);
    setFallbackResult(null);

    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          qrToken: clean,
          gateEventSlug: fallbackGateSlug,
          action: "lookup",
          adminOverride: true,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "No matching registration found");
      }
      setFallbackResult(data);
    } catch (err: any) {
      setFallbackError(err.message || "Failed to find registration");
    } finally {
      setIsVerifyingCode(false);
    }
  };

  // Confirm participant entry as admin
  const handleConfirmEntry = async (registrationId?: string, eventSlug?: string, shortCode?: string) => {
    const codeToUse = shortCode || registrationId || fallbackResult?.shortCode || fallbackInput.trim();
    const targetSlug = eventSlug || fallbackResult?.eventSlug || "any";

    setIsConfirmingEntry(true);
    setFallbackError(null);

    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          qrToken: codeToUse,
          registrationId: registrationId || fallbackResult?.registrationId,
          gateEventSlug: targetSlug,
          adminOverride: true,
          volunteerEmail: userEmail ? `${userEmail} (Admin Fallback)` : "Admin Console",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to confirm check-in");
      }

      // Success! Update local registrations
      const timestamp = data.checkedInAt || new Date().toISOString();
      const verifier = data.checkedInBy || (userEmail ? `${userEmail} (Admin Fallback)` : "Admin Console");
      const matchedId = registrationId || data.registrationId || fallbackResult?.registrationId;

      setRegistrations((prev) =>
        prev.map((r) =>
          (matchedId && r.id === matchedId) ||
          (r.qrToken && r.qrToken === codeToUse) ||
          ((r.qrToken || r.id).replace(/[^a-zA-Z0-9]/g, "").slice(-4).toUpperCase() === codeToUse.toUpperCase())
            ? { ...r, checkedInAt: timestamp, checkedInBy: verifier }
            : r
        )
      );

      if (fallbackResult) {
        setFallbackResult((prev: any) => ({
          ...prev,
          isAlreadyCheckedIn: true,
          checkedInAt: timestamp,
          checkedInBy: verifier,
        }));
      }

      setFallbackSuccess(
        `Entry confirmed for ${data.attendee?.fullName || "Attendee"} (${data.event || targetSlug.toUpperCase()})!`
      );

      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#7C3AED", "#C6F135", "#10B981", "#FF5A36", "#0A0A0A"],
        });
      } catch {
        // ignore
      }
    } catch (err: any) {
      setFallbackError(err.message || "Failed to confirm entry");
      throw err;
    } finally {
      setIsConfirmingEntry(false);
    }
  };

  // Reset participant check-in (undo)
  const handleResetEntry = async (registrationId: string, eventSlug: string, shortCode?: string) => {
    setIsConfirmingEntry(true);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          qrToken: shortCode || registrationId,
          registrationId,
          gateEventSlug: eventSlug,
          action: "reset",
          adminOverride: true,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to reset check-in");
      }

      setRegistrations((prev) =>
        prev.map((r) =>
          r.id === registrationId ? { ...r, checkedInAt: null, checkedInBy: null } : r
        )
      );

      if (fallbackResult) {
        setFallbackResult((prev: any) => ({
          ...prev,
          isAlreadyCheckedIn: false,
          checkedInAt: null,
          checkedInBy: null,
        }));
      }
      setFallbackSuccess(`Check-in reset for ${data.attendee?.fullName || "Attendee"}.`);
    } catch (err: any) {
      setFallbackError(err.message || "Failed to reset check-in");
      throw err;
    } finally {
      setIsConfirmingEntry(false);
    }
  };

  const handleDeleteRegistration = (id: string, eventSlug: string) => {
    setRegistrations((prev) => prev.filter((r) => r.id !== id));
    if (onDeleteRegistration) {
      onDeleteRegistration(id, eventSlug);
    }
  };

  // Calculations
  const totalRegistrations = registrations.length;
  const checkedInRegistrations = registrations
    .filter((r) => r.checkedInAt)
    .sort((a, b) => new Date(b.checkedInAt).getTime() - new Date(a.checkedInAt).getTime());
  const rouletteCount = byEvent?.["startup-roulette"]?.length ?? registrations.filter((r) => r.eventSlug === "startup-roulette" || r.selectedEvents?.includes("startup-roulette")).length;
  const warRoomCount = byEvent?.["the-war-room"]?.length ?? registrations.filter((r) => r.eventSlug === "the-war-room" || r.selectedEvents?.includes("the-war-room")).length;
  const boardroomCount = byEvent?.["the-boardroom"]?.length ?? registrations.filter((r) => r.eventSlug === "the-boardroom" || r.selectedEvents?.includes("the-boardroom")).length;
  const entreprenormieCount = byEvent?.["entre-prenormie"]?.length ?? registrations.filter((r) => r.eventSlug === "entre-prenormie" || r.selectedEvents?.includes("entre-prenormie")).length;
  const bullsCount = byEvent?.["bulls-and-bears"]?.length ?? registrations.filter((r) => r.eventSlug === "bulls-and-bears" || r.selectedEvents?.includes("bulls-and-bears")).length;
  const bayAreaCount = registrations.filter((r) => r.selectedEvents?.includes("bay-area")).length;

  const getEventCount = (slug: string) => {
    switch (slug) {
      case "startup-roulette": return rouletteCount;
      case "the-war-room": return warRoomCount;
      case "the-boardroom": return boardroomCount;
      case "entre-prenormie": return entreprenormieCount;
      case "bulls-and-bears": return bullsCount;
      case "bay-area": return bayAreaCount;
      default: return registrations.filter(r => r.eventSlug === slug || r.selectedEvents?.includes(slug)).length;
    }
  };


  return (
    <div className="min-h-screen bg-[#F4F4F6] text-brand-ink">
      
      {/* Admin Top Navigation */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-zinc-200 bg-white p-0.5 shadow-sm flex items-center justify-center">
              <Image
                src="/Cabinet Assets/cabinet-square-logo-white-bg.png"
                alt="Cabinet Valley Logo"
                width={36}
                height={36}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-display text-lg font-black uppercase text-brand-ink">
                CABINET VALLEY
              </span>
              <span className="text-[10px] uppercase font-bold text-brand-violet ml-2 px-2 py-0.5 rounded bg-brand-violet/10">
                ADMIN CONSOLE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {userEmail && (
              <span className="hidden sm:inline-block text-[11px] font-mono text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-full">
                {userEmail}
              </span>
            )}

            <button
              type="button"
              onClick={() => {
                setActiveTab("overview");
                setTimeout(() => {
                  const desk = document.getElementById("admin-fallback-desk");
                  if (desk) desk.scrollIntoView({ behavior: "smooth" });
                  const inp = document.getElementById("admin-fallback-input");
                  if (inp) inp.focus();
                }, 100);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-surface border-2 border-brand-ink text-brand-ink text-xs font-black uppercase hover:bg-brand-ink hover:text-white transition-colors shadow-xs"
              title="Verify 4-char attendee code or email fallback"
            >
              <KeyRound className="w-3.5 h-3.5 text-brand-violet" />
              <span>VERIFY CODE</span>
            </button>

            <Link
              href="/vol/scan"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-violet text-white text-xs font-black uppercase hover:bg-brand-violet-dark transition-colors shadow-sm"
            >
              <span>GATE SCANNER</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1 text-xs font-bold text-zinc-600 hover:text-brand-ink uppercase"
            >
              <span>LIVE SITE</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            {onLogout && (
              <button
                onClick={onLogout}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-zinc-300 hover:bg-zinc-100 text-zinc-700 text-xs font-bold uppercase transition-colors"
              >
                <span>SIGN OUT</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-zinc-500 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "overview"
                ? "border-brand-violet text-brand-violet font-black"
                : "border-transparent hover:text-brand-ink"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>OVERVIEW DASHBOARD</span>
          </button>

          <button
            onClick={() => setActiveTab("registrations")}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "registrations"
                ? "border-brand-violet text-brand-violet font-black"
                : "border-transparent hover:text-brand-ink"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>REGISTRATIONS ({totalRegistrations})</span>
          </button>

          <button
            onClick={() => setActiveTab("events")}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "events"
                ? "border-brand-violet text-brand-violet font-black"
                : "border-transparent hover:text-brand-ink"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>EVENTS & TRACKS</span>
          </button>

          <button
            onClick={() => setActiveTab("sponsors")}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "sponsors"
                ? "border-brand-violet text-brand-violet font-black"
                : "border-transparent hover:text-brand-ink"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>SPONSORS</span>
          </button>

          <button
            onClick={() => setActiveTab("stalls")}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "stalls"
                ? "border-brand-violet text-brand-violet font-black"
                : "border-transparent hover:text-brand-ink"
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>BAY AREA STALLS</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "settings"
                ? "border-brand-violet text-brand-violet font-black"
                : "border-transparent hover:text-brand-ink"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>FESTIVAL SETTINGS</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Gate Scan Station Banner */}
            <div className="bg-brand-ink text-white p-6 rounded-3xl border-2 border-brand-violet flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-lime animate-ping" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-lime">
                    GATE OPERATIONS STATION
                  </span>
                </div>
                <h3 className="font-display text-2xl font-black uppercase text-white">
                  VOLUNTEER & GATE CHECK-IN SCANNER
                </h3>
                <p className="text-xs text-zinc-300 max-w-xl mt-1">
                  Equip door volunteers with high-speed camera QR scanning for the 5 gated competitions with instant pass validation and multi-gate separation.
                </p>
              </div>
              <Link
                href="/vol/scan"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-brand-lime hover:bg-brand-lime-dark text-black font-black text-xs uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-md flex-shrink-0"
              >
                <span>OPEN SCAN STATION</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            {/* ADMIN FALLBACK: MANUAL ENTRY DESK & CODE VERIFIER */}
            <div id="admin-fallback-desk" className="bg-white rounded-3xl border-2 border-brand-ink p-6 sm:p-8 shadow-[4px_4px_0px_0px_#0A0A0A] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-violet text-white flex items-center justify-center shadow-md">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-brand-violet bg-brand-violet/10 px-2 py-0.5 rounded">
                        ADMIN FALLBACK ENTRY DESK
                      </span>
                      <span className="text-[10px] font-bold uppercase text-zinc-400">
                        OFFLINE / CAMERA FAILOVER
                      </span>
                    </div>
                    <h3 className="font-display text-xl sm:text-2xl font-black uppercase text-brand-ink">
                      VERIFY ATTENDEE CODE & CONFIRM ENTRY
                    </h3>
                  </div>
                </div>

                <div className="text-xs text-zinc-500 font-medium max-w-sm text-left sm:text-right">
                  Enter 4-character pass code, attendee email, or full UUID to inspect attendee specs and admit them directly.
                </div>
              </div>

              {/* Input Form Bar */}
              <form onSubmit={handleVerifyCode} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="sm:w-56 shrink-0">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-500 mb-1">
                    TRACK SCOPE
                  </label>
                  <select
                    value={fallbackGateSlug}
                    onChange={(e) => setFallbackGateSlug(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl border-2 border-brand-ink bg-zinc-50 text-xs font-bold uppercase text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-violet shadow-xs"
                  >
                    <option value="any">⚡ All 5 Tracks (Auto-Detect)</option>
                    <option value="startup-roulette">Startup Roulette</option>
                    <option value="the-war-room">The War Room</option>
                    <option value="the-boardroom">The Boardroom</option>
                    <option value="entre-prenormie">Entrepre-Normie</option>
                    <option value="bulls-and-bears">Bulls & Bears</option>
                  </select>
                </div>

                <div className="flex-1">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-500 mb-1">
                    PASS CODE, ATTENDEE EMAIL, OR UUID
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="admin-fallback-input"
                      type="text"
                      value={fallbackInput}
                      onChange={(e) => setFallbackInput(e.target.value)}
                      placeholder="e.g. 8E4B, name@gmail.com, or scan URL"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-brand-ink bg-white font-mono text-sm uppercase font-bold tracking-wider text-brand-ink placeholder:font-sans placeholder:normal-case placeholder:font-medium placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-violet shadow-xs"
                    />
                    {fallbackInput && (
                      <button
                        type="button"
                        onClick={() => {
                          setFallbackInput("");
                          setFallbackResult(null);
                          setFallbackError(null);
                          setFallbackSuccess(null);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-brand-ink"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="sm:self-end">
                  <button
                    type="submit"
                    disabled={isVerifyingCode || !fallbackInput.trim()}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-ink hover:bg-brand-violet text-white text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 disabled:pointer-events-none shadow-[2px_2px_0px_0px_#7C3AED] active:translate-x-0.5 active:translate-y-0.5"
                  >
                    {isVerifyingCode ? "SEARCHING DB..." : "VERIFY & INSPECT"}
                  </button>
                </div>
              </form>

              {/* Feedback messages */}
              {fallbackError && (
                <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-200 text-red-800 text-xs font-bold flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{fallbackError}</span>
                  </div>
                  <button
                    onClick={() => setFallbackError(null)}
                    className="text-[10px] uppercase font-black opacity-60 hover:opacity-100"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {fallbackSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{fallbackSuccess}</span>
                  </div>
                  <button
                    onClick={() => setFallbackSuccess(null)}
                    className="text-[10px] uppercase font-black opacity-60 hover:opacity-100"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Verification Result Card */}
              {fallbackResult && (
                <div className="p-5 sm:p-6 rounded-2xl border-2 border-brand-ink bg-brand-surface space-y-4 shadow-sm animate-in fade-in slide-in-from-top-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-zinc-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-brand-ink text-brand-lime flex items-center justify-center font-mono font-black text-lg border-2 border-brand-ink">
                        {fallbackResult.shortCode || "PASS"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="px-2.5 py-0.5 rounded-full bg-brand-violet text-white text-[10px] font-black uppercase tracking-wider">
                            {fallbackResult.event}
                          </span>
                          <span className="font-mono text-[11px] font-bold text-zinc-500">
                            CODE: <strong>{fallbackResult.shortCode}</strong>
                          </span>
                        </div>
                        <h4 className="font-display text-xl sm:text-2xl font-black uppercase text-brand-ink">
                          {fallbackResult.attendee?.fullName}
                        </h4>
                      </div>
                    </div>

                    {/* Live status badge */}
                    <div>
                      {fallbackResult.isAlreadyCheckedIn ? (
                        <div className="text-right">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-black uppercase tracking-wider">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>ALREADY CHECKED IN</span>
                          </span>
                          {fallbackResult.checkedInAt && (
                            <div className="text-[10px] text-zinc-500 font-mono mt-1">
                              at {new Date(fallbackResult.checkedInAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              {fallbackResult.checkedInBy && ` by ${fallbackResult.checkedInBy}`}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs font-black uppercase tracking-wider">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>PENDING ADMISSION</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metadata specs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-white p-4 rounded-xl border border-zinc-200">
                    <div>
                      <span className="block text-[10px] font-bold text-zinc-400 uppercase">EMAIL</span>
                      <span className="font-semibold text-brand-ink">{fallbackResult.attendee?.email || "—"}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-zinc-400 uppercase">PHONE</span>
                      <span className="font-semibold text-brand-ink font-mono">{fallbackResult.attendee?.phone || "—"}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-zinc-400 uppercase">TEAM / ROSTER</span>
                      <span className="font-semibold text-brand-ink">
                        {fallbackResult.attendee?.teamName || fallbackResult.attendee?.teamMembersNames || fallbackResult.attendee?.partnerName || "Individual Participant"}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <span className="text-[11px] text-zinc-500 font-medium">
                      {fallbackResult.isAlreadyCheckedIn
                        ? "Participant has already presented pass at gate."
                        : "Verify physical ID matches attendee details before confirming."}
                    </span>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {fallbackResult.isAlreadyCheckedIn ? (
                        <button
                          type="button"
                          disabled={isConfirmingEntry}
                          onClick={() => handleResetEntry(fallbackResult.registrationId, fallbackResult.eventSlug, fallbackResult.shortCode)}
                          className="w-full sm:w-auto px-4 py-2 rounded-xl border-2 border-red-300 text-red-700 hover:bg-red-50 text-xs font-black uppercase tracking-wider transition-colors disabled:opacity-50"
                        >
                          {isConfirmingEntry ? "Resetting..." : "Reset Check-in (Undo)"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={isConfirmingEntry}
                          onClick={() => handleConfirmEntry(fallbackResult.registrationId, fallbackResult.eventSlug, fallbackResult.shortCode)}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#0A0A0A] active:translate-x-0.5 active:translate-y-0.5 transition-all disabled:opacity-50"
                        >
                          <ShieldCheck className="w-4 h-4 text-brand-lime" />
                          <span>{isConfirmingEntry ? "CONFIRMING..." : "CONFIRM GATE ENTRY"}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Top KPI row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
                <div className="flex items-center justify-between text-zinc-500 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider">TOTAL REGISTRATIONS</span>
                  <Users className="w-4 h-4 text-brand-violet" />
                </div>
                <div className="font-display text-4xl font-black text-brand-ink">{totalRegistrations}</div>
                <div className="text-[11px] text-emerald-600 font-bold mt-1">Live submissions logged</div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
                <div className="flex items-center justify-between text-zinc-500 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider">GATE CHECK-INS</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="font-display text-4xl font-black text-emerald-600">{checkedInRegistrations.length}</div>
                <div className="text-[11px] text-zinc-500 font-bold mt-1">Passes verified at doors</div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
                <div className="flex items-center justify-between text-zinc-500 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider">BAY AREA OCCUPANCY</span>
                  <Store className="w-4 h-4 text-brand-lime" />
                </div>
                <div className="font-display text-4xl font-black text-brand-ink">{bayAreaCount} / 55</div>
                <div className="text-[11px] text-zinc-500 font-bold mt-1">Near C5 & D5 Hostels Main Stalls</div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
                <div className="flex items-center justify-between text-zinc-500 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider">ROULETTE TEAMS</span>
                  <Sparkles className="w-4 h-4 text-[#FF5A36]" />
                </div>
                <div className="font-display text-4xl font-black text-brand-ink">{rouletteCount} / 12</div>
                <div className="text-[11px] text-zinc-500 font-bold mt-1">Pitch Teams Cap</div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
                <div className="flex items-center justify-between text-zinc-500 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider">BULLS & BEARS</span>
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="font-display text-4xl font-black text-brand-ink">{bullsCount}</div>
                <div className="text-[11px] text-zinc-500 font-bold mt-1">Terminal Participants</div>
              </div>
            </div>

            {/* Recent Gate Check-in Activity Card */}
            <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-black uppercase text-brand-ink">
                      RECENT GATE CHECK-INS ({checkedInRegistrations.length} VERIFIED)
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Live audit log showing who verified each attendee at competition gates
                    </p>
                  </div>
                </div>

                <Link
                  href="/vol/scan"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-surface border border-zinc-200 text-brand-violet hover:bg-brand-violet hover:text-white text-xs font-black uppercase transition-colors self-start sm:self-auto"
                >
                  <span>Open Scanner Station</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {checkedInRegistrations.length === 0 ? (
                <div className="py-12 text-center text-zinc-400 text-xs font-medium space-y-1">
                  <Clock className="w-8 h-8 mx-auto text-zinc-300 mb-2" />
                  <p className="font-bold text-zinc-500 uppercase">No gate check-ins logged yet</p>
                  <p className="text-[11px]">Passes scanned by volunteers at /vol/scan will appear here in real-time.</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-100 max-h-80 overflow-y-auto no-scrollbar">
                  {checkedInRegistrations.slice(0, 10).map((reg) => (
                    <div
                      key={reg.id}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:bg-zinc-50/70 px-2 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-brand-ink">{reg.fullName}</span>
                            {reg.teamName && (
                              <span className="text-zinc-500 font-medium">({reg.teamName})</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-zinc-400 font-mono text-[11px]">ID: {reg.id}</span>
                            <span className="font-black text-brand-violet bg-brand-surface px-1.5 py-0.5 rounded border border-zinc-200 text-[10px] font-mono">
                              CODE: {(reg.qrToken || reg.id).replace(/[^a-zA-Z0-9]/g, "").slice(-4).toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-zinc-600 text-[11px]">
                        <span className="font-bold uppercase text-brand-violet px-2 py-0.5 rounded bg-brand-violet/10 border border-brand-violet/20">
                          {reg.eventSlug?.replace(/-/g, " ")}
                        </span>
                        <span className="font-mono text-zinc-500">
                          {new Date(reg.checkedInAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-800 font-mono text-[11px] font-bold border border-zinc-200">
                          Verified by:{" "}
                          <strong className="text-brand-ink">
                            {reg.checkedInBy || "Gate Volunteer"}
                          </strong>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Per-Track Breakdown & Registration Controls Card */}
            <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
                <div>
                  <h3 className="font-display text-xl font-bold uppercase text-brand-ink">
                    TRACK REGISTRATION & PARTICIPATION CONTROLS
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Live registration counters and 1-click pause/resume toggles for each festival track.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("events")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-zinc-300 hover:bg-zinc-50 text-brand-ink text-xs font-bold uppercase transition-colors self-start sm:self-auto"
                >
                  <span>Open Full Event Editor</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {eventsList.map((ev) => {
                  const count = getEventCount(ev.slug);
                  const isOpen = ev.registrationOpen !== false;
                  const isPending = togglingSlug === ev.slug;

                  return (
                    <div
                      key={ev.slug}
                      className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between gap-4 ${
                        isOpen
                          ? "bg-white border-zinc-200 hover:border-zinc-300"
                          : "bg-red-50/40 border-red-200 shadow-sm"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md text-white shadow-xs"
                            style={{ backgroundColor: ev.badgeColor || "#7C3AED" }}
                          >
                            {ev.dateLabel || `Day ${ev.day}`}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              isOpen
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                            {isOpen ? "REG OPEN" : "CLOSED"}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-display font-bold text-base text-brand-ink uppercase leading-tight">
                            {ev.name}
                          </h4>
                          <p className="text-[10px] font-semibold text-zinc-400 uppercase mt-0.5">
                            {ev.venue} · {ev.timing}
                          </p>
                        </div>

                        <div className="pt-2">
                          <div className="font-display text-2xl font-black text-brand-ink">
                            {count}
                          </div>
                          <div className="text-[10px] font-bold text-zinc-500 uppercase">
                            Registered Participants / Teams
                          </div>
                        </div>
                      </div>

                      {/* Action Row */}
                      <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono text-zinc-400">
                          slug: {ev.slug}
                        </span>

                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleToggleRegistration(ev.slug, isOpen)}
                          className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl border-2 transition-all active:scale-95 disabled:opacity-50 ${
                            isOpen
                              ? "bg-red-50 hover:bg-red-100 text-red-700 border-red-300 shadow-[1px_1px_0px_0px_#EF4444]"
                              : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300 shadow-[1px_1px_0px_0px_#10B981]"
                          }`}
                        >
                          {isPending ? "Updating..." : isOpen ? "Stop Reg" : "Open Reg"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {activeTab === "registrations" && (
          <RegistrationsTable
            registrations={registrations}
            byEvent={byEvent}
            userEmail={userEmail}
            onDeleteRegistration={handleDeleteRegistration}
            onCheckInRegistration={handleConfirmEntry}
            onResetCheckInRegistration={handleResetEntry}
          />
        )}

        {activeTab === "events" && <EventsManager />}

        {activeTab === "sponsors" && <SponsorsManager />}

        {activeTab === "stalls" && <StallManager />}

        {activeTab === "settings" && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200 shadow-sm max-w-2xl space-y-6">
            <div>
              <h3 className="font-display text-2xl font-black uppercase text-brand-ink">
                FESTIVAL CONFIGURATION & TOGGLES
              </h3>
              <p className="text-xs text-zinc-500 font-semibold uppercase mt-1">
                Configure live site datetime targets and operational parameters
              </p>
            </div>

            <SettingsForm />
          </div>
        )}
      </main>

    </div>
  );
}
