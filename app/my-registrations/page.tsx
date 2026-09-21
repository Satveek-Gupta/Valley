"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import {
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  Download,
  Users,
  AlertCircle,
  MapPin,
  Calendar,
  LogOut,
  Store,
  Briefcase,
  Swords,
  TrendingUp,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import AnimatedGridPattern from "@/components/magicui/animated-grid-pattern";

interface ParticipantRegistration {
  id: string;
  eventSlug: string;
  eventName: string;
  day: number;
  dateLabel: string;
  tagType: "orange" | "blue" | "lime" | "violet";
  badgeColor: string;
  venue: string;
  timing: string;
  isBayArea: boolean;
  qrToken?: string;
  qrUrl?: string;
  shortCode?: string;
  checkedInAt?: string | null;
  teamName?: string | null;
  teamLeaderName?: string | null;
  teamMembersNames?: string | null;
  partnerName?: string | null;
  ideaName?: string | null;
  ideaDescription?: string | null;
  founderDiscussionTopic?: string | null;
  details?: any;
  createdAt: string;
}

const ICON_MAP: Record<string, any> = {
  "startup-roulette": Sparkles,
  "the-war-room": Swords,
  "the-boardroom": Briefcase,
  "entre-prenormie": Users,
  "bulls-and-bears": TrendingUp,
  "bay-area": Store,
};

