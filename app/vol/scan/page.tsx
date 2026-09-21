"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Camera,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCw,
  Volume2,
  VolumeX,
  Keyboard,
  LogOut,
  Clock,
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

// 5 GATED EVENTS ONLY — Bay Area NEVER appears here
const DEFAULT_GATED_GATES = [
  { slug: "startup-roulette", name: "STARTUP ROULETTE", day: "DAY 01", venue: "Hexagon", color: "#FF5A36" },
  { slug: "the-war-room", name: "THE WAR ROOM", day: "DAY 02", venue: "301 ALH", color: "#2F6FED" },
  { slug: "the-boardroom", name: "THE BOARDROOM", day: "DAY 02", venue: "Hexagon", color: "#FF5A36" },
  { slug: "entre-prenormie", name: "ENTREPRE-NORMIE", day: "DAY 03", venue: "002 ALH", color: "#7C3AED" },
  { slug: "bulls-and-bears", name: "BULLS & BEARS", day: "DAY 03", venue: "301 ALH", color: "#C6F135" },
];

interface ScanResult {
  status: "success" | "wrong_gate" | "already_checked_in" | "invalid_qr" | "error";
  title: string;
  message: string;
  attendee?: {
    fullName?: string;
    email?: string;
    teamName?: string | null;
    teamMembersNames?: string | null;
  };
  event?: string;
  checkedInAt?: string;
  shortCode?: string;
  timestamp: string;
}

// Native Web Audio synth beeps
function playTone(type: "success" | "error") {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "success") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    }
  } catch (e) {
    // Audio context may be restricted by browser policy
  }
}

