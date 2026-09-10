"use client";

import Link from "next/link";
import { ArrowUpRight, Sparkles, Layers } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b-2 border-brand-ink/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Left: Brandmark */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-brand-ink text-white rounded-xl flex items-center justify-center font-display text-xl transition-transform group-hover:rotate-6 group-hover:bg-brand-violet">
            CV
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg sm:text-xl font-bold tracking-wide text-brand-ink leading-none">
              CABINET VALLEY
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-brand-violet leading-tight">
              STUDENT FEST 2026
            </span>
          </div>
        </Link>

        {/* Center: Nav links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-black tracking-wider uppercase text-brand-ink/80">
          <Link href="#overview" className="hover:text-brand-violet transition-colors">
            OVERVIEW
          </Link>
          <Link href="#events" className="hover:text-brand-violet transition-colors">
            EVENTS (6)
          </Link>
          <Link href="#timeline" className="hover:text-brand-violet transition-colors">
            TIMELINE
          </Link>
          <Link href="#leaderboard" className="hover:text-brand-violet transition-colors">
            LEADERBOARD
          </Link>
          <Link href="#sponsors" className="hover:text-brand-violet transition-colors">
            SPONSORS
          </Link>
        </nav>

        {/* Right: Date Badge & CTA */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-brand-surface rounded-full border border-brand-border text-[11px] font-bold uppercase tracking-wider text-brand-ink">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>OCT 14–16</span>
          </div>

          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-brand-violet hover:bg-brand-violet-dark text-white text-xs sm:text-sm font-black uppercase tracking-wider transition-all transform hover:scale-105 active:scale-95 shadow-md shadow-brand-violet/20"
          >
            <span>REGISTER NOW</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
