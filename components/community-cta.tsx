"use client";

import Link from "next/link";
import { ArrowUpRight, Users, Sparkles } from "lucide-react";
import AnimatedGridPattern from "@/components/magicui/animated-grid-pattern";

export default function CommunityCTA() {
  return (
    <section className="relative w-full py-20 sm:py-28 bg-white text-brand-ink text-center overflow-hidden border-b border-brand-ink/10">
      <AnimatedGridPattern
        numSquares={35}
        maxOpacity={0.12}
        duration={3.5}
        repeatDelay={1}
        className="[mask-image:radial-gradient(600px_circle_at_center,white,transparent)] inset-0 text-brand-violet"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Center Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-brand-violet text-white flex items-center justify-center shadow-xl shadow-brand-violet/30 hover:rotate-6 transition-transform">
            <Users className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
        </div>

        {/* Big Bold Headline */}
        <h2 className="font-display text-4xl sm:text-7xl lg:text-8xl font-black uppercase tracking-wide leading-none text-brand-ink mb-6 space-y-2">
          <span className="block">BE PART OF</span>
          <span className="block text-brand-violet">THE VALLEY</span>
        </h2>

        <p className="text-sm sm:text-base font-semibold text-zinc-600 max-w-xl mx-auto uppercase tracking-wide mb-10">
          Whether pitching your first startup, bidding in the war room, or competing on the trading floor — your stage is ready.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-center">
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full bg-brand-ink hover:bg-brand-violet text-white font-black text-sm uppercase tracking-wider shadow-xl transition-all transform hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-brand-lime" />
            <span>REGISTER FOR EVENTS</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
