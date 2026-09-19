"use client";

import Link from "next/link";
import { ArrowUpRight, Calendar, Sparkles, MapPin, Clock } from "lucide-react";
import { TIMELINE_SCHEDULE } from "@/lib/mock-data";
import AnimatedGridPattern from "@/components/magicui/animated-grid-pattern";

export default function TimelineBento() {
  return (
    <section id="timeline" className="relative w-full py-16 sm:py-24 bg-[#F8F8F8] border-b border-brand-ink/10 overflow-hidden">
      <AnimatedGridPattern
        numSquares={40}
        maxOpacity={0.12}
        duration={3.5}
        repeatDelay={1}
        className="[mask-image:radial-gradient(700px_circle_at_center,white,transparent)] inset-0 text-brand-violet"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-violet mb-2">
              <Calendar className="w-4 h-4" />
              <span>THE 3-DAY MASTER SCHEDULE</span>
            </div>
            <h2 className="font-display text-4xl sm:text-7xl font-black uppercase tracking-wide text-brand-ink">
              THE ROAD TO
              <span className="block text-brand-violet">CABINET VALLEY</span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-4 py-1.5 rounded-full bg-brand-ink text-white font-mono text-xs font-bold uppercase tracking-wider">
              3 DAYS EVENT
            </span>
          </div>
        </div>

        {/* Bento Grid Layout (Inspired by the Reference's Date Bento Tiles) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          
          {/* Bento Item 1: Large Featured Violet Card (Day 1 Bay Area & Startup Roulette) */}
          <div className="md:col-span-7 bg-brand-violet text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl shadow-brand-violet/20 relative overflow-hidden group">
            
            {/* Top Row: Event Category & Big Date */}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full bg-white/20 text-brand-lime text-xs font-black uppercase tracking-wider">
                  Bay Area: The Student Marketplace
                </span>
                <span className="font-mono text-xs font-bold text-white/80">SEPTEMBER 24, 2026</span>
              </div>

              <h3 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-wide text-white mb-3">
                DAY 01 — BAY AREA & STARTUP ROULETTE
              </h3>

              <p className="text-xs sm:text-sm text-white/90 font-medium max-w-lg mb-6">
                Turn your ideas into business! Set up your own stall at Cabinet Valley 1.0 and sell anything from products to creative services.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <div className="p-3.5 bg-black/20 rounded-2xl border border-white/10">
                  <div className="text-[10px] font-black uppercase tracking-wider text-brand-lime">
                    BAY AREA (NEAR C5 & D5 HOSTELS)
                  </div>
                  <div className="text-xs font-bold text-white mt-0.5">10:00 AM – 6:00 PM</div>
                  {/* <div className="text-[11px] text-white/70">50 Stalls · Offline Desk Booking</div> */}
                </div>


                <div className="p-3.5 bg-black/20 rounded-2xl border border-white/10">
                  <div className="text-[10px] font-black uppercase tracking-wider text-[#FF5A36]">
                    STARTUP ROULETTE (3 RDS)
                  </div>
                  <div className="text-xs font-bold text-white mt-0.5">6:30 PM Onwards</div>
                  {/* <div className="text-[11px] text-white/70">Main Auditorium · 12 Teams</div> */}
                </div>
              </div>
            </div>

            {/* Bottom: Big Date Number & Link Action */}
            <div className="flex items-end justify-between pt-4 border-t border-white/20 relative z-10">
              <div className="font-display text-5xl sm:text-7xl font-black tracking-wider leading-none text-white">
                01
              </div>

              <Link
                href="/register?event=startup-roulette"
                className="w-12 h-12 rounded-full bg-white text-brand-violet flex items-center justify-center group-hover:bg-brand-lime group-hover:text-black transition-all shadow-lg"
              >
                <ArrowUpRight className="w-6 h-6" />
              </Link>
            </div>
          </div>

          {/* Bento Item 2: The War Room Card (Day 2) */}
          <div className="md:col-span-5 bg-white border-2 border-brand-ink/10 hover:border-brand-ink/40 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full bg-[#2F6FED] text-white text-xs font-black uppercase tracking-wider">
                  DAY 02 · BIDDING
                </span>
                <span className="font-mono text-xs font-bold text-zinc-400">SEP 25</span>
              </div>

              <h3 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-wide text-brand-ink mb-2">
                THE WAR ROOM
              </h3>

              <p className="text-xs text-zinc-600 font-medium mb-4">
                Points auction strategy: mystery assets bidding in Round 1, followed by intense high-speed jury pitching in Round 2.
              </p>

              <div className="space-y-2 text-xs font-bold text-brand-ink mb-6">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-brand-violet" />
                  <span>11:00 AM – 3:30 PM</span>
                </div>
                {/* <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-brand-violet" />
                  <span>Strategy Arena - Hall B</span>
                </div> */}
              </div>
            </div>

            <div className="flex items-end justify-between pt-4 border-t border-zinc-200">
              <div className="font-display text-5xl sm:text-6xl font-black tracking-wider leading-none text-brand-ink">
                02
              </div>
              <Link
                href="/register?event=the-war-room"
                className="w-10 h-10 rounded-full bg-brand-surface border border-brand-border text-brand-ink hover:bg-brand-ink hover:text-white flex items-center justify-center transition-all"
              >
                <ArrowUpRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Bento Item 3: The Boardroom Card (Day 2) */}
          <div className="md:col-span-4 bg-white border-2 border-brand-ink/10 hover:border-brand-ink/40 rounded-3xl p-6 flex flex-col justify-between transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 rounded-full bg-[#FF5A36] text-white text-xs font-black uppercase tracking-wider">
                  DAY 02 · CASE STUDY
                </span>
                <span className="font-mono text-xs font-bold text-zinc-400">SEP 25</span>
              </div>

              <h3 className="font-display text-2xl font-black uppercase text-brand-ink mb-2">
                THE BOARDROOM
              </h3>

              <p className="text-xs text-zinc-600 font-medium mb-4">
                Duo executive crisis resolution. 90-minute case crack followed by turnaround presentation.
              </p>
            </div>

            <div className="flex items-end justify-between pt-4 border-t border-zinc-200">
              <div className="font-display text-4xl sm:text-5xl font-black text-brand-ink">02</div>
              <Link
                href="/register?event=the-boardroom"
                className="w-10 h-10 rounded-full bg-brand-surface border border-brand-border hover:bg-brand-ink hover:text-white flex items-center justify-center transition-colors"
              >
                <ArrowUpRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Bento Item 4: Entre-Prenormie Card (Day 3) */}
          <div className="md:col-span-4 bg-white border-2 border-brand-ink/10 hover:border-brand-ink/40 rounded-3xl p-6 flex flex-col justify-between transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 rounded-full bg-brand-violet text-white text-xs font-black uppercase tracking-wider">
                  DAY 03 · 1-TO-1 SESSIONS
                </span>
                <span className="font-mono text-xs font-bold text-zinc-400">SEP 26</span>
              </div>

              <h3 className="font-display text-2xl font-black uppercase text-brand-ink mb-2">
                ENTREPRE-NORMIE
              </h3>

              <p className="text-xs text-zinc-600 font-medium mb-4">
                Direct closed-door founder dialogues. Career mentorship, idea tearing, and venture guidance.
              </p>
            </div>

            <div className="flex items-end justify-between pt-4 border-t border-zinc-200">
              <div className="font-display text-4xl sm:text-5xl font-black text-brand-ink">03</div>
              <Link
                href="/register?event=entre-prenormie"
                className="w-10 h-10 rounded-full bg-brand-surface border border-brand-border hover:bg-brand-ink hover:text-white flex items-center justify-center transition-colors"
              >
                <ArrowUpRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Bento Item 5: Bulls & Bears + Rewarding Finale (Day 3) */}
          <div className="md:col-span-4 bg-brand-ink text-white rounded-3xl p-6 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 rounded-full bg-brand-lime text-black text-xs font-black uppercase tracking-wider">
                  DAY 03 · FINALE
                </span>
                <span className="font-mono text-xs font-bold text-zinc-400">SEP 26</span>
              </div>

              <h3 className="font-display text-2xl font-black uppercase text-white mb-2">
                Bulls & Bears
              </h3>

              <p className="text-xs text-zinc-300 font-medium mb-4">
                Bulls & Bears trading climax, followed by the Grand Rewarding Ceremony & Internship reveals.
              </p>
            </div>

            <div className="flex items-end justify-between pt-4 border-t border-white/20">
              <div className="font-display text-4xl sm:text-5xl font-black text-brand-lime">03</div>
              <Link
                href="/register?event=bulls-and-bears"
                className="w-10 h-10 rounded-full bg-brand-violet text-white hover:bg-white hover:text-brand-ink flex items-center justify-center transition-colors"
              >
                <ArrowUpRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
