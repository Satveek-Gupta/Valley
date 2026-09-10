"use client";

import Link from "next/link";
import { ArrowUpRight, Sparkles, Layers } from "lucide-react";
import CountdownWidget from "@/components/countdown-widget";

export default function Footer() {
  return (
    <footer className="w-full bg-brand-violet text-white pt-16 pb-12 overflow-hidden border-t-4 border-brand-ink">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-white/20">
          
          {/* Column 1: Brandmark & Tagline */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white text-brand-violet flex items-center justify-center font-display text-2xl font-black">
                  CV
                </div>
                <div>
                  <h3 className="font-display text-2xl font-black uppercase text-white leading-none">
                    CABINET VALLEY<span className="text-brand-lime">®</span>
                  </h3>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white/80">
                    ANNUAL STUDENT FEST 2026
                  </span>
                </div>
              </div>

              <p className="text-xs text-white/80 font-medium max-w-sm mb-6">
                Organized by the Student Cabinet. 3 days of high-intensity startup battles, real-time trading simulations, and 40+ dynamic retail stalls.
              </p>
            </div>

            {/* Tag pills */}
            <div className="flex flex-wrap gap-2">
              <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/40 text-white border border-white/10">
                OCTOBER 14–16
              </span>
              <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-lime text-black font-bold">
                6 TRACKS
              </span>
              <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#FF5A36] text-white">
                ₹1L+ POOL
              </span>
            </div>
          </div>

          {/* Column 2: Event Tracks Links */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-brand-lime mb-4">
              EVENT TRACKS
            </h4>
            <ul className="space-y-2.5 text-xs font-bold uppercase tracking-wider text-white/90">
              <li>
                <Link href="#events" className="hover:text-brand-lime transition-colors">
                  Startup Roulette
                </Link>
              </li>
              <li>
                <Link href="#events" className="hover:text-brand-lime transition-colors">
                  Bay Area Stalls
                </Link>
              </li>
              <li>
                <Link href="#events" className="hover:text-brand-lime transition-colors">
                  The War Room
                </Link>
              </li>
              <li>
                <Link href="#events" className="hover:text-brand-lime transition-colors">
                  The Boardroom
                </Link>
              </li>
              <li>
                <Link href="#events" className="hover:text-brand-lime transition-colors">
                  Entre-Prenormie
                </Link>
              </li>
              <li>
                <Link href="#events" className="hover:text-brand-lime transition-colors">
                  Bulls & Bears
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Navigation & Admin */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-black uppercase tracking-widest text-brand-lime mb-4">
              EXPLORE
            </h4>
            <ul className="space-y-2.5 text-xs font-bold uppercase tracking-wider text-white/90">
              <li>
                <Link href="#overview" className="hover:text-brand-lime transition-colors">
                  Overview
                </Link>
              </li>
              <li>
                <Link href="#timeline" className="hover:text-brand-lime transition-colors">
                  3-Day Schedule
                </Link>
              </li>
              <li>
                <Link href="#leaderboard" className="hover:text-brand-lime transition-colors">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link href="#sponsors" className="hover:text-brand-lime transition-colors">
                  Sponsors
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-brand-lime transition-colors">
                  Registration
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-white/60 hover:text-white flex items-center gap-1 transition-colors">
                  <Layers className="w-3 h-3" />
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Countdown & Quick Action */}
          <div className="lg:col-span-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/70">
                  FEST COUNTDOWN
                </span>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black text-brand-lime hover:bg-white hover:text-black text-[10px] font-black uppercase tracking-wider transition-colors"
                >
                  <span>JOIN NOW</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="p-4 bg-black/40 rounded-2xl border border-white/10">
                <CountdownWidget />
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2 mt-6">
              {[
                { name: "X (Twitter)", letter: "X" },
                { name: "Discord", letter: "D" },
                { name: "Instagram", letter: "I" },
                { name: "LinkedIn", letter: "L" },
              ].map((item, idx) => (
                <button
                  key={idx}
                  aria-label={item.name}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white hover:text-brand-violet flex items-center justify-center text-xs font-bold transition-colors text-white"
                >
                  {item.letter}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-white/70">
          <div>
            © 2026 CABINET VALLEY. ALL RIGHTS RESERVED. ORGANIZED BY THE STUDENT CABINET.
          </div>
          <div className="flex items-center gap-6 text-[11px] font-bold uppercase tracking-wider text-white/80">
            <span>TERMS & RULES</span>
            <span>CODE OF CONDUCT</span>
            <span>PRIVACY</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
