"use client";

import { useState } from "react";
import { Play, Sparkles, X, Volume2 } from "lucide-react";
import AnimatedGridPattern from "@/components/magicui/animated-grid-pattern";

export default function SpotlightSection() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="relative w-full bg-brand-violet text-white py-20 sm:py-28 overflow-hidden">
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.12}
        duration={4}
        repeatDelay={1}
        className="[mask-image:radial-gradient(600px_circle_at_center,white,transparent)] inset-0 text-white"
      />
      
      {/* Background Ghosted Typography */}
      <div className="absolute inset-0 select-none pointer-events-none flex flex-col justify-center items-center opacity-15 overflow-hidden">
        <span className="font-display text-8xl sm:text-[160px] lg:text-[220px] font-black uppercase tracking-wide leading-none text-white whitespace-nowrap">
          FOUNDERS • CREATORS
        </span>
        <span className="font-display text-8xl sm:text-[160px] lg:text-[220px] font-black uppercase tracking-wide leading-none text-white whitespace-nowrap">
          CABINET VALLEY
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Headline */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 border border-white/20 text-brand-lime text-xs font-black uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>EXCLUSIVE SPOTLIGHT</span>
          </div>
          <h2 className="font-display text-4xl sm:text-7xl font-black uppercase tracking-wide leading-none text-white">
            THE VALLEY MOMENT
          </h2>
          <p className="mt-3 text-sm sm:text-base font-semibold text-white/80 max-w-xl mx-auto uppercase tracking-wide">
            Where breakthrough ideas meet relentless execution. 3 days of electric pitches, live auctions, and closed-door founder dialogues.
          </p>
        </div>

        {/* Centered Video / Media Spotlight Card */}
        <div className="flex justify-center">
          <div
            onClick={() => setIsPlaying(true)}
            className="group cursor-pointer relative w-full max-w-md sm:max-w-lg aspect-[4/5] sm:aspect-[16/10] rounded-3xl overflow-hidden bg-black border-4 border-white/30 shadow-2xl shadow-black/40 transition-transform duration-300 hover:scale-[1.02]"
          >
            {/* Background Image / Visual */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80')",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            </div>

            {/* Centered Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white text-brand-violet flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-brand-lime group-hover:text-black transition-all">
                <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current ml-1" />
              </div>
            </div>

            {/* Bottom Overlay Label */}
            <div className="absolute bottom-0 inset-x-0 p-6 flex items-end justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-lime block mb-1">
                  OFFICIAL TEASER
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-black uppercase text-white leading-none">
                  ARE YOU READY TO COMPETE?
                </h3>
              </div>
              <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                <Volume2 className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Video Modal Preview */}
      {isPlaying && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl">
            <button
              onClick={() => setIsPlaying(false)}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/20 hover:bg-white text-white hover:text-black flex items-center justify-center transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-gradient-to-br from-brand-violet-dark to-black text-white">
              <Sparkles className="w-12 h-12 text-brand-lime mb-4 animate-bounce" />
              <h4 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-wide">
                CABINET VALLEY 2026
              </h4>
              <p className="mt-2 text-sm text-zinc-300 font-bold uppercase tracking-wider max-w-md">
                Experience the 3-day arena. Live pitches, 50+ Bay Area stalls, and founder mentorship.
              </p>
              <button
                onClick={() => setIsPlaying(false)}
                className="mt-6 px-6 py-2.5 rounded-full bg-brand-lime text-black font-black text-xs uppercase tracking-wider hover:bg-white transition-colors"
              >
                RETURN TO FEST SITE
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
