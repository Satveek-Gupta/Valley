"use client";

import { useEffect, useState } from "react";

interface CountdownWidgetProps {
  targetDate?: string;
  theme?: "violet" | "dark" | "transparent";
  compact?: boolean;
}

export default function CountdownWidget({
  targetDate = process.env.NEXT_PUBLIC_COUNTDOWN_TARGET || "2026-09-24T09:00:00+05:30",
  theme = "violet",
  compact = false,
}: CountdownWidgetProps) {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: "02",
    hours: "22",
    minutes: "48",
    seconds: "55",
  });

  useEffect(() => {
    setMounted(true);
    const calculateTimeLeft = () => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeLeft({
          days: String(days).padStart(2, "0"),
          hours: String(hours).padStart(2, "0"),
          minutes: String(minutes).padStart(2, "0"),
          seconds: String(seconds).padStart(2, "0"),
        });
      } else {
        // Default festival live countdown simulation
        const sec = new Date().getSeconds();
        setTimeLeft({
          days: "02",
          hours: "18",
          minutes: "34",
          seconds: String(sec).padStart(2, "0"),
        });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold tracking-normal bg-black/40 text-white px-3 py-1.5 rounded-full border border-white/10">
        <span>{timeLeft.days}</span>
        <span className="text-white/40">:</span>
        <span>{timeLeft.hours}</span>
        <span className="text-white/40">:</span>
        <span>{timeLeft.minutes}</span>
        <span className="text-white/40">:</span>
        <span className="text-brand-lime font-black">{timeLeft.seconds}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-[9px] uppercase tracking-widest text-white/70 font-semibold px-0.5">
        <span>DAYS</span>
        <span>HOURS</span>
        <span>MINS</span>
        <span className="text-brand-lime">SECS</span>
      </div>
      <div className="flex items-center justify-between font-display text-2xl md:text-3xl font-bold tracking-wide text-white">
        <span>{timeLeft.days}</span>
        <span className="text-white/40 text-lg font-sans mx-1">:</span>
        <span>{timeLeft.hours}</span>
        <span className="text-white/40 text-lg font-sans mx-1">:</span>
        <span>{timeLeft.minutes}</span>
        <span className="text-white/40 text-lg font-sans mx-1">:</span>
        <span className="text-brand-lime font-black animate-pulse">{timeLeft.seconds}</span>
      </div>
    </div>
  );
}
