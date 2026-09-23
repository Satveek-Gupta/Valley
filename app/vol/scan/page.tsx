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
  RotateCcw,
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
  Search,
  RefreshCw,
  Filter,
  Maximize2,
  Minimize2,
} from "lucide-react";
import confetti from "canvas-confetti";
import { Html5Qrcode } from "html5-qrcode";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getRestrictedEventSlug, getEventNameFromSlug } from "@/lib/volunteer-gates";

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
  const [activeMobileView, setActiveMobileView] = useState<"scanner" | "participants" | "history">("scanner");
  const [activeDesktopView, setActiveDesktopView] = useState<"viewfinder" | "participants">("viewfinder");

  // Event Participants Desk State
  const [participants, setParticipants] = useState<any[]>([]);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);
  const [participantsError, setParticipantsError] = useState<string | null>(null);
  const [participantSearch, setParticipantSearch] = useState("");
  const [participantFilter, setParticipantFilter] = useState<"all" | "pending" | "checked_in">("all");
  const [admittingParticipantId, setAdmittingParticipantId] = useState<string | null>(null);
  const [rosterExpanded, setRosterExpanded] = useState(false);

  // Manual Direct Code State at top of desk
  const [directCodeInput, setDirectCodeInput] = useState("");
  const [isDirectCodeAdmitting, setIsDirectCodeAdmitting] = useState(false);
  const [directCodeFeedback, setDirectCodeFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Email Restriction detection
  const restrictedGateSlug = getRestrictedEventSlug(volunteerEmail);
  const isGateRestricted = !!restrictedGateSlug;

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

  // Whenever volunteerEmail changes or restrictedGateSlug is found, lock selectedGate
  useEffect(() => {
    if (restrictedGateSlug) {
      setSelectedGate(restrictedGateSlug);
      sessionStorage.setItem("cv_vol_gate", restrictedGateSlug);
    }
  }, [restrictedGateSlug]);

  const fetchParticipants = useCallback(
    async (slug?: string) => {
      const targetSlug = slug || selectedGate;
      if (!targetSlug) return;
      setIsLoadingParticipants(true);
      setParticipantsError(null);
      try {
        const emailParam = volunteerEmail ? `&volunteerEmail=${encodeURIComponent(volunteerEmail)}` : "";
        const res = await fetch(`/api/vol/participants?eventSlug=${targetSlug}${emailParam}`);
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to load event participants");
        }
        setParticipants(data.participants || []);
      } catch (err: any) {
        console.error("Error loading participants:", err);
        setParticipantsError(err.message || "Failed to fetch event participants");
      } finally {
        setIsLoadingParticipants(false);
      }
    },
    [selectedGate, volunteerEmail]
  );

  useEffect(() => {
    if (isAuthenticated) {
      fetchParticipants(selectedGate);
    }
  }, [isAuthenticated, selectedGate, fetchParticipants]);

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
          const email = data.session.user.email || cleanEmail;
          setVolunteerEmail(email);
          sessionStorage.setItem("cv_vol_email", email);

          const restricted = getRestrictedEventSlug(email);
          if (restricted) {
            setSelectedGate(restricted);
            sessionStorage.setItem("cv_vol_gate", restricted);
          }
        }
      } else {
        // Dev / local preview fallback
        setIsAuthenticated(true);
        setVolunteerEmail(cleanEmail);
        sessionStorage.setItem("cv_vol_email", cleanEmail);

        const restricted = getRestrictedEventSlug(cleanEmail);
        if (restricted) {
          setSelectedGate(restricted);
          sessionStorage.setItem("cv_vol_gate", restricted);
        }
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
    if (isGateRestricted && slug !== restrictedGateSlug) {
      return; // blocked
    }
    setSelectedGate(slug);
    sessionStorage.setItem("cv_vol_gate", slug);
  };

  // Direct participant checkin from the participants desk
  const handleDirectParticipantCheckin = async (participant: any) => {
    setAdmittingParticipantId(participant.id);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrToken: participant.shortCode || participant.id,
          registrationId: participant.id,
          gateEventSlug: selectedGate,
          volunteerEmail: volunteerEmail || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to confirm check-in");
      }

      if (soundEnabled) playTone("success");
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#C6F135", "#7C3AED", "#FF5A36", "#2F6FED"],
        });
      } catch {}

      const timestamp = data.checkedInAt || new Date().toISOString();
      const verifier = data.checkedInBy || volunteerEmail || "Gate Volunteer";

      setParticipants((prev) =>
        prev.map((p) =>
          p.id === participant.id ? { ...p, checkedInAt: timestamp, checkedInBy: verifier } : p
        )
      );

      setScanHistory((prev) => [
        {
          status: "success",
          title: "GATE ENTRY CONFIRMED",
          message: `Pass #${participant.shortCode} manually verified at door.`,
          attendee: {
            fullName: participant.fullName,
            email: participant.email,
            teamName: participant.teamName,
            teamMembersNames: participant.teamMembersNames,
          },
          event: data.event || currentGateInfo?.name,
          shortCode: participant.shortCode,
          checkedInAt: timestamp,
          timestamp: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
        },
        ...prev.slice(0, 29),
      ]);
    } catch (err: any) {
      if (soundEnabled) playTone("error");
      alert(err.message || "Failed to admit attendee");
    } finally {
      setAdmittingParticipantId(null);
    }
  };

  const handleDirectParticipantReset = async (participant: any) => {
    setAdmittingParticipantId(participant.id);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrToken: participant.shortCode || participant.id,
          registrationId: participant.id,
          gateEventSlug: selectedGate,
          action: "reset",
          adminOverride: true,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to reset check-in");
      }

      setParticipants((prev) =>
        prev.map((p) =>
          p.id === participant.id ? { ...p, checkedInAt: null, checkedInBy: null } : p
        )
      );
    } catch (err: any) {
      alert(err.message || "Failed to reset check-in");
    } finally {
      setAdmittingParticipantId(null);
    }
  };

  const handleDirectCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = directCodeInput.trim().toUpperCase();
    if (!code) return;
    setIsDirectCodeAdmitting(true);
    setDirectCodeFeedback(null);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrToken: code,
          gateEventSlug: selectedGate,
          volunteerEmail: volunteerEmail || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Check-in failed");
      }

      if (soundEnabled) playTone("success");
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#C6F135", "#7C3AED", "#FF5A36", "#2F6FED"],
        });
      } catch {}

      const timestamp = data.checkedInAt || new Date().toISOString();
      const verifier = data.checkedInBy || volunteerEmail || "Gate Volunteer";

      setParticipants((prev) =>
        prev.map((p) =>
          p.shortCode === code || p.id === data.registrationId
            ? { ...p, checkedInAt: timestamp, checkedInBy: verifier }
            : p
        )
      );

      setDirectCodeFeedback({
        message: `Entry confirmed for ${data.attendee?.fullName || "Attendee"} (#${data.shortCode || code})!`,
        type: "success",
      });
      setDirectCodeInput("");

      setScanHistory((prev) => [
        {
          status: "success",
          title: "GATE ENTRY CONFIRMED",
          message: `Pass #${data.shortCode || code} verified.`,
          attendee: data.attendee,
          event: data.event || currentGateInfo?.name,
          shortCode: data.shortCode || code,
          checkedInAt: timestamp,
          timestamp: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
        },
        ...prev.slice(0, 29),
      ]);
    } catch (err: any) {
      if (soundEnabled) playTone("error");
      setDirectCodeFeedback({
        message: err.message || "Failed to confirm pass code",
        type: "error",
      });
    } finally {
      setIsDirectCodeAdmitting(false);
    }
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

          // Sync with local participants state
          setParticipants((prev) =>
            prev.map((p) =>
              (data.registrationId && p.id === data.registrationId) ||
              (data.shortCode && p.shortCode === data.shortCode) ||
              (p.qrToken && p.qrToken === token)
                ? {
                    ...p,
                    checkedInAt: data.checkedInAt || new Date().toISOString(),
                    checkedInBy: data.checkedInBy || volunteerEmail || "Gate Volunteer",
                  }
                : p
            )
          );
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

  const checkedInCount = participants.filter((p) => !!p.checkedInAt).length;
  const pendingCount = participants.length - checkedInCount;

  const filteredParticipants = participants.filter((p) => {
    if (participantFilter === "pending" && p.checkedInAt) return false;
    if (participantFilter === "checked_in" && !p.checkedInAt) return false;

    const q = participantSearch.toLowerCase().trim();
    if (!q) return true;

    const shortCode = (p.shortCode || "").toLowerCase();
    const name = (p.fullName || "").toLowerCase();
    const email = (p.email || "").toLowerCase();
    const phone = (p.phone || "").toLowerCase();
    const team = (p.teamName || "").toLowerCase();
    const members = (p.teamMembersNames || "").toLowerCase();

    return (
      shortCode.includes(q) ||
      name.includes(q) ||
      email.includes(q) ||
      phone.includes(q) ||
      team.includes(q) ||
      members.includes(q)
    );
  });

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
              <h1 className="font-display text-3xl font-black uppercase text-brand-ink tracking-wide leading-tight pt-1">
                GATE OPERATOR SIGN IN
              </h1>
              <p className="text-xs text-zinc-600 font-medium leading-relaxed mt-1">
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
                    placeholder="e.g. sr_gate1@cabinetbu.tech"
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

                <h2 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-wide text-brand-ink mt-2.5 leading-tight">
                  {activeOverlay.status === "success"
                    ? "CHECK-IN CONFIRMED"
                    : activeOverlay.status === "wrong_gate"
                    ? "WRONG GATE ARENA"
                    : activeOverlay.status === "already_checked_in"
                    ? "ALREADY ADMITTED"
                    : "PASS NOT FOUND"}
                </h2>

                <p className="text-xs sm:text-sm font-semibold text-zinc-600 mt-2 max-w-sm mx-auto leading-relaxed">
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
                      <span className="text-xs font-mono font-black text-brand-ink bg-brand-lime border border-brand-ink px-2 py-0.5 rounded-lg tracking-wider">
                        #{activeOverlay.shortCode}
                      </span>
                    )}
                    <span className="text-[11px] font-mono font-bold text-zinc-500">
                      {activeOverlay.timestamp}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-2xl sm:text-3xl font-display font-black uppercase tracking-wide text-brand-ink leading-tight">
                    {activeOverlay.attendee.fullName}
                  </div>
                  {activeOverlay.attendee.email && (
                    <div className="text-xs font-mono text-zinc-600 truncate mt-1">
                      {activeOverlay.attendee.email}
                    </div>
                  )}
                </div>

                {activeOverlay.attendee.teamName && (
                  <div className="bg-white rounded-xl p-3 border border-brand-ink flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                      TEAM:
                    </span>
                    <span className="text-xs font-black text-brand-violet uppercase tracking-wide">
                      {activeOverlay.attendee.teamName}
                    </span>
                  </div>
                )}

                {activeOverlay.attendee.teamMembersNames && (
                  <div className="pt-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1">
                      PARTNER / TEAM MEMBERS:
                    </span>
                    <p className="text-xs font-bold text-zinc-800 leading-snug">
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
              <p className="text-[11px] font-mono text-zinc-600 truncate max-w-[200px] sm:max-w-none mt-0.5 leading-normal">
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
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-zinc-100 border-2 border-brand-ink text-brand-ink text-xs font-black uppercase tracking-wide transition-all neo-btn cursor-pointer"
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
        {/* 1. GATE STATION SELECTOR / ASSIGNED TRACK HEADER                    */}
        {/* =================================================================== */}
        {isGateRestricted ? (
          /* Focused single-event station card for restricted door volunteers */
          <div className="bg-white rounded-3xl border-3 border-brand-ink p-4 sm:p-5 shadow-[5px_5px_0px_0px_#0A0A0A] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div
                className="w-12 h-12 rounded-2xl border-2 border-brand-ink flex items-center justify-center shadow-[2px_2px_0px_0px_#0A0A0A] flex-shrink-0"
                style={{ backgroundColor: currentGateInfo.color }}
              >
                <MapPin className="w-6 h-6 text-white stroke-[2.5]" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-lime border border-brand-ink text-brand-ink shadow-[1px_1px_0px_0px_#0A0A0A]">
                    {currentGateInfo.day}
                  </span>
                  <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-100 text-brand-violet border border-violet-300">
                    ASSIGNED GATE STATION
                  </span>
                </div>
                <h1 className="font-display text-xl sm:text-2xl font-black uppercase tracking-wide text-brand-ink mt-1 leading-snug">
                  {currentGateInfo.name}
                </h1>
                <p className="text-xs font-mono text-zinc-500 font-bold flex items-center gap-1.5 mt-1 leading-normal">
                  <span>📍 {currentGateInfo.venue}</span>
                  <span className="text-zinc-300">·</span>
                  <span className="text-brand-violet truncate">{volunteerEmail}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="px-3.5 py-2 rounded-xl bg-zinc-50 border-2 border-brand-ink text-left sm:text-right">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold block">
                  DOOR ACCESS
                </span>
                <span className="text-xs font-mono font-black text-emerald-700 uppercase tracking-wider flex items-center gap-1.5 justify-start sm:justify-end">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  AUTHENTICATED
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Multi-gate carousel for admin/organizer accounts */
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

            <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
              {gatedGates.map((gate) => {
                const isSelected = gate.slug === selectedGate;
                return (
                  <button
                    key={gate.slug}
                    onClick={() => handleGateChange(gate.slug)}
                    className={`flex-shrink-0 p-3.5 sm:p-4 rounded-2xl border-2 text-left transition-all duration-150 relative min-w-[170px] sm:min-w-[190px] ${
                      isSelected
                        ? "bg-white border-brand-ink shadow-[4px_4px_0px_0px_#0A0A0A] scale-[1.02] ring-2 ring-brand-ink cursor-pointer"
                        : "bg-white/80 hover:bg-white border-zinc-300 hover:border-brand-ink text-zinc-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)] cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span
                        className="w-3 h-3 rounded-full border border-brand-ink flex-shrink-0"
                        style={{ backgroundColor: gate.color }}
                      />
                      <span
                        className={`text-[9px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-brand-ink ${
                          isSelected
                            ? "bg-brand-lime text-brand-ink font-bold"
                            : "bg-zinc-100 text-zinc-600"
                        }`}
                      >
                        {isSelected ? "ACTIVE GATE" : gate.day}
                      </span>
                    </div>

                    <div className="font-display text-sm sm:text-base font-black uppercase tracking-wide text-brand-ink truncate leading-snug">
                      {gate.name}
                    </div>

                    <div className="text-[11px] font-mono text-zinc-500 font-bold truncate mt-1">
                      📍 {gate.venue}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* 2. VIEW SWITCHERS (MOBILE 3-TABS & DESKTOP WORKSTATION TOGGLE)       */}
        {/* =================================================================== */}
        {/* Mobile View Switcher */}
        <div className="flex lg:hidden bg-zinc-200 p-1.5 rounded-2xl border-2 border-brand-ink shadow-[2px_2px_0px_0px_#0A0A0A] gap-1">
          <button
            onClick={() => setActiveMobileView("scanner")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeMobileView === "scanner"
                ? "bg-brand-ink text-white shadow-sm"
                : "text-zinc-600 hover:text-brand-ink"
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>SCANNER</span>
          </button>
          <button
            onClick={() => setActiveMobileView("participants")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeMobileView === "participants"
                ? "bg-brand-ink text-white shadow-sm"
                : "text-zinc-600 hover:text-brand-ink"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>ATTENDEES ({participants.length})</span>
          </button>
          <button
            onClick={() => setActiveMobileView("history")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeMobileView === "history"
                ? "bg-brand-ink text-white shadow-sm"
                : "text-zinc-600 hover:text-brand-ink"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>LOG ({scanHistory.length})</span>
          </button>
        </div>

        {/* Desktop Workstation View Switcher */}
        <div className="hidden lg:grid grid-cols-2 gap-2 bg-white p-2 rounded-2xl border-2 border-brand-ink shadow-[3px_3px_0px_0px_#0A0A0A]">
          <button
            type="button"
            onClick={() => setActiveDesktopView("viewfinder")}
            className={`py-3 px-5 rounded-xl text-xs font-black uppercase tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none ${
              activeDesktopView === "viewfinder"
                ? "bg-brand-ink text-white shadow-[2px_2px_0px_0px_#0A0A0A]"
                : "bg-zinc-50 hover:bg-zinc-100 text-zinc-600 hover:text-brand-ink"
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>CAMERA SCANNER & RECENT FEED</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveDesktopView("participants")}
            className={`py-3 px-5 rounded-xl text-xs font-black uppercase tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none ${
              activeDesktopView === "participants"
                ? "bg-brand-violet text-white shadow-[2px_2px_0px_0px_#0A0A0A]"
                : "bg-zinc-50 hover:bg-zinc-100 text-zinc-600 hover:text-brand-ink"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>EVENT ATTENDEES & MANUAL DESK ({participants.length})</span>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-brand-lime text-brand-ink text-[10px] font-mono font-black tracking-wider shadow-xs">
                {pendingCount} PENDING
              </span>
            )}
          </button>
        </div>

        {/* =================================================================== */}
        {/* 3. CORE HARDWARE WORKSTATION: CAMERA & RECENT SCANS                 */}
        {/* =================================================================== */}
        {activeDesktopView === "viewfinder" && activeMobileView !== "participants" && (
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
                  <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
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
                          <span className="font-display text-4xl font-black text-brand-ink mt-0.5 tracking-wide">
                            {cooldownRemaining}s
                          </span>
                          <div className="w-44 h-3 bg-zinc-200 rounded-full overflow-hidden mt-3 border border-brand-ink">
                            <div
                              className="h-full bg-brand-lime transition-all duration-1000 ease-linear"
                              style={{ width: `${((4 - cooldownRemaining) / 4) * 100}%` }}
                            />
                          </div>
                          <p className="text-[10px] font-mono text-zinc-600 mt-2 font-bold tracking-wide">
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

                          <div className="w-16 h-16 rounded-xl border border-white/30 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-brand-lime animate-ping" />
                          </div>
                        </div>
                      )}

                      {/* Top Floating Controls on Active Camera */}
                      <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                        <button
                          onClick={toggleCamera}
                          className="p-2.5 rounded-xl bg-white/90 hover:bg-white text-brand-ink border-2 border-brand-ink shadow-[2px_2px_0px_0px_#0A0A0A] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                          title="Switch front/back camera"
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
                        <h3 className="font-display text-2xl font-black uppercase text-white tracking-wide leading-tight">
                          SCANNER STANDBY
                        </h3>
                        <p className="text-xs text-zinc-400 mt-1.5 max-w-[240px] leading-relaxed">
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
                      className="py-3.5 px-4 rounded-xl bg-brand-lime hover:bg-brand-lime-dark text-brand-ink font-black text-xs uppercase tracking-wide border-2 border-brand-ink shadow-[4px_4px_0px_0px_#0A0A0A] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#0A0A0A] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>START SCANNER</span>
                    </button>
                  ) : (
                    <button
                      onClick={stopScanner}
                      className="py-3.5 px-4 rounded-xl bg-white hover:bg-zinc-100 text-brand-ink font-black text-xs uppercase tracking-wide border-2 border-brand-ink shadow-[4px_4px_0px_0px_#0A0A0A] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#0A0A0A] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CameraOff className="w-4 h-4" />
                      <span>PAUSE CAMERA</span>
                    </button>
                  )}

                  <button
                    onClick={() => setShowManualModal(true)}
                    className="py-3.5 px-4 rounded-xl bg-white hover:bg-zinc-100 text-brand-ink font-black text-xs uppercase tracking-wide border-2 border-brand-ink shadow-[4px_4px_0px_0px_#0A0A0A] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#0A0A0A] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Keyboard className="w-4 h-4 text-brand-violet" />
                    <span>MANUAL CODE</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveDesktopView("participants");
                      setActiveMobileView("participants");
                    }}
                    className="col-span-1 sm:col-span-2 py-3 px-4 rounded-xl bg-violet-50 hover:bg-violet-100 text-brand-violet font-black text-xs uppercase tracking-wide border-2 border-brand-violet/40 shadow-[2px_2px_0px_0px_#7C3AED] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Users className="w-4 h-4" />
                    <span>VIEW ATTENDEES & VERIFY CODE ({participants.length})</span>
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
                  <span className="text-xs font-display font-black uppercase tracking-wide text-brand-ink block leading-none">
                    GATE ACTIVITY LOG
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 font-bold block mt-1">
                    {currentGateInfo?.name}
                  </span>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-400 text-emerald-800 text-[10px] font-mono font-black tracking-wider">
                  {successCount} ADMITTED
                </div>
              </div>

              {/* Scans Feed */}
              {scanHistory.length === 0 ? (
                <div className="py-20 text-center text-zinc-400 text-xs font-medium space-y-2">
                  <Clock className="w-8 h-8 mx-auto text-zinc-400 stroke-1" />
                  <p className="font-bold text-zinc-500">No scans recorded yet at this gate.</p>
                  <p className="text-[11px] text-zinc-400 max-w-xs mx-auto leading-relaxed">
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
                          <span className="font-bold text-brand-ink block truncate text-xs leading-snug">
                            {scan.attendee?.fullName || scan.title}
                          </span>
                          <span className="text-[10px] text-zinc-600 block truncate mt-0.5">
                            {scan.message}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end flex-shrink-0">
                        <span className="text-[10px] font-mono text-zinc-500 font-bold">
                          {scan.timestamp}
                        </span>
                        {scan.shortCode && (
                          <span className="text-[9px] font-mono font-black bg-white border border-brand-ink px-1.5 py-0.5 rounded mt-0.5 text-brand-ink tracking-wider">
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
                  className="text-[11px] font-bold text-zinc-500 hover:text-red-600 uppercase tracking-wider transition-colors cursor-pointer"
                >
                  CLEAR LOG
                </button>
              </div>
            )}
          </div>
        </div>
        )}

        {/* =================================================================== */}
        {/* 3B. FALLBACK DESK: EVENT PARTICIPANTS & MANUAL CODE VERIFIER       */}
        {/* =================================================================== */}
        {(activeDesktopView === "participants" || activeMobileView === "participants") && (
          <div className="space-y-6">
            {/* Header & Quick Navigation Bar */}
            <div className="bg-white rounded-3xl border-3 border-brand-ink p-5 sm:p-6 shadow-[6px_6px_0px_0px_#0A0A0A] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-brand-ink"
                    style={{ backgroundColor: currentGateInfo.color }}
                  />
                  <span className="text-[10px] font-mono font-black uppercase tracking-widest text-brand-violet bg-violet-50 border border-violet-200 px-2.5 py-0.5 rounded-full">
                    DOOR FALLBACK DESK
                  </span>
                  {isGateRestricted && (
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Lock className="w-3 h-3 text-amber-700" />
                      LOCKED TO YOUR TRACK
                    </span>
                  )}
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-wide text-brand-ink mt-1 leading-snug">
                  {currentGateInfo.name} ATTENDEES ROSTER
                </h2>
                <p className="text-xs text-zinc-600 font-medium leading-relaxed mt-1">
                  Verify participant credentials manually if camera QR scanning fails. Search by name, phone, email, or 4-digit pass code.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setActiveDesktopView("viewfinder");
                    setActiveMobileView("scanner");
                  }}
                  className="py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-100 text-brand-ink font-black text-xs uppercase tracking-wide border-2 border-brand-ink shadow-[2px_2px_0px_0px_#0A0A0A] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>BACK TO CAMERA</span>
                </button>

                <button
                  type="button"
                  onClick={() => fetchParticipants(selectedGate)}
                  disabled={isLoadingParticipants}
                  className="py-2.5 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-brand-ink font-black text-xs uppercase tracking-wide border-2 border-brand-ink shadow-[2px_2px_0px_0px_#0A0A0A] active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
                  title="Refresh attendee list"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingParticipants ? "animate-spin" : ""}`} />
                  <span>REFRESH</span>
                </button>
              </div>
            </div>

            {/* Live Counts Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl border-2 border-brand-ink p-4 shadow-[3px_3px_0px_0px_#0A0A0A] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-zinc-500 block tracking-wider">TOTAL REGISTERED</span>
                  <span className="font-display text-2xl sm:text-3xl font-black text-brand-ink tracking-wide block mt-0.5">{participants.length}</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-300 flex items-center justify-center text-zinc-700">
                  <Users className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white rounded-2xl border-2 border-brand-ink p-4 shadow-[3px_3px_0px_0px_#0A0A0A] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-emerald-600 block tracking-wider">CONFIRMED AT GATE</span>
                  <span className="font-display text-2xl sm:text-3xl font-black text-emerald-700 tracking-wide block mt-0.5">{checkedInCount}</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white rounded-2xl border-2 border-brand-ink p-4 shadow-[3px_3px_0px_0px_#0A0A0A] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-amber-600 block tracking-wider">PENDING ARRIVAL</span>
                  <span className="font-display text-2xl sm:text-3xl font-black text-amber-700 tracking-wide block mt-0.5">{pendingCount}</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Quick 4-Digit Pass Code Entry Box */}
            <div className="bg-white rounded-3xl border-3 border-brand-ink p-5 sm:p-6 shadow-[6px_6px_0px_0px_#0A0A0A] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b-2 border-zinc-200 pb-3">
                <div className="flex items-center gap-2">
                  <Keyboard className="w-5 h-5 text-brand-violet" />
                  <span className="font-display text-lg font-black uppercase text-brand-ink tracking-wide leading-none">
                    DIRECT PASS CODE VERIFIER
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
                  PUNCH 4-CHAR CODE UNDER QR CODE
                </span>
              </div>

              <form onSubmit={handleDirectCodeSubmit} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    maxLength={4}
                    value={directCodeInput}
                    onChange={(e) => setDirectCodeInput(e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase())}
                    placeholder="ENTER 4 CHARS (E.G. 8E4B)"
                    className="w-full py-3.5 px-4 rounded-xl bg-[#F8F8FA] border-2 border-brand-ink text-brand-ink font-mono font-black text-lg tracking-[0.25em] uppercase placeholder:text-zinc-400 placeholder:text-sm placeholder:font-sans placeholder:normal-case placeholder:tracking-normal focus:bg-white focus:outline-none focus:border-brand-violet transition-colors shadow-inner"
                  />
                  {directCodeInput && (
                    <button
                      type="button"
                      onClick={() => setDirectCodeInput("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-brand-ink text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={directCodeInput.trim().length !== 4 || isDirectCodeAdmitting}
                  className="py-3.5 px-6 rounded-xl bg-brand-lime hover:bg-brand-lime-dark text-brand-ink font-black text-xs uppercase tracking-wide border-2 border-brand-ink shadow-[4px_4px_0px_0px_#0A0A0A] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#0A0A0A] disabled:opacity-40 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isDirectCodeAdmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>CHECKING...</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>VERIFY & ADMIT</span>
                    </>
                  )}
                </button>
              </form>

              {/* Direct Code Feedback Message */}
              {directCodeFeedback && (
                <div
                  className={`p-3.5 rounded-xl border-2 text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in ${
                    directCodeFeedback.type === "success"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-900"
                      : "bg-red-50 border-red-500 text-red-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {directCodeFeedback.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                    <span>{directCodeFeedback.message}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDirectCodeFeedback(null)}
                    className="text-zinc-500 hover:text-brand-ink text-xs"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white rounded-3xl border-3 border-brand-ink p-5 sm:p-6 shadow-[6px_6px_0px_0px_#0A0A0A] space-y-4">
              <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={participantSearch}
                    onChange={(e) => setParticipantSearch(e.target.value)}
                    placeholder="Search by 4-digit code, attendee name, email, phone, team..."
                    className="w-full py-2.5 pl-10 pr-9 rounded-xl bg-[#F8F8FA] border-2 border-brand-ink text-brand-ink text-xs font-bold placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:border-brand-violet transition-colors"
                  />
                  {participantSearch && (
                    <button
                      type="button"
                      onClick={() => setParticipantSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-brand-ink text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Status Filter Tabs & Expand Toggle */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-xl border border-zinc-300">
                    <button
                      type="button"
                      onClick={() => setParticipantFilter("all")}
                      className={`py-1.5 px-3 rounded-lg text-xs font-black uppercase tracking-wide transition-all cursor-pointer ${
                        participantFilter === "all"
                          ? "bg-brand-ink text-white shadow-xs"
                          : "text-zinc-600 hover:text-brand-ink"
                      }`}
                    >
                      ALL ({participants.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setParticipantFilter("pending")}
                      className={`py-1.5 px-3 rounded-lg text-xs font-black uppercase tracking-wide transition-all cursor-pointer ${
                        participantFilter === "pending"
                          ? "bg-amber-400 text-brand-ink shadow-xs"
                          : "text-zinc-600 hover:text-brand-ink"
                      }`}
                    >
                      PENDING ({pendingCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setParticipantFilter("checked_in")}
                      className={`py-1.5 px-3 rounded-lg text-xs font-black uppercase tracking-wide transition-all cursor-pointer ${
                        participantFilter === "checked_in"
                          ? "bg-emerald-500 text-white shadow-xs"
                          : "text-zinc-600 hover:text-brand-ink"
                      }`}
                    >
                      ADMITTED ({checkedInCount})
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setRosterExpanded(!rosterExpanded)}
                    className="py-1.5 px-3 rounded-xl bg-white hover:bg-zinc-100 border-2 border-brand-ink text-xs font-mono font-black uppercase tracking-wider text-brand-ink flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_#0A0A0A] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                    title={rosterExpanded ? "Switch to scroll box" : "Expand full page (no internal scroll)"}
                  >
                    {rosterExpanded ? (
                      <>
                        <Minimize2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">COMPACT BOX</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">EXPAND ALL</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Error Notice if fetch failed */}
              {participantsError && (
                <div className="p-3.5 rounded-xl bg-red-50 border-2 border-red-500 text-red-800 text-xs font-bold flex items-center justify-between">
                  <span>{participantsError}</span>
                  <button
                    type="button"
                    onClick={() => fetchParticipants(selectedGate)}
                    className="underline hover:text-red-900 cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Roster List / Cards */}
              {isLoadingParticipants ? (
                <div className="py-16 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 mx-auto text-brand-violet animate-spin" />
                  <p className="font-bold text-zinc-500 text-xs uppercase tracking-wider">
                    Loading {currentGateInfo.name} participants...
                  </p>
                </div>
              ) : filteredParticipants.length === 0 ? (
                <div className="py-16 text-center text-zinc-400 text-xs space-y-2">
                  <Users className="w-8 h-8 mx-auto text-zinc-300" />
                  <p className="font-bold text-zinc-600 text-sm">No attendees found</p>
                  <p className="text-[11px] text-zinc-400 max-w-xs mx-auto leading-relaxed">
                    {participantSearch
                      ? `No results matching "${participantSearch}". Try searching with fewer characters or a 4-digit code.`
                      : `No registered participants found for ${currentGateInfo.name}.`}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div
                    className={`relative ${
                      rosterExpanded
                        ? ""
                        : "roster-scrollbar overflow-y-auto max-h-[580px] sm:max-h-[660px] pr-2 overscroll-contain focus:outline-none"
                    }`}
                    tabIndex={rosterExpanded ? undefined : 0}
                    style={
                      rosterExpanded
                        ? undefined
                        : {
                            WebkitOverflowScrolling: "touch",
                            touchAction: "pan-y",
                          }
                    }
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pb-6 pt-1">
                      {filteredParticipants.map((p) => {
                        const isCheckedIn = !!p.checkedInAt;
                        const isAdmitting = admittingParticipantId === p.id;

                        return (
                          <div
                            key={p.id}
                            className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between gap-3 ${
                              isCheckedIn
                                ? "bg-emerald-50/60 border-emerald-400 text-emerald-950"
                                : "bg-white hover:bg-zinc-50/80 border-brand-ink shadow-[3px_3px_0px_0px_#0A0A0A]"
                            }`}
                          >
                            <div className="space-y-2">
                              {/* Card Header: 4-digit Code + Status Pill */}
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-mono font-black text-sm px-2.5 py-0.5 rounded-lg bg-brand-lime border-2 border-brand-ink text-brand-ink tracking-wider shadow-[1px_1px_0px_0px_#0A0A0A]">
                                  #{p.shortCode || "N/A"}
                                </span>

                                {isCheckedIn ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-400 text-emerald-800 text-[10px] font-mono font-black uppercase tracking-wider">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                    ADMITTED
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-400 text-amber-900 text-[10px] font-mono font-black uppercase tracking-wider">
                                    <Clock className="w-3 h-3" />
                                    PENDING
                                  </span>
                                )}
                              </div>

                              {/* Attendee Name */}
                              <div>
                                <h4 className="font-display text-base font-black uppercase tracking-wide text-brand-ink truncate leading-tight">
                                  {p.fullName}
                                </h4>
                                {p.teamName && (
                                  <p className="text-[11px] font-bold text-brand-violet truncate mt-1 tracking-wide">
                                    Team: {p.teamName}
                                  </p>
                                )}
                              </div>

                              {/* Contact Info */}
                              <div className="text-[11px] font-mono text-zinc-600 space-y-1.5 border-t border-zinc-200/80 pt-2.5 leading-normal">
                                {p.email && (
                                  <p className="truncate flex items-center gap-1.5">
                                    <Mail className="w-3 h-3 text-zinc-400 shrink-0" />
                                    <span className="truncate">{p.email}</span>
                                  </p>
                                )}
                                {p.phone && (
                                  <p className="truncate">
                                    📞 <span className="font-semibold">{p.phone}</span>
                                  </p>
                                )}
                                {p.teamMembersNames && (
                                  <p className="text-[10px] text-zinc-500 truncate">
                                    Members: {p.teamMembersNames}
                                  </p>
                                )}
                              </div>

                              {/* Check-in Timestamp & Verifier if checked in */}
                              {isCheckedIn && (
                                <div className="text-[10px] font-mono text-emerald-800 bg-emerald-100/70 p-2.5 rounded-xl border border-emerald-300 space-y-1 leading-normal">
                                  <div>
                                    Entry at:{" "}
                                    <strong>
                                      {new Date(p.checkedInAt).toLocaleTimeString("en-US", {
                                        hour: "numeric",
                                        minute: "2-digit",
                                        hour12: true,
                                      })}
                                    </strong>
                                  </div>
                                  {p.checkedInBy && (
                                    <div className="truncate">
                                      Verified by: <strong>{p.checkedInBy}</strong>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-2 border-t border-zinc-200/80 flex items-center justify-between gap-2">
                              {!isCheckedIn ? (
                                <button
                                  type="button"
                                  disabled={isAdmitting}
                                  onClick={() => handleDirectParticipantCheckin(p)}
                                  className="w-full py-2.5 px-3 rounded-xl bg-brand-lime hover:bg-brand-lime-dark text-brand-ink font-black text-xs uppercase tracking-wide border-2 border-brand-ink shadow-[2px_2px_0px_0px_#0A0A0A] active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-40 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  {isAdmitting ? (
                                    <>
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                      <span>ADMITTING...</span>
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="w-3.5 h-3.5" />
                                      <span>CONFIRM GATE ENTRY</span>
                                    </>
                                  )}
                                </button>
                              ) : (
                                <div className="w-full flex items-center justify-between">
                                  <span className="text-[10px] font-mono text-emerald-700 font-bold tracking-wider">
                                    Pass verified
                                  </span>
                                  <button
                                    type="button"
                                    disabled={isAdmitting}
                                    onClick={() => handleDirectParticipantReset(p)}
                                    className="py-1 px-2.5 rounded-lg border border-zinc-300 hover:border-red-400 bg-white hover:bg-red-50 text-zinc-600 hover:text-red-700 text-[10px] font-mono font-bold tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                                    title="Reset check-in status"
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>Undo</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Roster Bottom Status Bar & Expand Hint */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-[11px] font-mono text-zinc-500 pt-3 border-t-2 border-zinc-200 font-bold gap-2 px-1">
                    <span>
                      Showing <strong>{filteredParticipants.length}</strong> of <strong>{participants.length}</strong> attendees {participantFilter !== "all" ? `(${participantFilter})` : ""}
                    </span>
                    {!rosterExpanded && filteredParticipants.length > 4 && (
                      <button
                        type="button"
                        onClick={() => setRosterExpanded(true)}
                        className="text-brand-violet hover:underline flex items-center gap-1 cursor-pointer font-black self-start sm:self-auto"
                      >
                        <span>Show all on full page (disable scroll box)</span>
                        <Maximize2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
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
              <h3 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-wide text-brand-ink leading-tight">
                ENTER 4-CHAR PASS CODE
              </h3>
              <p className="text-xs text-zinc-600 font-medium leading-relaxed mt-1">
                Type the 4-character ticket code shown directly underneath the QR pass on the attendee&apos;s device:
              </p>
            </div>

            {/* Current Arena Gate Stamp */}
            <div className="bg-[#F8F8FA] rounded-2xl p-3 border-2 border-brand-ink flex items-center justify-between text-xs">
              <span className="text-zinc-500 font-mono text-[10px] uppercase font-bold tracking-wider">
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
                  className="w-full text-center py-3.5 px-4 rounded-xl bg-white border-2 border-brand-ink focus:border-brand-violet text-brand-ink text-base font-mono font-black tracking-[0.25em] uppercase placeholder:text-zinc-400 placeholder:tracking-normal focus:outline-none transition-colors mt-2 shadow-[2px_2px_0px_0px_#0A0A0A]"
                />

                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 px-1 font-bold tracking-wide">
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
                  className="flex-1 py-3.5 rounded-xl border-2 border-brand-ink bg-white hover:bg-zinc-100 text-xs font-black uppercase tracking-wide transition-colors cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={manualTokenInput.trim().length !== 4 || isProcessing}
                  className="flex-1 py-3.5 rounded-xl bg-brand-lime hover:bg-brand-lime-dark text-brand-ink font-black text-xs uppercase tracking-wide border-2 border-brand-ink shadow-[3px_3px_0px_0px_#0A0A0A] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#0A0A0A] disabled:opacity-40 transition-all cursor-pointer"
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
