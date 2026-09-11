"use client";

import { Award, Briefcase, Sparkles, Trophy } from "lucide-react";
import { SPONSORS_LIST, PRIZE_HIGHLIGHTS } from "@/lib/mock-data";
import AnimatedGridPattern from "@/components/magicui/animated-grid-pattern";

export default function SponsorsPrizes() {
  return (
    <section id="sponsors" className="relative w-full py-16 sm:py-24 bg-white border-b border-brand-ink/10 overflow-hidden">
      <AnimatedGridPattern
        numSquares={35}
        maxOpacity={0.12}
        duration={3.5}
        repeatDelay={1}
        className="[mask-image:radial-gradient(650px_circle_at_center,white,transparent)] inset-0 text-brand-violet"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 relative z-10">
        
        {/* Section Header: Prizes */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-violet/10 text-brand-violet text-xs font-black uppercase tracking-widest mb-3">
            <Trophy className="w-3.5 h-3.5" />
            <span>STAKES & REWARDS</span>
          </div>
          <h2 className="font-display text-4xl sm:text-6xl font-black uppercase tracking-wide text-brand-ink">
            ₹1,00,000+ PRIZE POOL
            <span className="block text-2xl sm:text-3xl text-brand-violet font-display tracking-wide mt-1">
              & FOUNDER INTERNSHIPS
            </span>
          </h2>
        </div>

        {/* Prize Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRIZE_HIGHLIGHTS.map((prize, idx) => (
            <div
              key={idx}
              className="bg-white border-2 border-brand-ink/10 hover:border-brand-ink/50 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-lg hover:shadow-xl transition-all"
            >
              <div>
                <span
                  className="inline-block px-3 py-1 rounded-full text-white text-[10px] font-black uppercase tracking-wider mb-4"
                  style={{ backgroundColor: prize.badgeColor }}
                >
                  {prize.category}
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-wide text-brand-ink mb-2">
                  {prize.title}
                </h3>
                <div className="text-xs font-black text-brand-violet uppercase tracking-wider mb-3">
                  {prize.highlight}
                </div>
                <p className="text-xs text-zinc-600 font-medium">{prize.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-brand-ink">
                <span>OFFICIAL FEST AWARD</span>
                <Award className="w-4 h-4 text-brand-violet" />
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Sponsors Continuous Marquee */}
      <div className="w-full bg-brand-ink text-white py-10 border-y-2 border-brand-ink">
        <div className="text-center mb-6">
          <span className="text-xs font-black uppercase tracking-widest text-brand-lime">
            POWERED BY OUR INDUSTRY & VENTURE PARTNERS
          </span>
        </div>

        <div className="flex overflow-x-hidden no-scrollbar select-none">
          <div className="flex items-center gap-8 sm:gap-12 animate-marquee whitespace-nowrap">
            {[...SPONSORS_LIST, ...SPONSORS_LIST].map((sponsor, i) => (
              <div
                key={i}
                className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/15 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-brand-lime" />
                <span className="font-display text-xl sm:text-2xl font-black uppercase tracking-wide text-white">
                  {sponsor.name}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-brand-violet text-white">
                  {sponsor.tier}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