function MyRegistrationsContent() {
  const searchParams = useSearchParams();
  const urlEmail = searchParams.get("email");

  const [emailInput, setEmailInput] = useState(urlEmail || "");
  const [activeEmail, setActiveEmail] = useState<string | null>(null);
  const [participant, setParticipant] = useState<{ fullName?: string; email?: string } | null>(null);
  const [registrations, setRegistrations] = useState<ParticipantRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Load saved email on mount
  useEffect(() => {
    const saved = localStorage.getItem("cv_participant_email");
    const emailToUse = urlEmail || saved;
    if (emailToUse && emailToUse.trim()) {
      setEmailInput(emailToUse.trim());
      fetchPasses(emailToUse.trim());
    }
  }, [urlEmail]);

  const fetchPasses = async (emailToQuery: string) => {
    setIsLoading(true);
    setSearchError(null);
    try {
      const res = await fetch(`/api/my-registrations?email=${encodeURIComponent(emailToQuery.trim())}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch registrations");
      }

      setParticipant(data.participant || { email: emailToQuery });
      setRegistrations(data.registrations || []);
      setActiveEmail(emailToQuery.trim());
      setHasSearched(true);
      localStorage.setItem("cv_participant_email", emailToQuery.trim());
    } catch (err: any) {
      console.error("Fetch error:", err);
      setSearchError(err.message || "Failed to retrieve your passes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    fetchPasses(emailInput.trim());
  };

  const handleLogout = () => {
    localStorage.removeItem("cv_participant_email");
    setActiveEmail(null);
    setParticipant(null);
    setRegistrations([]);
    setHasSearched(false);
    setEmailInput("");
  };

  const handleDownloadQr = (eventSlug: string, eventName: string) => {
    const svgEl = document.getElementById(`qr-svg-${eventSlug}`);
    if (!svgEl) return;

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new window.Image();

    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;
      if (ctx) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, 400, 400);
        ctx.drawImage(img, 20, 20, 360, 360);
      }
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `Cabinet-Valley-Pass-${eventSlug}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="relative min-h-screen bg-[#FBFBFC] text-brand-ink selection:bg-brand-violet selection:text-white pb-20 overflow-hidden flex flex-col justify-between">
      {/* Background Pattern matching /register */}
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.12}
        duration={3.5}
        repeatDelay={1}
        className="[mask-image:radial-gradient(600px_circle_at_center,white,transparent)] inset-0 text-brand-violet"
      />

      {/* Top Bar matching /register */}
      <div className="w-full bg-white border-b-2 border-brand-ink/10 py-4 px-4 sm:px-8 relative z-20">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-brand-ink hover:text-brand-violet transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO HOME</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-lime" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              PARTICIPANT ACCESS PORTAL
            </span>
          </div>
        </div>
      </div>

      {/* Main Container matching /register */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 relative z-10 w-full flex-1 space-y-8">
        {/* Page Header matching /register */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brand-violet text-white text-xs font-black uppercase tracking-widest mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>FESTIVAL ACCESS PASSES</span>
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-black uppercase tracking-wide text-brand-ink">
            MY REGISTRATIONS
          </h1>
          <p className="mt-2 text-xs sm:text-sm font-semibold text-zinc-500 uppercase tracking-wider max-w-lg mx-auto">
            Look up your verified event entry QR passes, team rosters, and gate check-in status.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* STEP 1: EMAIL LOOKUP CARD                                                 */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border-2 border-brand-ink/20 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-zinc-200">
            <div className="w-8 h-8 rounded-xl bg-brand-ink text-white flex items-center justify-center font-display font-bold">
              01
            </div>
            <div>
              <h3 className="font-display text-2xl font-black uppercase text-brand-ink leading-tight">
                PARTICIPANT LOOKUP
              </h3>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Enter the email address used during registration to access your passes.
              </p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="email"
                required
                placeholder="e.g. yourname@gmail.com or enrollment email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border-2 border-zinc-300 focus:border-brand-ink font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-violet"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !emailInput.trim()}
              className="px-8 py-3.5 rounded-xl bg-brand-violet hover:bg-brand-violet-dark text-white font-black text-xs uppercase tracking-wider transition-all transform hover:scale-105 active:scale-95 shadow-md shadow-brand-violet/20 flex items-center justify-center gap-2 disabled:opacity-50 flex-shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>{isLoading ? "LOOKING UP..." : "FIND PASSES"}</span>
            </button>
          </form>

          {searchError && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span>{searchError}</span>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* STEP 2: PARTICIPANT BANNER (WHEN LOGGED IN / SEARCHED)                    */}
        {/* ========================================================================= */}
        {activeEmail && hasSearched && (
          <div className="rounded-3xl bg-brand-ink text-white p-6 sm:p-8 border-4 border-brand-ink shadow-lg animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-lime text-black flex items-center justify-center font-display text-2xl font-black shadow-md">
                  {participant?.fullName?.charAt(0).toUpperCase() || "A"}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-brand-lime text-black text-[10px] font-black uppercase">
                      CONFIRMED ATTENDEE
                    </span>
                    <span className="text-xs font-mono font-bold text-white/70">
                      {registrations.length} {registrations.length === 1 ? "PASS" : "PASSES"}
                    </span>
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-wide text-white leading-none">
                    {participant?.fullName || "FESTIVAL ATTENDEE"}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <span className="text-xs font-mono text-zinc-300">
                  {activeEmail}
                </span>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/20 hover:bg-white/10 text-white text-xs font-bold uppercase transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>CHANGE</span>
                </button>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-zinc-300 font-medium">
                Show each pass QR code at the door for rapid volunteer scanner verification.
              </span>
              <Link
                href="/register"
                className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-brand-lime hover:underline"
              >
                <span>+ REGISTER FOR ANOTHER EVENT</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: PASSES LIST                                                      */}
        {/* ========================================================================= */}
        {activeEmail && hasSearched && registrations.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl font-black uppercase text-brand-ink">
                YOUR FESTIVAL PASSES
              </h3>
              <span className="text-xs font-mono font-bold text-zinc-500 uppercase">
                SEPTEMBER 24–26, 2026
              </span>
            </div>

            <div className="space-y-6">
              {registrations.map((reg) => {
                const IconComponent = ICON_MAP[reg.eventSlug] || Sparkles;
                const isCheckedIn = Boolean(reg.checkedInAt);

                // Bay Area Stall Special Card (NO QR, NO CHECK-IN)
                if (reg.isBayArea) {
                  return (
                    <div
                      key={reg.id}
                      className="rounded-3xl border-2 border-brand-violet/40 bg-gradient-to-r from-purple-50 via-white to-orange-50 p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-sm"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-brand-violet text-white flex items-center justify-center flex-shrink-0 shadow-md">
                          <Store className="w-7 h-7" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2.5 py-0.5 rounded-full bg-brand-violet text-white text-[10px] font-black uppercase tracking-wider">
                              COMMERCIAL & STARTUP STALL PASS
                            </span>
                            <span className="text-xs font-bold text-zinc-500 font-mono">
                              DAY 01 & 02
                            </span>
                          </div>
                          <h3 className="font-display text-2xl sm:text-3xl font-black uppercase text-brand-ink leading-tight">
                            BAY AREA STALL ALLOCATION
                          </h3>
                          <p className="text-xs font-semibold text-zinc-600 max-w-xl mt-1 leading-relaxed">
                            {reg.details?.businessName
                              ? `Registered for: ${reg.details.businessName}`
                              : "Confirmed booth reservation for commercial & student entrepreneur showcase."}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-mono">
                            {reg.details?.stallNumber && (
                              <span className="px-3 py-1 rounded-lg bg-black text-white font-black text-xs">
                                STALL #{reg.details.stallNumber}
                              </span>
                            )}
                            <span className="text-zinc-600 font-bold">
                              📍 Near C5 & D5 Hostels · 10:00 AM – 6:00 PM
                            </span>
                          </div>

                          <div className="mt-4 pt-3 border-t border-purple-200/60 text-[11px] font-bold text-brand-violet uppercase tracking-wider">
                            ℹ️ Stall Pass Only — No gate QR scan required for Bay Area
                          </div>
                        </div>
                      </div>

                      <a
                        href="https://forms.cloud.microsoft/r/JFgLTYxc8m"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-brand-violet hover:bg-brand-violet-dark text-white text-xs font-black uppercase tracking-wider transition-all transform hover:scale-105 active:scale-95 shadow-md shadow-brand-violet/20 flex-shrink-0 w-full sm:w-auto"
                      >
                        <span>VIEW STALL FORM</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </a>
                    </div>
                  );
                }

                // Gated Competition Passes with QR Codes
                return (
                  <div
                    key={reg.id}
                    className="rounded-3xl bg-white border-2 border-brand-ink/20 hover:border-brand-ink p-6 sm:p-8 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                      {/* Left: Event Details (7 cols) */}
                      <div className="lg:col-span-7 space-y-4">
                        {/* Status + Date Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-black uppercase px-3 py-1 rounded-full bg-brand-surface border border-brand-border text-brand-ink">
                            {reg.dateLabel}
                          </span>

                          {isCheckedIn ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-black uppercase tracking-wider">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>CHECKED IN</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs font-black uppercase tracking-wider">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>NOT CHECKED IN</span>
                            </span>
                          )}
                        </div>

                        {/* Event Title with Icon */}
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md flex-shrink-0"
                            style={{ backgroundColor: reg.badgeColor }}
                          >
                            <IconComponent className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-wide text-brand-ink leading-tight">
                              {reg.eventName}
                            </h4>
                            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 mt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-brand-violet" />
                              <span>{reg.venue}</span>
                            </div>
                          </div>
                        </div>

                        {/* Roster / Team Details Card */}
                        <div className="bg-brand-surface rounded-2xl p-4 border border-zinc-200 space-y-2 text-xs">
                          {reg.teamName && (
                            <div className="flex items-start justify-between gap-2 border-b border-zinc-200 pb-2">
                              <span className="font-bold text-zinc-500 uppercase text-[10px]">TEAM:</span>
                              <span className="font-black text-brand-violet uppercase text-sm">
                                {reg.teamName}
                              </span>
                            </div>
                          )}

                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-zinc-500 uppercase text-[10px]">LEADER:</span>
                            <span className="font-bold text-brand-ink uppercase">
                              {reg.teamLeaderName || participant?.fullName}
                            </span>
                          </div>

                          {reg.teamMembersNames && (
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-bold text-zinc-500 uppercase text-[10px]">MEMBERS:</span>
                              <span className="font-semibold text-zinc-700 text-right">
                                {reg.teamMembersNames}
                              </span>
                            </div>
                          )}

                          {reg.ideaName && (
                            <div className="flex items-start justify-between gap-2 pt-1 border-t border-zinc-200">
                              <span className="font-bold text-zinc-500 uppercase text-[10px]">PITCH IDEA:</span>
                              <span className="font-semibold text-zinc-700 text-right">
                                {reg.ideaName}
                              </span>
                            </div>
                          )}

                          {reg.founderDiscussionTopic && (
                            <div className="flex items-start justify-between gap-2 pt-1 border-t border-zinc-200">
                              <span className="font-bold text-zinc-500 uppercase text-[10px]">TOPIC:</span>
                              <span className="font-semibold text-zinc-700 text-right">
                                {reg.founderDiscussionTopic}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Checked-in timestamp note if already scanned */}
                        {isCheckedIn && reg.checkedInAt && (
                          <div className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                            Verified at gate: {new Date(reg.checkedInAt).toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                              second: "2-digit",
                              hour12: true,
                            })}
                          </div>
                        )}
                      </div>

                      {/* Right: High-Contrast QR Ticket (5 cols) */}
                      <div className="lg:col-span-5 bg-brand-ink text-white rounded-2xl p-5 border-2 border-brand-ink flex flex-col items-center justify-between text-center relative overflow-hidden shadow-md">
                        <div className="w-full flex items-center justify-between border-b border-white/20 pb-2 mb-3 text-[10px] font-mono">
                          <span className="text-zinc-400">OFFICIAL GATE PASS</span>
                          <span className="text-brand-lime font-bold">{reg.dateLabel}</span>
                        </div>

                        {/* QR Code Canvas */}
                        <div className="bg-white p-3 rounded-2xl shadow-inner my-1">
                          <QRCodeSVG
                            id={`qr-svg-${reg.eventSlug}`}
                            value={reg.qrUrl || `https://cabinetvalley.in/verify/${reg.qrToken || reg.id}`}
                            size={180}
                            level="H"
                            includeMargin={false}
                          />
                        </div>

                        {/* 4-Character Gate Pass Code Box */}
                        <div className="mt-3 w-full bg-white/10 rounded-xl p-2.5 border border-white/15 text-center">
                          <div className="text-[9px] font-mono font-bold tracking-widest text-zinc-300 uppercase mb-0.5">
                            GATE PASS CODE
                          </div>
                          <div className="font-mono text-2xl font-black tracking-[0.25em] text-brand-lime selection:bg-brand-lime selection:text-black">
                            {reg.shortCode || (reg.qrToken || reg.id).replace(/[^a-zA-Z0-9]/g, "").slice(-4).toUpperCase()}
                          </div>
                          <div className="text-[9px] text-zinc-400 font-medium mt-0.5">
                            Show this 4-char code for fast manual gate check-in
                          </div>
                        </div>

                        <div className="mt-3 w-full">
                          <div className="text-[10px] font-mono text-zinc-400 truncate mb-2">
                            PASS ID: <span className="text-white font-bold">{(reg.qrToken || reg.id).substring(0, 16)}...</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleDownloadQr(reg.eventSlug, reg.eventName)}
                              className="py-2 px-3 rounded-xl bg-white text-black font-black text-[11px] uppercase tracking-wider hover:bg-brand-lime transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>SAVE QR</span>
                            </button>

                            <Link
                              href={`/verify/${reg.qrToken || reg.id}`}
                              target="_blank"
                              className="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-black text-[11px] uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                            >
                              <span>VERIFY</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: EMPTY STATE (NO REGISTRATIONS FOUND)                              */}
        {/* ========================================================================= */}
        {activeEmail && hasSearched && registrations.length === 0 && (
          <div className="bg-white rounded-3xl border-2 border-brand-ink/20 p-8 sm:p-12 shadow-sm text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>

            <h3 className="font-display text-3xl font-black uppercase text-brand-ink">
              NO REGISTRATIONS FOUND
            </h3>

            <p className="text-xs sm:text-sm font-semibold text-zinc-500 uppercase tracking-wide max-w-md mx-auto">
              No registered passes found for <strong>{activeEmail}</strong>. If you registered with another email, please try searching again or register for Cabinet Valley below.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-violet hover:bg-brand-violet-dark text-white font-black text-xs uppercase tracking-wider transition-all transform hover:scale-105 active:scale-95 shadow-md shadow-brand-violet/20 flex items-center justify-center gap-2"
              >
                <span>REGISTER FOR FESTIVAL TRACKS</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                onClick={handleLogout}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl border-2 border-zinc-300 hover:border-brand-ink text-brand-ink font-black text-xs uppercase tracking-wider transition-colors"
              >
                TRY DIFFERENT EMAIL
              </button>
            </div>
          </div>
        )}

        {/* Initial Prompt State (before search) */}
        {!hasSearched && (
          <div className="text-center py-8 text-zinc-400 text-xs font-mono uppercase tracking-wider">
            Ready to scan · Official pass verification system
          </div>
        )}
      </div>

      {/* Footer matching /register */}
      {/* <footer className="w-full text-center py-6 text-xs text-zinc-500 font-medium relative z-10 border-t border-brand-ink/10 mt-12 bg-white/60 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 Cabinet Valley — Student Cabinet University Fest</span>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-brand-violet transition-colors">Home</Link>
            <Link href="/register" className="hover:text-brand-violet transition-colors">Register</Link>
          </div>
        </div>
      </footer> */}
    </div>
  );
}

export default function MyRegistrationsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FBFBFC] flex items-center justify-center font-bold text-xs uppercase">Loading passes...</div>}>
      <MyRegistrationsContent />
    </Suspense>
  );
}
