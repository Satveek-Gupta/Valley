"use client";

import { useEffect, useState } from "react";

interface CountdownWidgetProps {
  targetDate?: string;
  theme?: "violet" | "dark" | "transparent";
  compact?: boolean;
}

interface TimeLeftState {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  isLive: boolean;
  isEnded: boolean;
}

function calculateTimeLeft(targetDateStr: string): TimeLeftState {
  const target = new Date(targetDateStr).getTime();
  const now = Date.now();
  const difference = target - now;

  if (isNaN(target)) {
    return {
      days: "00",
      hours: "00",
      minutes: "00",
      seconds: "00",
      isLive: false,
      isEnded: false,
    };
  }

  if (difference <= 0) {
    // 3 days festival duration (3 * 24 * 60 * 60 * 1000 ms)
    const FESTIVAL_DURATION_MS = 3 * 24 * 60 * 60 * 1000;
    const isLive = difference > -FESTIVAL_DURATION_MS;
    return {
      days: "00",
      hours: "00",
      minutes: "00",
      seconds: "00",
      isLive,
      isEnded: !isLive,
    };
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((difference / (1000 * 60)) % 60);
  const seconds = Math.floor((difference / 1000) % 60);

  return {
    days: String(days).padStart(2, "0"),
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
    isLive: false,
    isEnded: false,
  };
}

export default function CountdownWidget({
  targetDate = process.env.NEXT_PUBLIC_COUNTDOWN_TARGET || "2026-09-24T09:00:00+05:30",
  theme = "violet",
  compact = false,
}: CountdownWidgetProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTarget, setActiveTarget] = useState(targetDate);
  const [timeLeft, setTimeLeft] = useState<TimeLeftState>(() => calculateTimeLeft(targetDate));

  useEffect(() => {
    setIsMounted(true);
    // Check if custom target set in localStorage by admin
    try {
      const stored = localStorage.getItem("cv_countdown_target");
      if (stored) {
        setActiveTarget(stored);
      }
    } catch {
      // Ignore in non-browser environments
    }
  }, []);

  useEffect(() => {
    const update = () => {
      setTimeLeft(calculateTimeLeft(activeTarget));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [activeTarget]);

  if (compact) {
    if (timeLeft.isLive) {
      return (
        <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold tracking-normal bg-brand-lime text-black px-3 py-1.5 rounded-full border border-brand-lime shadow-sm">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping inline-block mr-0.5" />
          <span className="font-black">LIVE NOW</span>
        </div>
      );
    }

    if (timeLeft.isEnded) {
      return (
        <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold tracking-normal bg-black/40 text-white/70 px-3 py-1.5 rounded-full border border-white/10">
          <span>EVENT CONCLUDED</span>
        </div>
      );
    }

    return (
      <div
        suppressHydrationWarning
        className="inline-flex items-center gap-1.5 font-mono text-xs font-bold tracking-normal bg-black/40 text-white px-3 py-1.5 rounded-full border border-white/10"
      >
        <span suppressHydrationWarning>{isMounted ? timeLeft.days : "--"}</span>
        <span className="text-white/40">:</span>
        <span suppressHydrationWarning>{isMounted ? timeLeft.hours : "--"}</span>
        <span className="text-white/40">:</span>
        <span suppressHydrationWarning>{isMounted ? timeLeft.minutes : "--"}</span>
        <span className="text-white/40">:</span>
        <span suppressHydrationWarning className="text-brand-lime font-black">
          {isMounted ? timeLeft.seconds : "--"}
        </span>
      </div>
    );
  }

  if (timeLeft.isLive) {
    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-lime">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
          </span>
          <span>FESTIVAL IS LIVE NOW</span>
        </div>
        <div className="flex items-center justify-between font-display text-2xl md:text-3xl font-bold tracking-wide text-white">
          <span className="text-brand-lime">DAY 01–03</span>
          <span className="text-xs font-sans font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-lime text-black">
            IN PROGRESS
          </span>
        </div>
      </div>
    );
  }

  if (timeLeft.isEnded) {
    return (
      <div className="flex flex-col gap-1">
        <div className="text-[10px] font-black uppercase tracking-widest text-white/60 px-0.5">
          STATUS
        </div>
        <div className="font-display text-2xl font-bold tracking-wide text-white/80">
          EVENT CONCLUDED
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1" suppressHydrationWarning>
      <div className="flex items-center justify-between text-[9px] uppercase tracking-widest text-white/70 font-semibold px-0.5">
        <span>DAYS</span>
        <span>HOURS</span>
        <span>MINS</span>
        <span className="text-brand-lime">SECS</span>
      </div>
      <div className="flex items-center justify-between font-display text-2xl md:text-3xl font-bold tracking-wide text-white">
        <span suppressHydrationWarning>{isMounted ? timeLeft.days : "--"}</span>
        <span className="text-white/40 text-lg font-sans mx-1">:</span>
        <span suppressHydrationWarning>{isMounted ? timeLeft.hours : "--"}</span>
        <span className="text-white/40 text-lg font-sans mx-1">:</span>
        <span suppressHydrationWarning>{isMounted ? timeLeft.minutes : "--"}</span>
        <span className="text-white/40 text-lg font-sans mx-1">:</span>
        <span
          suppressHydrationWarning
          className="text-brand-lime font-black animate-pulse"
        >
          {isMounted ? timeLeft.seconds : "--"}
        </span>
      </div>
    </div>
  );
}
