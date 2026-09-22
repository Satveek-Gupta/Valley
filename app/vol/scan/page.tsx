"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Camera,
  CameraOff,
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
  Flashlight,
  Sparkles,
  History,
  MapPin,
  Calendar,
  ShieldCheck,
  Check,
  X,
  Radio,
  UserCheck,
  Users,
} from "lucide-react";
import confetti from "canvas-confetti";
import { Html5Qrcode } from "html5-qrcode";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

// 5 GATED EVENTS ONLY — Bay Area NEVER appears in gate station
const DEFAULT_GATED_GATES = [
  {
    slug: "startup-roulette",
    name: "STARTUP ROULETTE",
    day: "DAY 01",
    venue: "Hexagon",
    color: "#FF5A36",
    tagType: "coral",
  },
  {
    slug: "the-war-room",
    name: "THE WAR ROOM",
    day: "DAY 02",
    venue: "301 ALH",
    color: "#2F6FED",
    tagType: "blue",
  },
  {
    slug: "the-boardroom",
    name: "THE BOARDROOM",
    day: "DAY 02",
    venue: "Hexagon",
    color: "#FF5A36",
    tagType: "coral",
  },
  {
    slug: "entre-prenormie",
    name: "ENTREPRE-NORMIE",
    day: "DAY 03",
    venue: "002 ALH",
    color: "#7C3AED",
    tagType: "violet",
  },
  {
    slug: "bulls-and-bears",
    name: "BULLS & BEARS",
    day: "DAY 03",
    venue: "301 ALH",
    color: "#C6F135",
    tagType: "lime",
  },
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

// Native Web Audio synth beeps + mobile haptic pulse
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

      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([60, 30, 60]);
      }
    } else {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);

      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([180, 80, 180]);
      }
    }
  } catch {
    // Audio context may be restricted by browser policy before first interaction
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

  // Scanner & Gate state
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
  const [torchOn, setTorchOn] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const [activeMobileView, setActiveMobileView] = useState<"scanner" | "history">("scanner");

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
              tagType: e.tagType || "violet",
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
    const savedGate = sessionStorage.getItem("cv_vol_gate");
    if (savedGate && DEFAULT_GATED_GATES.some((g) => g.slug === savedGate)) {
      setSelectedGate(savedGate);
    }

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
      // Synchronous hardware lock check — blocks duplicate frames before React state tick
      if (isLockedRef.current || isProcessing) return;
      isLockedRef.current = true;
      setIsProcessing(true);
      setCooldownRemaining(4);
      lastScannedTokenRef.current = token;

      // Pause the scanner to prevent any additional camera frames from firing
      try {
        if (scannerRef.current && isScanningRef.current) {
          scannerRef.current.pause(true);
        }
      } catch {
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
          try {
            confetti({
              particleCount: 45,
              spread: 60,
              origin: { y: 0.6 },
              colors: ["#C6F135", "#7C3AED", "#FF5A36", "#2F6FED"],
            });
          } catch {
            // ignore confetti error in odd viewports
          }

          result = {
            status: "success",
            title: "ACCESS GRANTED",
            message: "Attendee entry confirmed and recorded",
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
              message: data.error || `Pass is valid for ${data.actualEvent}`,
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
              title: "PASS NOT FOUND",
              message: data.error || "No matching registration found for this QR code",
              timestamp: scanTime,
            };
          }
        }

        setActiveOverlay(result);
        setScanHistory((prev) => [result, ...prev.slice(0, 24)]);
      } catch (err: any) {
        if (soundEnabled) playTone("error");
        const errResult: ScanResult = {
          status: "error",
          title: "SERVER ERROR",
          message: err.message || "Failed to reach check-in server. Please retry.",
          timestamp: scanTime,
        };
        setActiveOverlay(errResult);
        setScanHistory((prev) => [errResult, ...prev.slice(0, 24)]);
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
          // ignore frame noise
        }
      );

      isScanningRef.current = true;
      setScannerRunning(true);
    } catch (err: any) {
      console.error("Camera startup error:", err);
      setCameraError(
        err.message || "Camera permission denied or camera unavailable. Use 4-char manual entry."
      );
      setScannerRunning(false);
      isScanningRef.current = false;
    }
  }, [facingMode, submitCheckin]);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current && isScanningRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {
        // ignore
      }
      isScanningRef.current = false;
    }
    setScannerRunning(false);
    setTorchOn(false);
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
      }, 250);
    }
  };

  const toggleTorch = async () => {
    if (!scannerRef.current || !scannerRunning) return;
    try {
      const nextTorch = !torchOn;
      await scannerRef.current.applyVideoConstraints({
        // @ts-ignore
        advanced: [{ torch: nextTorch }],
      });
      setTorchOn(nextTorch);
    } catch (e) {
      console.warn("Torch not supported on this camera:", e);
    }
  };

  const handleManualInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const clean = raw.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
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
  const successCount = scanHistory.filter((s) => s.status === "success").length;
  const totalCount = scanHistory.length;

  // =========================================================================
  // VIEW 1: VOLUNTEER AUTHENTICATION SCREEN (NEOBRUTALIST THEMED)
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F4F4F6] text-brand-ink flex flex-col justify-between p-4 sm:p-6 selection:bg-brand-lime selection:text-black font-sans">
        <header className="max-w-md w-full mx-auto flex items-center justify-between pt-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl overflow-hidden border-2 border-brand-ink bg-white shadow-[2px_2px_0px_0px_#0A0A0A]">
              <Image
                src="/Cabinet Assets/cabinet-square-logo-white-bg.png"
                alt="Student Cabinet"
                width={36}
                height={36}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-display text-lg font-black uppercase tracking-wide block leading-none text-brand-ink">
                CABINET VALLEY
              </span>
              <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
                GATE SCAN STATION
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-brand-ink text-white text-[10px] font-mono font-bold uppercase tracking-wider">
            VOLUNTEER
          </span>
        </header>

        <div className="max-w-md w-full mx-auto my-auto py-8">
          <div className="bg-white rounded-3xl border-4 border-brand-ink p-7 sm:p-9 shadow-[8px_8px_0px_0px_#0A0A0A] space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-brand-lime border-2 border-brand-ink text-brand-ink flex items-center justify-center mx-auto shadow-[3px_3px_0px_0px_#0A0A0A]">
                <Lock className="w-7 h-7" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-violet bg-violet-100 border border-violet-300 px-3 py-1 rounded-full inline-block">
                OFFICIAL VOLUNTEER LOGIN
              </span>
              <h1 className="font-display text-3xl font-black uppercase text-brand-ink tracking-tight pt-1">
                GATE OPERATOR SIGN IN
              </h1>
              <p className="text-xs text-zinc-600 font-medium leading-relaxed">
                Log in with your volunteer account to unlock the camera scanner and gate pass verification.
              </p>
            </div>

            <form onSubmit={handleVolunteerLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[11px] font-black uppercase tracking-wider text-brand-ink">
                  VOLUNTEER EMAIL
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="volunteer@cabinet.edu"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl border-2 border-brand-ink bg-white text-brand-ink text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-violet shadow-[2px_2px_0px_0px_#0A0A0A]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-black uppercase tracking-wider text-brand-ink">
                  PASSWORD
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl border-2 border-brand-ink bg-white text-brand-ink text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-violet shadow-[2px_2px_0px_0px_#0A0A0A]"
                  />
                </div>
              </div>

              {authError && (
                <div className="p-3 bg-red-100 border-2 border-red-500 text-red-800 text-xs font-bold rounded-xl flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0 text-red-600" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-4 rounded-xl bg-brand-lime hover:bg-brand-lime-dark text-brand-ink font-black text-xs uppercase tracking-wider border-2 border-brand-ink shadow-[4px_4px_0px_0px_#0A0A0A] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#0A0A0A] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isLoggingIn ? (
                  <span>VALIDATING CREDENTIALS...</span>
                ) : (
                  <>
                    <span>UNLOCK GATE SCANNER</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <footer className="py-2 text-center text-zinc-500 text-[11px] font-mono">
          Student Cabinet Valley 2026 · Official Gate Station Terminal
        </footer>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: AUTHENTICATED SCAN STATION (NEOBRUTALIST HARDWARE EXPERIENCE)
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#F4F4F6] text-brand-ink flex flex-col justify-between selection:bg-brand-lime selection:text-black font-sans">
      {/* ===================================================================== */}
      {/* FULL VERIFICATION RESULT STAMP MODAL                                  */}
      {/* ===================================================================== */}
      {activeOverlay && (
        <div
          onClick={dismissOverlay}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 cursor-pointer animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-lg w-full bg-white rounded-3xl border-4 border-brand-ink p-6 sm:p-8 shadow-[10px_10px_0px_0px_#0A0A0A] text-center space-y-5 animate-in zoom-in-95 duration-150"
          >
            {/* Status Stamp Header */}
            <div className="space-y-3">
              <div
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl border-4 border-brand-ink flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_#0A0A0A] ${
                  activeOverlay.status === "success"
                    ? "bg-brand-lime text-brand-ink"
                    : activeOverlay.status === "wrong_gate"
                    ? "bg-amber-300 text-brand-ink"
                    : "bg-red-400 text-white"
                }`}
              >
                {activeOverlay.status === "success" ? (
                  <CheckCircle2 className="w-12 h-12 sm:w-14 sm:h-14 stroke-[2.5]" />
                ) : activeOverlay.status === "wrong_gate" ? (
                  <AlertTriangle className="w-12 h-12 sm:w-14 sm:h-14 stroke-[2.5]" />
                ) : (
                  <XCircle className="w-12 h-12 sm:w-14 sm:h-14 stroke-[2.5]" />
                )}
              </div>

              <div>
                <span
                  className={`text-[11px] font-mono font-black uppercase tracking-widest px-3 py-1 rounded-full border-2 border-brand-ink ${
                    activeOverlay.status === "success"
                      ? "bg-emerald-100 text-emerald-900"
                      : activeOverlay.status === "wrong_gate"
                      ? "bg-amber-100 text-amber-900"
                      : "bg-red-100 text-red-900"
                  }`}
                >
                  {activeOverlay.title}
                </span>

                <h2 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tight text-brand-ink mt-2 leading-none">
                  {activeOverlay.status === "success"
                    ? "CHECK-IN CONFIRMED"
                    : activeOverlay.status === "wrong_gate"
                    ? "WRONG GATE ARENA"
                    : activeOverlay.status === "already_checked_in"
                    ? "ALREADY ADMITTED"
                    : "PASS NOT FOUND"}
                </h2>

                <p className="text-xs sm:text-sm font-semibold text-zinc-600 mt-1 max-w-sm mx-auto">
                  {activeOverlay.message}
                </p>
              </div>
            </div>

            {/* Attendee Ticket Details */}
            {activeOverlay.attendee && (
              <div className="bg-[#F8F8FA] rounded-2xl border-2 border-brand-ink p-5 text-left space-y-3 shadow-[2px_2px_0px_0px_#0A0A0A]">
                <div className="flex items-center justify-between border-b border-zinc-300 pb-2">
                  <span className="text-[10px] font-mono font-black uppercase tracking-wider text-zinc-500">
                    ATTENDEE VERIFICATION
                  </span>
                  <div className="flex items-center gap-2">
                    {activeOverlay.shortCode && (
                      <span className="text-xs font-mono font-black text-brand-ink bg-brand-lime border border-brand-ink px-2 py-0.5 rounded-lg">
                        #{activeOverlay.shortCode}
                      </span>
                    )}
                    <span className="text-[11px] font-mono font-bold text-zinc-500">
                      {activeOverlay.timestamp}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-2xl sm:text-3xl font-display font-black uppercase text-brand-ink leading-tight">
                    {activeOverlay.attendee.fullName}
                  </div>
                  {activeOverlay.attendee.email && (
                    <div className="text-xs font-mono text-zinc-600 truncate mt-0.5">
                      {activeOverlay.attendee.email}
                    </div>
                  )}
                </div>

                {activeOverlay.attendee.teamName && (
                  <div className="bg-white rounded-xl p-3 border border-brand-ink flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase text-zinc-500">
                      TEAM:
                    </span>
                    <span className="text-xs font-black text-brand-violet uppercase tracking-wide">
                      {activeOverlay.attendee.teamName}
                    </span>
                  </div>
                )}

                {activeOverlay.attendee.teamMembersNames && (
                  <div className="pt-1">
                    <span className="text-[10px] font-black uppercase text-zinc-400 block mb-0.5">
                      PARTNER / TEAM MEMBERS:
                    </span>
                    <p className="text-xs font-bold text-zinc-800">
                      {activeOverlay.attendee.teamMembersNames}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 4-Second Rate Limit Cooldown Bar */}
            <div className="bg-zinc-100 rounded-2xl p-3 border-2 border-brand-ink space-y-2">
              <div className="flex items-center justify-between text-xs font-mono font-bold">
                <span className="flex items-center gap-1.5 text-zinc-700">
                  <Clock className="w-3.5 h-3.5 text-brand-ink animate-spin" />
                  <span>
                    {cooldownRemaining > 0
                      ? `RATE LIMIT BREAK: ${cooldownRemaining}s`
                      : "READY TO SCAN NEXT ATTENDEE"}
                  </span>
                </span>
                <span className="px-2 py-0.5 rounded bg-brand-ink text-brand-lime font-black">
                  {cooldownRemaining > 0 ? `${cooldownRemaining}s` : "READY"}
                </span>
              </div>

              <div className="w-full h-2.5 bg-zinc-200 rounded-full overflow-hidden border border-brand-ink">
                <div
                  className="h-full bg-brand-lime transition-all duration-1000 ease-linear"
                  style={{
                    width: `${((4 - cooldownRemaining) / 4) * 100}%`,
                  }}
                />
              </div>

              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                Camera paused to prevent accidental double-scanning · Tap to dismiss
              </p>
            </div>

            <button
              onClick={dismissOverlay}
              className="w-full py-3.5 rounded-xl bg-brand-ink hover:bg-zinc-800 text-white text-xs font-black uppercase tracking-wider transition-transform active:scale-98 cursor-pointer"
            >
              DISMISS & SCAN NEXT
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TOP COMPACT BRAND HEADER                                              */}
      {/* ===================================================================== */}
      <header className="bg-white border-b-2 border-brand-ink sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-3">
          {/* Brand Logo & Gate Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-brand-ink bg-white shadow-[2px_2px_0px_0px_#0A0A0A] flex-shrink-0">
              <Image
                src="/Cabinet Assets/cabinet-square-logo-white-bg.png"
                alt="Student Cabinet"
                width={40}
                height={40}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-lg sm:text-xl font-black uppercase tracking-wide text-brand-ink">
                  SCAN STATION
                </span>
                <span className="inline-flex items-center gap-1 text-[9px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-lime border border-brand-ink text-brand-ink shadow-[1px_1px_0px_0px_#0A0A0A]">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-ink animate-ping" />
                  LIVE
                </span>
              </div>
              <p className="text-[11px] font-mono text-zinc-600 truncate max-w-[200px] sm:max-w-none">
                Station: <strong className="text-brand-ink">{currentGateInfo?.name}</strong> ({currentGateInfo?.venue})
              </p>
            </div>
          </div>

          {/* Quick Actions / Sound / Logout */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2.5 rounded-xl border-2 border-brand-ink transition-all neo-btn cursor-pointer ${
                soundEnabled ? "bg-brand-lime text-brand-ink" : "bg-zinc-100 text-zinc-400"
              }`}
              title={soundEnabled ? "Sound enabled" : "Sound muted"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {volunteerEmail && (
              <span className="hidden md:inline-block text-[11px] font-mono font-bold text-zinc-700 bg-zinc-100 px-3 py-2 rounded-xl border-2 border-brand-ink truncate max-w-[180px]">
                {volunteerEmail}
              </span>
            )}

            <button
              onClick={handleVolunteerLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-zinc-100 border-2 border-brand-ink text-brand-ink text-xs font-black uppercase transition-all neo-btn cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">SIGN OUT</span>
            </button>
          </div>
        </div>
      </header>

      {/* ===================================================================== */}
      {/* MAIN WORKSTATION SURFACE                                              */}
      {/* ===================================================================== */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* =================================================================== */}
        {/* 1. GATE STATION SELECTOR CAROUSEL (5 GATED TRACKS)                 */}
        {/* =================================================================== */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-mono font-black uppercase tracking-widest text-zinc-600 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-violet" />
              SELECT ARENA GATE (GATED EVENTS)
            </span>
            <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline font-bold">
              1-TAP SWITCH
            </span>
          </div>

          {/* Horizontal Tactile Event Cards Carousel */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
            {gatedGates.map((gate) => {
              const isSelected = gate.slug === selectedGate;
              return (
                <button
                  key={gate.slug}
                  onClick={() => handleGateChange(gate.slug)}
                  className={`flex-shrink-0 p-3.5 sm:p-4 rounded-2xl border-2 text-left transition-all duration-150 cursor-pointer relative min-w-[170px] sm:min-w-[190px] ${
                    isSelected
                      ? "bg-white border-brand-ink shadow-[4px_4px_0px_0px_#0A0A0A] scale-[1.02] ring-2 ring-brand-ink"
                      : "bg-white/80 hover:bg-white border-zinc-300 hover:border-brand-ink text-zinc-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      className="w-3 h-3 rounded-full border border-brand-ink flex-shrink-0"
                      style={{ backgroundColor: gate.color }}
                    />
                    <span
                      className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full border border-brand-ink ${
                        isSelected
                          ? "bg-brand-lime text-brand-ink font-bold"
                          : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {isSelected ? "ACTIVE" : gate.day}
                    </span>
                  </div>

                  <div className="font-display text-sm sm:text-base font-black uppercase tracking-tight text-brand-ink truncate">
                    {gate.name}
                  </div>

                  <div className="text-[11px] font-mono text-zinc-500 font-bold truncate mt-0.5">
                    📍 {gate.venue}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* =================================================================== */}
        {/* 2. MOBILE VIEW SWITCHER (SCANNER vs RECENT LOG)                     */}
        {/* =================================================================== */}
        <div className="flex lg:hidden bg-zinc-200 p-1.5 rounded-2xl border-2 border-brand-ink shadow-[2px_2px_0px_0px_#0A0A0A]">
          <button
            onClick={() => setActiveMobileView("scanner")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeMobileView === "scanner"
                ? "bg-brand-ink text-white shadow-sm"
                : "text-zinc-600 hover:text-brand-ink"
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>CAMERA SCANNER</span>
          </button>
          <button
            onClick={() => setActiveMobileView("history")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeMobileView === "history"
                ? "bg-brand-ink text-white shadow-sm"
                : "text-zinc-600 hover:text-brand-ink"
            }`}
          >
            <History className="w-4 h-4" />
            <span>LOG ({scanHistory.length})</span>
          </button>
        </div>

        {/* =================================================================== */}
        {/* 3. CORE HARDWARE WORKSTATION: CAMERA & RECENT SCANS                 */}
        {/* =================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* CAMERA VIEWFINDER CONSOLE */}
          <div
            className={`lg:col-span-7 space-y-4 ${
              activeMobileView === "history" ? "hidden lg:block" : "block"
            }`}
          >
            <div className="bg-white rounded-3xl border-3 border-brand-ink p-5 sm:p-7 shadow-[6px_6px_0px_0px_#0A0A0A] flex flex-col items-center">
              {/* Viewfinder Console Header */}
              <div className="w-full flex items-center justify-between mb-4 border-b-2 border-zinc-200 pb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full border border-brand-ink"
                    style={{ backgroundColor: currentGateInfo.color }}
                  />
                  <span className="font-display text-base font-black uppercase tracking-wide text-brand-ink">
                    {currentGateInfo.name} GATE
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
                  {scannerRunning ? "● CAMERA LIVE" : "○ CAMERA IDLE"}
                </span>
              </div>

              {/* Physical Camera Screen Container */}
              <div className="w-full max-w-sm aspect-square bg-black rounded-2xl overflow-hidden relative border-3 border-brand-ink shadow-[4px_4px_0px_0px_#0A0A0A] flex items-center justify-center">
                {/* HTML5 QR Mount */}
                <div id="volunteer-qr-reader" className="w-full h-full object-cover" />

                {/* RUNNING SCANNER RETICLE */}
                {scannerRunning && !activeOverlay && (
                  <>
                    {/* 4-Second Rate-Limiting Cooldown Display */}
                    {cooldownRemaining > 0 ? (
                      <div className="absolute inset-0 bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20 animate-in fade-in duration-150">
                        <div className="w-14 h-14 rounded-2xl bg-brand-lime border-2 border-brand-ink flex items-center justify-center mb-2.5 shadow-[3px_3px_0px_0px_#0A0A0A]">
                          <Clock className="w-7 h-7 text-brand-ink animate-spin" />
                        </div>
                        <span className="text-[10px] font-mono font-black uppercase tracking-widest text-zinc-500">
                          COOLDOWN PAUSE
                        </span>
                        <span className="font-display text-4xl font-black text-brand-ink mt-0.5">
                          {cooldownRemaining}s
                        </span>
                        <div className="w-44 h-3 bg-zinc-200 rounded-full overflow-hidden mt-3 border border-brand-ink">
                          <div
                            className="h-full bg-brand-lime transition-all duration-1000 ease-linear"
                            style={{ width: `${((4 - cooldownRemaining) / 4) * 100}%` }}
                          />
                        </div>
                        <p className="text-[10px] font-mono text-zinc-600 mt-2 font-bold">
                          Preventing duplicate scans...
                        </p>
                      </div>
                    ) : (
                      /* ACTIVE CYBER RETICLE & LASER LINE */
                      <div className="absolute inset-6 pointer-events-none flex flex-col items-center justify-center">
                        {/* Animated Laser Scanning Beam */}
                        <div className="w-full h-1 bg-gradient-to-r from-transparent via-brand-lime to-transparent scan-laser-line shadow-[0_0_12px_#C6F135] absolute" />

                        {/* Reticle Brackets */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-3 border-l-3 border-brand-lime rounded-tl-lg" />
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-3 border-r-3 border-brand-lime rounded-tr-lg" />
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-3 border-l-3 border-brand-lime rounded-bl-lg" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-3 border-r-3 border-brand-lime rounded-br-lg" />

                        {/* Top reticle badge */}
                        <div className="absolute -top-3 px-3 py-0.5 rounded-full bg-brand-ink border border-white/40 text-brand-lime font-mono font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-lime animate-ping" />
                          <span>ALIGN QR PASS HERE</span>
                        </div>
                      </div>
                    )}

                    {/* Camera Corner Quick Toggles */}
                    <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10 pointer-events-auto">
                      <button
                        onClick={toggleCamera}
                        className="p-2.5 rounded-xl bg-white/90 hover:bg-white text-brand-ink border-2 border-brand-ink shadow-[2px_2px_0px_0px_#0A0A0A] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                        title="Switch Camera (Front/Back)"
                      >
                        <RotateCw className="w-4 h-4" />
                      </button>

                      <button
                        onClick={toggleTorch}
                        className={`p-2.5 rounded-xl border-2 border-brand-ink shadow-[2px_2px_0px_0px_#0A0A0A] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer ${
                          torchOn ? "bg-amber-300 text-brand-ink" : "bg-white/90 hover:bg-white text-brand-ink"
                        }`}
                        title={torchOn ? "Torch On" : "Torch Off"}
                      >
                        <Flashlight className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}

                {/* IDLE CAMERA STATE */}
                {!scannerRunning && (
                  <div className="absolute inset-0 bg-zinc-900 flex flex-col items-center justify-center p-6 text-center space-y-3 z-10">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-brand-lime shadow-inner">
                      <Camera className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="font-display text-2xl font-black uppercase text-white tracking-wide">
                        SCANNER STANDBY
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1 max-w-[220px]">
                        Press the button below to turn on the camera for attendee QR verification.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {cameraError && (
                <div className="mt-4 p-3 rounded-xl bg-red-50 border-2 border-red-500 text-red-700 text-xs font-bold w-full text-center max-w-sm">
                  {cameraError}
                </div>
              )}

              {/* Viewfinder Main Tactical Buttons */}
              <div className="mt-6 w-full max-w-sm grid grid-cols-1 sm:grid-cols-2 gap-3">
                {!scannerRunning ? (
                  <button
                    onClick={startScanner}
                    className="py-3.5 px-4 rounded-xl bg-brand-lime hover:bg-brand-lime-dark text-brand-ink font-black text-xs uppercase tracking-wider border-2 border-brand-ink shadow-[4px_4px_0px_0px_#0A0A0A] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#0A0A0A] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>START SCANNER</span>
                  </button>
                ) : (
                  <button
                    onClick={stopScanner}
                    className="py-3.5 px-4 rounded-xl bg-white hover:bg-zinc-100 text-brand-ink font-black text-xs uppercase tracking-wider border-2 border-brand-ink shadow-[4px_4px_0px_0px_#0A0A0A] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#0A0A0A] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CameraOff className="w-4 h-4" />
                    <span>PAUSE CAMERA</span>
                  </button>
                )}

                <button
                  onClick={() => setShowManualModal(true)}
                  className="py-3.5 px-4 rounded-xl bg-white hover:bg-zinc-100 text-brand-ink font-black text-xs uppercase tracking-wider border-2 border-brand-ink shadow-[4px_4px_0px_0px_#0A0A0A] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#0A0A0A] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Keyboard className="w-4 h-4 text-brand-violet" />
                  <span>MANUAL CODE</span>
                </button>
              </div>
            </div>
          </div>

          {/* ACTIVITY LOG & RECENT SCANS */}
          <div
            className={`lg:col-span-5 bg-white rounded-3xl border-3 border-brand-ink p-5 sm:p-6 shadow-[6px_6px_0px_0px_#0A0A0A] flex flex-col justify-between space-y-4 ${
              activeMobileView === "scanner" ? "hidden lg:flex" : "flex"
            }`}
          >
            <div>
              {/* Header with mini statistics */}
              <div className="flex items-center justify-between border-b-2 border-zinc-200 pb-3 mb-4">
                <div>
                  <span className="text-xs font-display font-black uppercase tracking-wider text-brand-ink block">
                    GATE ACTIVITY LOG
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 font-bold">
                    {currentGateInfo?.name}
                  </span>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-400 text-emerald-800 text-[10px] font-mono font-black">
                  {successCount} ADMITTED
                </div>
              </div>

              {/* Scans Feed */}
              {scanHistory.length === 0 ? (
                <div className="py-20 text-center text-zinc-400 text-xs font-medium space-y-2">
                  <Clock className="w-8 h-8 mx-auto text-zinc-400 stroke-1" />
                  <p className="font-bold text-zinc-500">No scans recorded yet at this gate.</p>
                  <p className="text-[11px] text-zinc-400 max-w-xs mx-auto">
                    Point camera at attendee QR pass or enter their 4-character code.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1 no-scrollbar">
                  {scanHistory.map((scan, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border-2 text-xs flex items-center justify-between gap-3 ${
                        scan.status === "success"
                          ? "bg-emerald-50 border-emerald-400 text-emerald-900"
                          : scan.status === "wrong_gate"
                          ? "bg-amber-50 border-amber-400 text-amber-900"
                          : "bg-red-50 border-red-400 text-red-900"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div
                          className={`w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0 ${
                            scan.status === "success"
                              ? "bg-emerald-200 border-emerald-500 text-emerald-800"
                              : scan.status === "wrong_gate"
                              ? "bg-amber-200 border-amber-500 text-amber-800"
                              : "bg-red-200 border-red-500 text-red-800"
                          }`}
                        >
                          {scan.status === "success" ? (
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          ) : (
                            <X className="w-3.5 h-3.5 stroke-[3]" />
                          )}
                        </div>

                        <div className="truncate">
                          <span className="font-bold text-brand-ink block truncate text-xs">
                            {scan.attendee?.fullName || scan.title}
                          </span>
                          <span className="text-[10px] text-zinc-600 block truncate">
                            {scan.message}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end flex-shrink-0">
                        <span className="text-[10px] font-mono text-zinc-500 font-bold">
                          {scan.timestamp}
                        </span>
                        {scan.shortCode && (
                          <span className="text-[9px] font-mono font-black bg-white border border-brand-ink px-1.5 py-0.2 rounded mt-0.5 text-brand-ink">
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
              <div className="pt-2 border-t border-zinc-200 flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-500 font-bold">
                  Total logs: {totalCount}
                </span>
                <button
                  onClick={() => setScanHistory([])}
                  className="text-[11px] font-bold text-zinc-500 hover:text-red-600 uppercase transition-colors cursor-pointer"
                >
                  CLEAR LOG
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ===================================================================== */}
      {/* 4. MANUAL 4-CHARACTER CODE ENTRY MODAL (RETRO KEYPAD PUNCH)          */}
      {/* ===================================================================== */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl border-4 border-brand-ink p-6 sm:p-8 text-brand-ink shadow-[10px_10px_0px_0px_#0A0A0A] space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-brand-ink bg-brand-lime border border-brand-ink px-3 py-1 rounded-full shadow-[1px_1px_0px_0px_#0A0A0A]">
                MANUAL ENTRY
              </span>
              <button
                onClick={() => setShowManualModal(false)}
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 border-2 border-brand-ink text-brand-ink flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-brand-ink">
                ENTER 4-CHAR PASS CODE
              </h3>
              <p className="text-xs text-zinc-600 font-medium leading-relaxed">
                Type the 4-character ticket code shown directly underneath the QR pass on the attendee&apos;s device:
              </p>
            </div>

            {/* Current Arena Gate Stamp */}
            <div className="bg-[#F8F8FA] rounded-2xl p-3 border-2 border-brand-ink flex items-center justify-between text-xs">
              <span className="text-zinc-500 font-mono text-[10px] uppercase font-bold">
                ADMITTING TO:
              </span>
              <span className="font-black text-brand-ink uppercase text-[11px] flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full border border-brand-ink"
                  style={{ backgroundColor: currentGateInfo.color }}
                />
                <span>{currentGateInfo.name}</span>
                <span className="text-zinc-500 font-normal font-mono">({currentGateInfo.venue})</span>
              </span>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              {/* Retro Keypad 4-Character Display */}
              <div className="space-y-2">
                <div className="flex justify-center gap-2.5 sm:gap-3">
                  {[0, 1, 2, 3].map((idx) => {
                    const char = manualTokenInput[idx] || "";
                    const isNext = manualTokenInput.length === idx;
                    return (
                      <div
                        key={idx}
                        className={`w-14 h-16 sm:w-16 sm:h-20 rounded-2xl border-3 flex items-center justify-center font-mono font-black text-3xl sm:text-4xl transition-all ${
                          char
                            ? "border-brand-ink bg-brand-lime text-brand-ink shadow-[3px_3px_0px_0px_#0A0A0A]"
                            : isNext
                            ? "border-brand-ink bg-white text-brand-ink shadow-[2px_2px_0px_0px_#0A0A0A] animate-pulse"
                            : "border-zinc-300 bg-zinc-100 text-zinc-400"
                        }`}
                      >
                        {char || "•"}
                      </div>
                    );
                  })}
                </div>

                {/* Direct Text Input */}
                <input
                  type="text"
                  autoFocus
                  maxLength={4}
                  required
                  placeholder="TYPE 4 CHARS"
                  value={manualTokenInput}
                  onChange={handleManualInputChange}
                  className="w-full text-center py-3.5 px-4 rounded-xl bg-white border-2 border-brand-ink focus:border-brand-violet text-brand-ink text-base font-mono font-black tracking-widest uppercase placeholder:text-zinc-400 focus:outline-none transition-colors mt-2 shadow-[2px_2px_0px_0px_#0A0A0A]"
                />

                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 px-1 font-bold">
                  <span>Fast Gate Code</span>
                  <span className={manualTokenInput.length === 4 ? "text-brand-violet font-black" : ""}>
                    {manualTokenInput.length} of 4 characters entered
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="flex-1 py-3.5 rounded-xl border-2 border-brand-ink bg-white hover:bg-zinc-100 text-xs font-black uppercase transition-colors cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={manualTokenInput.trim().length !== 4 || isProcessing}
                  className="flex-1 py-3.5 rounded-xl bg-brand-lime hover:bg-brand-lime-dark text-brand-ink font-black text-xs uppercase tracking-wider border-2 border-brand-ink shadow-[3px_3px_0px_0px_#0A0A0A] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#0A0A0A] disabled:opacity-40 transition-all cursor-pointer"
                >
                  VERIFY PASS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* FOOTER                                                                */}
      {/* ===================================================================== */}
      <footer className="bg-white border-t-2 border-brand-ink py-3 text-center text-zinc-500 text-[11px] font-mono">
        Student Cabinet Valley 2026 · Official Gate Station Terminal
      </footer>
    </div>
  );
}
