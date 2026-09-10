"use client";

import Link from "next/link";
import { ArrowUpRight, Sparkles, TrendingUp, Store, Users, Swords, Briefcase } from "lucide-react";
import CountdownWidget from "@/components/countdown-widget";
import AnimatedGridPattern from "@/components/magicui/animated-grid-pattern";

export default function Hero() {
  return (
    <section id="overview" className="relative w-full pt-6 sm:pt-10 pb-16 sm:pb-24 overflow-hidden bg-white">
      {/* Background Animated Grid Pattern */}
      <AnimatedGridPattern
        numSquares={40}
        maxOpacity={0.15}
        duration={3}
        repeatDelay={1}
        className="[mask-image:radial-gradient(700px_circle_at_center,white,transparent)] inset-x-0 inset-y-[-20%] h-[140%] text-brand-violet"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Header Row: Main Wordmark & Floating Violet Countdown Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Stacked Oversized Hero Wordmark */}
          <div className="lg:col-span-7 flex flex-col justify-start">
            
            {/* Ghosted repeat line for depth */}
            {/* <div className="select-none pointer-events-none -mb-3 sm:-mb-6 overflow-hidden">
              <span className="font-display text-4xl sm:text-7xl lg:text-8xl font-black tracking-tightest ghost-text block uppercase opacity-40">
                STUDENT CABINET
              </span>
            </div> */}

            {/* Giant Stacked Title */}
            <div className="relative z-10 flex flex-col">
              <h1 className="font-display font-black uppercase text-brand-ink flex flex-col space-y-1 sm:space-y-2">
                <span className="text-6xl sm:text-8xl lg:text-[108px] leading-none tracking-normal">
                  CABINET
                </span>
                <span className="text-6xl sm:text-8xl lg:text-[108px] leading-none tracking-normal flex items-baseline">
                  VALLEY
                  <span className="text-2xl sm:text-4xl lg:text-5xl text-brand-violet ml-2 sm:ml-3 align-super font-mono font-bold">®</span>
                </span>
                <span className="text-5xl sm:text-7xl lg:text-[96px] leading-none tracking-wider text-brand-ink/90">
                  2026
                </span>
              </h1>
            </div>
          </div>

          {/* Right Column: Floating Electric Violet Card */}
          <div className="lg:col-span-5 flex flex-col justify-start">
            <div className="w-full bg-brand-violet text-white rounded-3xl p-6 sm:p-7 shadow-xl shadow-brand-violet/25 relative overflow-hidden border border-brand-violet-light/30">
              
              {/* Card Top Row: Mini Metrics & Fast Register Button */}
              <div className="flex items-center justify-between pb-6 border-b border-white/20">
                <div className="flex items-center gap-4 sm:gap-6 font-mono text-center">
                  <div>
                    <div className="font-display text-2xl sm:text-3xl font-bold leading-none">3</div>
                    <div className="text-[9px] uppercase tracking-wider text-white/70 mt-1 font-bold">DAYS</div>
                  </div>
                  <div className="w-px h-8 bg-white/20" />
                  <div>
                    <div className="font-display text-2xl sm:text-3xl font-bold leading-none">6</div>
                    <div className="text-[9px] uppercase tracking-wider text-white/70 mt-1 font-bold">EVENTS</div>
                  </div>
                  <div className="w-px h-8 bg-white/20" />
                  <div>
                    <div className="font-display text-2xl sm:text-3xl font-bold leading-none">40+</div>
                    <div className="text-[9px] uppercase tracking-wider text-white/70 mt-1 font-bold">STALLS</div>
                  </div>
                </div>

                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black text-white hover:bg-brand-lime hover:text-black transition-all text-xs font-black uppercase tracking-wider group"
                >
                  <span>REGISTER</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>

              {/* Card Bottom Row: Live Countdown Widget */}
              <div className="pt-5">
                <CountdownWidget />
              </div>
            </div>

            {/* Social Channels Row */}
            <div className="flex items-center justify-end gap-3 mt-4 pt-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mr-1">FOLLOW CV</span>
              {[
                { name: "X (Twitter)", letter: "X" },
                { name: "Discord", letter: "D" },
                { name: "Instagram", letter: "I" },
                { name: "LinkedIn", letter: "L" },
              ].map((soc, i) => (
                <button
                  key={i}
                  aria-label={soc.name}
                  className="w-8 h-8 rounded-full bg-brand-surface border border-brand-border text-brand-ink text-xs font-black flex items-center justify-center hover:bg-brand-ink hover:text-white transition-colors"
                >
                  {soc.letter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Row: Event Pill Tags */}
        <div className="mt-12 sm:mt-16 pt-6 border-t-2 border-brand-ink/10 flex flex-wrap items-center gap-2.5 sm:gap-3">
          <span className="text-xs font-black uppercase tracking-widest text-zinc-400 mr-2">TRACKS:</span>
          
          <Link href="#events" className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FF5A36] text-white text-xs font-black uppercase tracking-wide hover:scale-105 transition-transform">
            <Sparkles className="w-3.5 h-3.5" />
            STARTUP ROULETTE
          </Link>

          <Link href="#events" className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-violet text-white text-xs font-black uppercase tracking-wide hover:scale-105 transition-transform">
            <Store className="w-3.5 h-3.5" />
            BAY AREA STALLS
          </Link>

          <Link href="#events" className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#2F6FED] text-white text-xs font-black uppercase tracking-wide hover:scale-105 transition-transform">
            <Swords className="w-3.5 h-3.5" />
            THE WAR ROOM
          </Link>

          <Link href="#events" className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FF5A36] text-white text-xs font-black uppercase tracking-wide hover:scale-105 transition-transform">
            <Briefcase className="w-3.5 h-3.5" />
            THE BOARDROOM
          </Link>

          <Link href="#events" className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-violet text-white text-xs font-black uppercase tracking-wide hover:scale-105 transition-transform">
            <Users className="w-3.5 h-3.5" />
            ENTRE-PRENORMIE
          </Link>

          <Link href="#events" className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-lime text-black text-xs font-black uppercase tracking-wide hover:scale-105 transition-transform">
            <TrendingUp className="w-3.5 h-3.5" />
            BULLS & BEARS
          </Link>
        </div>

        {/* Bottom Hero Manifesto Line */}
        <div className="mt-8 max-w-4xl">
          <p className="font-display text-2xl sm:text-3xl lg:text-4xl uppercase tracking-wide text-brand-ink leading-snug">
            CABINET VALLEY® BRINGS TOGETHER{" "}
            <span className="text-brand-violet underline decoration-wavy decoration-2">FOUNDERS</span>,{" "}
            <span className="text-[#FF5A36]">CREATORS</span>,{" "}
            <span className="text-[#2F6FED]">BUILDERS</span>,{" "}
            <span className="text-brand-lime bg-black px-2 py-0.5 rounded-lg inline-block">TRADERS</span>, AND{" "}
            <span className="text-brand-violet">COMMUNITIES</span> FOR THREE DAYS OF SHOWCASES, COMPETITIONS, AND RECOGNITION.
          </p>
        </div>

      </div>
    </section>
  );
}