export default function VolunteerScanStationPage() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [volunteerEmail, setVolunteerEmail] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Scanner state
  const [gatedGates, setGatedGates] = useState(DEFAULT_GATED_GATES);
  const [selectedGate, setSelectedGate] = useState<string>(DEFAULT_GATED_GATES[0].slug);
  const [scannerRunning, setScannerRunning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [activeOverlay, setActiveOverlay] = useState<ScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualTokenInput, setManualTokenInput] = useState("");
  const [showManualModal, setShowManualModal] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const overlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isScanningRef = useRef(false);
  const isLockedRef = useRef(false);
  const lastScannedTokenRef = useRef<string>("");

  // 4-Second Rate Limiting Cooldown Clock
  useEffect(() => {
    if (cooldownRemaining <= 0) {
      isLockedRef.current = false;
      setIsProcessing(false);
      setActiveOverlay(null);
      // Resume camera scanning when cooldown completes
      if (scannerRef.current && isScanningRef.current) {
        try {
          scannerRef.current.resume();
        } catch {
          // ignore
        }
      }
      return;
    }

    const timer = setTimeout(() => {
      setCooldownRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [cooldownRemaining]);

  // Fetch live event locations from database / API
  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        if (data.events && Array.isArray(data.events)) {
          const liveGates = data.events
            .filter((e: any) => e.slug !== "bay-area")
            .map((e: any) => ({
              slug: e.slug,
              name: e.name,
              day: e.dateLabel || `DAY 0${e.day}`,
              venue: e.venue || "Campus Venue",
              color: e.badgeColor || "#7C3AED",
            }));
          if (liveGates.length > 0) {
            setGatedGates(liveGates);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Check volunteer authentication on load
  useEffect(() => {
    // Check saved gate preference
    const savedGate = sessionStorage.getItem("cv_vol_gate");
    if (savedGate && DEFAULT_GATED_GATES.some((g) => g.slug === savedGate)) {
      setSelectedGate(savedGate);
    }

    // Check existing Supabase session
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setIsAuthenticated(true);
          setVolunteerEmail(session.user.email || null);
        }
      });
    } else {
      const savedVol = sessionStorage.getItem("cv_vol_email");
      if (savedVol) {
        setIsAuthenticated(true);
        setVolunteerEmail(savedVol);
      }
    }
  }, []);

  // Handle volunteer Supabase login
  const handleVolunteerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setAuthError(null);

    const cleanEmail = loginEmail.trim();
    const cleanPassword = loginPassword.trim();

    if (!cleanEmail || !cleanPassword) {
      setAuthError("Please enter your volunteer email and password");
      setIsLoggingIn(false);
      return;
    }

    try {
      if (isSupabaseConfigured && supabase) {
        // Authenticate with Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });

        if (error) {
          throw error;
        }

        if (data.session?.user) {
          setIsAuthenticated(true);
          setVolunteerEmail(data.session.user.email || cleanEmail);
          sessionStorage.setItem("cv_vol_email", cleanEmail);
        }
      } else {
        // Dev / local preview fallback
        setIsAuthenticated(true);
        setVolunteerEmail(cleanEmail);
        sessionStorage.setItem("cv_vol_email", cleanEmail);
      }
    } catch (err: any) {
      console.error("Volunteer login failed:", err);
      setAuthError(err.message || "Invalid volunteer credentials. Contact lead organizer.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleVolunteerLogout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    sessionStorage.removeItem("cv_vol_email");
    setIsAuthenticated(false);
    setVolunteerEmail(null);
    if (scannerRunning) {
      await stopScanner();
    }
  };

  const handleGateChange = (slug: string) => {
    setSelectedGate(slug);
    sessionStorage.setItem("cv_vol_gate", slug);
  };

  // Perform check-in API call with strict hardware rate-limiting
  const submitCheckin = useCallback(
    async (token: string) => {
      // Hardware-level synchronous lock check — blocks duplicate frames before React state tick
      if (isLockedRef.current || isProcessing) return;
      isLockedRef.current = true;
      setIsProcessing(true);
      setCooldownRemaining(4);
      lastScannedTokenRef.current = token;

      // Pause the scanner to prevent any additional frames from processing
      try {
        if (scannerRef.current && isScanningRef.current) {
          scannerRef.current.pause(true);
        }
      } catch (e) {
        // ignore
      }

      const scanTime = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

      try {
        const res = await fetch("/api/checkin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            qrToken: token,
            gateEventSlug: selectedGate,
            volunteerEmail: volunteerEmail || undefined,
          }),
        });

        const data = await res.json();
        let result: ScanResult;

        if (res.ok && data.success) {
          if (soundEnabled) playTone("success");
          result = {
            status: "success",
            title: "ACCESS GRANTED",
            message: "Check-in confirmed",
            attendee: data.attendee,
            event: data.event,
            checkedInAt: data.checkedInAt,
            shortCode: data.shortCode,
            timestamp: scanTime,
          };
        } else {
          if (soundEnabled) playTone("error");

          if (data.code === "WRONG_GATE") {
            result = {
              status: "wrong_gate",
              title: "WRONG GATE",
              message: data.error || `This pass is for ${data.actualEvent}`,
              attendee: data.attendee,
              event: data.actualEvent,
              shortCode: data.shortCode,
              timestamp: scanTime,
            };
          } else if (data.code === "ALREADY_CHECKED_IN") {
            result = {
              status: "already_checked_in",
              title: "ALREADY CHECKED IN",
              message: data.error || "This attendee was already checked in earlier",
              attendee: data.attendee,
              event: data.event,
              checkedInAt: data.checkedInAt,
              shortCode: data.shortCode,
              timestamp: scanTime,
            };
          } else {
            result = {
              status: "invalid_qr",
              title: "INVALID QR PASS",
              message: data.error || "No valid registration record found for this pass",
              timestamp: scanTime,
            };
          }
        }

        setActiveOverlay(result);
        setScanHistory((prev) => [result, ...prev.slice(0, 19)]);
      } catch (err: any) {
        if (soundEnabled) playTone("error");
        const errResult: ScanResult = {
          status: "error",
          title: "SCANNER ERROR",
          message: err.message || "Failed to process scan with server",
          timestamp: scanTime,
        };
        setActiveOverlay(errResult);
        setScanHistory((prev) => [errResult, ...prev.slice(0, 19)]);
      }
    },
    [isProcessing, selectedGate, soundEnabled, volunteerEmail]
  );

  const dismissOverlay = () => {
    setActiveOverlay(null);
  };

  // Start QR Camera Scanner
  const startScanner = useCallback(async () => {
    setCameraError(null);
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("volunteer-qr-reader");
      }

      if (isScanningRef.current) {
        await scannerRef.current.stop();
        isScanningRef.current = false;
      }

      await scannerRef.current.start(
        { facingMode: facingMode },
        {
          fps: 15,
          qrbox: { width: 260, height: 260 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          if (!isScanningRef.current) return;
          if (isLockedRef.current) return;
          submitCheckin(decodedText);
        },
        () => {
          // ignore noise
        }
      );

      isScanningRef.current = true;
      setScannerRunning(true);
    } catch (err: any) {
      console.error("Camera startup error:", err);
      setCameraError(
        err.message || "Camera permission denied or camera not available. Use manual entry."
      );
      setScannerRunning(false);
      isScanningRef.current = false;
    }
  }, [facingMode, submitCheckin]);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current && isScanningRef.current) {
      try {
        await scannerRef.current.stop();
      } catch (e) {
        // ignore
      }
      isScanningRef.current = false;
    }
    setScannerRunning(false);
  }, []);

  useEffect(() => {
    return () => {
      if (scannerRef.current && isScanningRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
      if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
    };
  }, []);

  const toggleCamera = async () => {
    const nextMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextMode);
    if (scannerRunning) {
      await stopScanner();
      setTimeout(() => {
        startScanner();
      }, 200);
    }
  };

  const handleManualInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Strip non-alphanumerics and convert to uppercase
    const clean = raw.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    // If user pasted a longer token/URL, take the last 4 characters
    if (clean.length > 4) {
      setManualTokenInput(clean.slice(-4));
    } else {
      setManualTokenInput(clean);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const token = manualTokenInput.trim();
    if (!token) return;
    if (isLockedRef.current || isProcessing) return;
    submitCheckin(token);
    setManualTokenInput("");
    setShowManualModal(false);
  };

  const currentGateInfo = gatedGates.find((g) => g.slug === selectedGate) || gatedGates[0];

  // =========================================================================
  // VIEW 1: VOLUNTEER AUTHENTICATION SCREEN (SUPABASE VALIDATED)
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-between p-4 selection:bg-brand-lime selection:text-black">
        <header className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-violet flex items-center justify-center font-display font-black text-white text-base">
              CV
            </div>
            <span className="font-display text-lg font-black uppercase tracking-wide">
              CABINET VALLEY
            </span>
          </div>
        </header>

        <div className="max-w-md w-full mx-auto my-auto bg-zinc-900 rounded-3xl border-2 border-zinc-800 p-8 shadow-2xl space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-brand-violet text-white flex items-center justify-center mx-auto shadow-lg">
            <Lock className="w-7 h-7" />
          </div>

          <div className="text-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-lime bg-brand-lime/10 px-3 py-1 rounded-full">
              GATE VOLUNTEER ACCESS
            </span>
            <h1 className="font-display text-3xl font-black uppercase text-white mt-3">
              SCAN STATION LOGIN
            </h1>
            <p className="text-xs text-zinc-400 font-medium mt-1">
              Sign in with your assigned volunteer credentials to operate the gate scanner.
            </p>
          </div>

          <form onSubmit={handleVolunteerLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-400 mb-1">
                VOLUNTEER EMAIL
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="volunteer@cabinet.edu"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 rounded-xl bg-black border border-zinc-700 text-white text-sm font-medium focus:outline-none focus:border-brand-violet transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-400 mb-1">
                PASSWORD
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 rounded-xl bg-black border border-zinc-700 text-white text-sm font-medium focus:outline-none focus:border-brand-violet transition-colors"
                />
              </div>
            </div>

            {authError && (
              <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs font-semibold rounded-xl flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 rounded-xl bg-brand-lime hover:bg-brand-lime-dark text-black font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoggingIn ? (
                <span>VERIFYING CREDENTIALS...</span>
              ) : (
                <>
                  <span>UNLOCK GATE SCANNER</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <footer className="py-4 text-center text-zinc-600 text-xs font-medium">
          Official Student Cabinet Gate Station · Internal Volunteer Tool
        </footer>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: AUTHENTICATED SCAN STATION
  // =========================================================================
  return (
    <div className="min-h-screen bg-brand-ink text-white flex flex-col justify-between selection:bg-brand-lime selection:text-black">
      {/* Full-Screen Unmissable Flash Overlay */}
      {activeOverlay && (
        <div
          onClick={dismissOverlay}
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors duration-100 ${
            activeOverlay.status === "success"
              ? "bg-[#10B981] text-white"
              : activeOverlay.status === "wrong_gate"
              ? "bg-[#EF4444] text-white"
              : activeOverlay.status === "already_checked_in"
              ? "bg-[#DC2626] text-white"
              : "bg-[#B91C1C] text-white"
          }`}
        >
          <div className="max-w-xl w-full mx-auto flex flex-col items-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-white/20 flex items-center justify-center shadow-2xl border-4 border-white">
              {activeOverlay.status === "success" ? (
                <CheckCircle2 className="w-20 h-20 sm:w-24 sm:h-24 text-white" />
              ) : activeOverlay.status === "wrong_gate" ? (
                <AlertTriangle className="w-20 h-20 sm:w-24 sm:h-24 text-white" />
              ) : (
                <XCircle className="w-20 h-20 sm:w-24 sm:h-24 text-white" />
              )}
            </div>

            <h1 className="font-display text-5xl sm:text-7xl font-black uppercase tracking-tight leading-none drop-shadow-md">
              {activeOverlay.title}
            </h1>

            <p className="text-xl sm:text-3xl font-black uppercase tracking-wide max-w-lg bg-black/25 px-6 py-3 rounded-2xl border border-white/20">
              {activeOverlay.message}
            </p>

            {activeOverlay.attendee && (
              <div className="w-full bg-white text-brand-ink rounded-3xl p-6 sm:p-8 shadow-2xl text-left border-4 border-black space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
                    ATTENDEE
                  </span>
                  <div className="flex items-center gap-2">
                    {activeOverlay.shortCode && (
                      <span className="text-xs font-mono font-black text-brand-violet bg-brand-surface px-2.5 py-0.5 rounded-lg border border-zinc-200">
                        CODE: {activeOverlay.shortCode}
                      </span>
                    )}
                    <span className="text-xs font-mono font-bold text-zinc-500">
                      {activeOverlay.timestamp}
                    </span>
                  </div>
                </div>

                <div className="text-2xl sm:text-3xl font-display font-black uppercase text-brand-ink leading-tight">
                  {activeOverlay.attendee.fullName}
                </div>

                {activeOverlay.attendee.teamName && (
                  <div className="bg-brand-surface p-3 rounded-xl border border-zinc-200">
                    <span className="text-[10px] font-black uppercase text-zinc-500 block mb-0.5">
                      TEAM:
                    </span>
                    <span className="text-sm font-black text-brand-violet uppercase">
                      {activeOverlay.attendee.teamName}
                    </span>
                  </div>
                )}

                {activeOverlay.attendee.teamMembersNames && (
                  <div>
                    <span className="text-[10px] font-black uppercase text-zinc-400 block mb-1">
                      TEAM MEMBERS:
                    </span>
                    <div className="text-xs font-bold text-zinc-700">
                      {activeOverlay.attendee.teamMembersNames}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4-Second Rate Limiting Cooldown Progress Bar */}
            <div className="w-full max-w-md bg-black/40 backdrop-blur-sm rounded-2xl p-4 border border-white/20 space-y-2 mt-4 text-white">
              <div className="flex items-center justify-between text-xs font-mono font-bold">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-brand-lime" />
                  {cooldownRemaining > 0 ? (
                    <span>RATE LIMIT BREAK · READY IN {cooldownRemaining}s</span>
                  ) : (
                    <span className="text-brand-lime font-black">READY TO SCAN NEXT</span>
                  )}
                </span>
                <span className="font-black px-2 py-0.5 rounded bg-white/20">
                  {cooldownRemaining > 0 ? `${cooldownRemaining}s` : "READY"}
                </span>
              </div>
              <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-lime rounded-full transition-all duration-1000 ease-linear"
                  style={{
                    width: `${((4 - cooldownRemaining) / 4) * 100}%`,
                  }}
                />
              </div>
              <p className="text-[10px] text-white/70 uppercase tracking-wider text-center">
                {cooldownRemaining > 0
                  ? "Camera paused for 4s cooldown · tap anywhere to dismiss alert"
                  : "Auto-closing · Ready for next pass"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Station Header */}
      <header className="bg-zinc-950 border-b border-zinc-800 p-4 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-violet flex items-center justify-center font-display font-black text-white text-lg">
              CV
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-lg font-black uppercase tracking-wide text-white">
                  GATE SCAN STATION
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-brand-lime text-black">
                  VOLUNTEER
                </span>
              </div>
              <p className="text-[11px] font-mono text-zinc-400">
                Active Gate: <strong className="text-white">{currentGateInfo?.name}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl border transition-colors ${
                soundEnabled
                  ? "border-zinc-700 bg-zinc-800 text-brand-lime"
                  : "border-zinc-800 bg-zinc-900 text-zinc-500"
              }`}
              title={soundEnabled ? "Sound enabled" : "Sound muted"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {volunteerEmail && (
              <span className="hidden sm:inline-block text-[11px] font-mono text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800">
                {volunteerEmail}
              </span>
            )}

            <button
              onClick={handleVolunteerLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-bold uppercase transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">SIGN OUT</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Working Tool Surface */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Gate Selection Dropdown Bar */}
        <div className="bg-zinc-900 rounded-3xl border-2 border-zinc-800 p-4 sm:p-6 shadow-lg">
          <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-2">
            SELECT GATE STATION (GATED EVENTS ONLY)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <select
                value={selectedGate}
                onChange={(e) => handleGateChange(e.target.value)}
                className="w-full bg-black text-white border-2 border-zinc-700 focus:border-brand-violet rounded-2xl px-4 py-3.5 text-base font-bold uppercase tracking-wide focus:outline-none transition-colors cursor-pointer"
              >
                {gatedGates.map((gate) => (
                  <option key={gate.slug} value={gate.slug} className="bg-zinc-900 py-2">
                    {gate.name} — {gate.day} ({gate.venue.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowManualModal(true)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-black uppercase tracking-wider transition-colors"
              >
                <Keyboard className="w-4 h-4 text-brand-lime" />
                <span>MANUAL ENTRY</span>
              </button>

              <button
                onClick={toggleCamera}
                className="p-3.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white transition-colors"
                title="Switch camera"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-lime animate-ping" />
              <span className="font-bold text-zinc-300">
                Gate active: {currentGateInfo?.venue}
              </span>
            </div>
            <span className="text-zinc-500 font-mono text-[11px]">
              Note: Stall registrations (Bay Area) do not require gate check-in
            </span>
          </div>
        </div>

        {/* Scanner Viewport Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Camera Viewport Container */}
          <div className="lg:col-span-7 bg-zinc-900 rounded-3xl border-2 border-zinc-800 p-4 sm:p-6 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="w-full max-w-sm aspect-square bg-black rounded-2xl overflow-hidden relative border-2 border-zinc-800 flex items-center justify-center shadow-inner">
              <div id="volunteer-qr-reader" className="w-full h-full object-cover" />

              {scannerRunning && !activeOverlay && (
                <>
                  {cooldownRemaining > 0 ? (
                    <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center mb-3 shadow-lg">
                        <Clock className="w-6 h-6 text-amber-400 animate-spin" />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-widest text-amber-300">
                        RATE LIMIT COOLDOWN
                      </span>
                      <span className="font-display text-2xl font-black text-white mt-1">
                        PAUSED FOR {cooldownRemaining}s
                      </span>
                      <div className="w-40 h-2 bg-zinc-800 rounded-full overflow-hidden mt-3 border border-zinc-700">
                        <div
                          className="h-full bg-brand-lime transition-all duration-1000 ease-linear"
                          style={{ width: `${((4 - cooldownRemaining) / 4) * 100}%` }}
                        />
                      </div>
                      <p className="text-[10px] font-mono text-zinc-400 mt-2">
                        Preventing duplicate scans...
                      </p>
                    </div>
                  ) : (
                    <div className="absolute inset-8 pointer-events-none border-2 border-dashed border-brand-lime/80 rounded-2xl flex items-center justify-center">
                      <div className="w-12 h-1 bg-brand-lime/90 absolute top-0" />
                      <div className="w-12 h-1 bg-brand-lime/90 absolute bottom-0" />
                      <div className="w-1 h-12 bg-brand-lime/90 absolute left-0" />
                      <div className="w-1 h-12 bg-brand-lime/90 absolute right-0" />
                      <div className="absolute -top-6 px-2.5 py-0.5 rounded-full bg-brand-lime text-black font-mono font-black text-[9px] uppercase tracking-wider shadow">
                        READY TO SCAN
                      </div>
                    </div>
                  )}
                </>
              )}

              {!scannerRunning && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center space-y-3 z-10">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                    <Camera className="w-8 h-8 text-brand-lime" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold uppercase text-white">
                      CAMERA IS IDLE
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                      Press Start Scanner below to enable device camera for fast QR check-in.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {cameraError && (
              <div className="mt-4 p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs font-semibold w-full text-center">
                {cameraError}
              </div>
            )}

            {/* Scanner Controls */}
            <div className="mt-5 w-full flex items-center justify-center gap-4">
              {!scannerRunning ? (
                <button
                  onClick={startScanner}
                  className="w-full max-w-sm py-4 rounded-2xl bg-brand-lime hover:bg-brand-lime-dark text-black font-black text-sm uppercase tracking-wider transition-all shadow-lg active:scale-98 flex items-center justify-center gap-2"
                >
                  <Camera className="w-5 h-5" />
                  <span>START CAMERA SCANNER</span>
                </button>
              ) : (
                <button
                  onClick={stopScanner}
                  className="w-full max-w-sm py-4 rounded-2xl bg-zinc-800 hover:bg-red-900/60 hover:border-red-600 border border-zinc-700 text-white font-black text-sm uppercase tracking-wider transition-colors"
                >
                  PAUSE CAMERA
                </button>
              )}
            </div>
          </div>

          {/* Activity / Scan History Log */}
          <div className="lg:col-span-5 bg-zinc-900 rounded-3xl border-2 border-zinc-800 p-4 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3">
                <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
                  RECENT SCANS LOG
                </span>
                <span className="text-[11px] font-mono text-brand-lime font-bold">
                  {scanHistory.filter((s) => s.status === "success").length} Checked in
                </span>
              </div>

              {scanHistory.length === 0 ? (
                <div className="py-16 text-center text-zinc-500 text-xs font-medium space-y-2">
                  <Clock className="w-8 h-8 mx-auto text-zinc-600" />
                  <p>No scans processed yet at this gate.</p>
                  <p className="text-[11px] text-zinc-600">
                    Scans will appear here with live verification status.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1 no-scrollbar">
                  {scanHistory.map((scan, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
                        scan.status === "success"
                          ? "bg-emerald-950/30 border-emerald-800/60 text-emerald-300"
                          : scan.status === "wrong_gate"
                          ? "bg-amber-950/30 border-amber-800/60 text-amber-300"
                          : "bg-red-950/30 border-red-800/60 text-red-300"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        {scan.status === "success" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                        )}
                        <div className="truncate">
                          <span className="font-bold block truncate">
                            {scan.attendee?.fullName || scan.title}
                          </span>
                          <span className="text-[10px] text-zinc-400 block truncate">
                            {scan.message}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end flex-shrink-0">
                        <span className="text-[10px] font-mono text-zinc-400">
                          {scan.timestamp}
                        </span>
                        {scan.shortCode && (
                          <span className="text-[9px] font-mono font-black text-brand-lime mt-0.5">
                            #{scan.shortCode}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {scanHistory.length > 0 && (
              <button
                onClick={() => setScanHistory([])}
                className="mt-4 text-[11px] font-bold text-zinc-500 hover:text-zinc-300 uppercase self-end transition-colors"
              >
                Clear Log
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Manual 4-Character Code Entry Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-zinc-900 rounded-3xl border-2 border-zinc-700 p-6 text-white shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-brand-lime">
                MANUAL GATE CHECK-IN
              </span>
              <button
                onClick={() => setShowManualModal(false)}
                className="text-zinc-400 hover:text-white text-xs font-bold"
              >
                ✕ CLOSE
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="font-display text-2xl font-black uppercase">
                ENTER 4-CHAR PASS CODE
              </h3>
              <p className="text-xs text-zinc-400">
                Type the 4-character code shown on the attendee's ticket below the QR code:
              </p>
            </div>

            {/* Active Gate Indicator */}
            <div className="bg-black/60 rounded-xl p-2.5 border border-zinc-800 flex items-center justify-between text-xs">
              <span className="text-zinc-500 font-bold uppercase text-[10px]">CURRENT GATE:</span>
              <span className="font-black text-white uppercase text-[11px] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentGateInfo.color }} />
                <span>{currentGateInfo.name}</span>
                <span className="text-zinc-500 font-normal">({currentGateInfo.venue})</span>
              </span>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <input
                  type="text"
                  autoFocus
                  maxLength={4}
                  required
                  placeholder="07CD"
                  value={manualTokenInput}
                  onChange={handleManualInputChange}
                  className="w-full text-center py-4 px-3 rounded-2xl bg-black border-2 border-zinc-700 focus:border-brand-lime text-brand-lime text-3xl sm:text-4xl font-mono font-black tracking-[0.35em] uppercase placeholder:text-zinc-800 placeholder:tracking-[0.35em] focus:outline-none transition-colors"
                />

                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 px-1">
                  <span>Fast gate code</span>
                  <span className={manualTokenInput.length === 4 ? "text-brand-lime font-bold" : "text-zinc-500"}>
                    {manualTokenInput.length} / 4 characters
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-zinc-500 leading-relaxed">
                Tip: If you paste a full ticket URL or UUID, the 4-character code will be extracted automatically.
              </p>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="flex-1 py-3 rounded-xl border border-zinc-700 text-xs font-bold uppercase hover:bg-zinc-800 transition-colors"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={!manualTokenInput.trim() || isProcessing}
                  className="flex-1 py-3 rounded-xl bg-brand-lime hover:bg-brand-lime-dark text-black font-black text-xs uppercase tracking-wider disabled:opacity-40 transition-all shadow-md active:scale-98"
                >
                  VERIFY PASS CODE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Station Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-800 py-3 text-center text-zinc-500 text-xs">
        <span>Cabinet Valley Gate Scanner — Student Cabinet University Fest 2026</span>
      </footer>
    </div>
  );
}
