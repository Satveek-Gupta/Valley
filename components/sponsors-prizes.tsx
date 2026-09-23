"use client";

import { useState, useEffect } from "react";
import { Award, Sparkles, Trophy } from "lucide-react";
import AnimatedGridPattern from "@/components/magicui/animated-grid-pattern";

export default function SponsorsPrizes() {
  const [sponsors, setSponsors] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/sponsors")
      .then((res) => res.json())
      .then((data) => {
        if (data.sponsors && Array.isArray(data.sponsors)) {
          setSponsors(data.sponsors);
        }
      })
      .catch((err) => console.error("Failed to load dynamic sponsors", err));
  }, []);
  return (
    <section id="sponsors" className="scroll-mt-20 sm:scroll-mt-24 relative w-full py-16 sm:py-24 bg-brand-ink text-white border-y-2 border-white/10 overflow-hidden">
      <AnimatedGridPattern
        numSquares={35}
        maxOpacity={0.15}
        duration={3.5}
        repeatDelay={1}
        className="[mask-image:radial-gradient(650px_circle_at_center,white,transparent)] inset-0 text-brand-violet"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 relative z-10">
        
        {/* Section Header: Prizes */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brand-violet/25 border border-brand-violet/40 text-brand-lime text-xs font-black uppercase tracking-widest mb-4 shadow-sm">
            <Trophy className="w-3.5 h-3.5" />
            <span>OPPORTUNITIES & REWARDS</span>
          </div>
          <h2 className="font-display text-4xl sm:text-6xl font-black uppercase tracking-wide text-white">
            FOUNDER&apos;S OFFICE INTERNSHIPS
            <span className="block text-xl sm:text-3xl text-brand-lime font-display tracking-wide mt-2">
              + OFFICIAL CERTIFICATES & EXCLUSIVE GOODIES
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-zinc-300 font-medium max-w-2xl mx-auto leading-relaxed">
            Compete, pitch, and stand out in front of top founders. Official certificates and festival goodies will be awarded to contenders, with top performers securing direct Founder&apos;s Office placements.
          </p>
        </div>

        {/* Focused Showcase Card */}
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-white/[0.04] backdrop-blur-md border-2 border-white/15 hover:border-brand-lime/50 rounded-3xl p-6 sm:p-10 shadow-2xl transition-all overflow-hidden">
            {/* Background glow effects */}
            <div className="absolute -top-16 -right-16 w-56 h-56 bg-brand-violet/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-brand-orange/15 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full bg-brand-orange text-white text-[11px] font-black uppercase tracking-wider shadow-sm">
                    FLAGSHIP REWARD
                  </span>
                  <span className="px-3 py-1 rounded-full bg-brand-violet/40 border border-brand-violet/50 text-white text-[11px] font-black uppercase tracking-wider">
                    DIRECT PLACEMENT
                  </span>
                </div>

                <h3 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-wide text-white mb-3">
                  Founder&apos;s Office Internships
                </h3>

                <p className="text-sm sm:text-base text-zinc-300 font-medium leading-relaxed mb-6">
                  Standout pitchers and winners earn direct placement inside the Founder&apos;s Office of tier-1 startups, working side-by-side with visionary founders on real-world high-impact execution.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.05] border border-white/10 shadow-inner">
                    <div className="p-2 rounded-xl bg-brand-violet/30 text-brand-lime mt-0.5 border border-brand-violet/40">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-white uppercase tracking-wide">
                        Official Certificates
                      </div>
                      <div className="text-[11px] text-zinc-400 font-medium mt-0.5">
                        Verified credentials awarded for performance & participation
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.05] border border-white/10 shadow-inner">
                    <div className="p-2 rounded-xl bg-brand-orange/20 text-brand-orange mt-0.5 border border-brand-orange/40">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-white uppercase tracking-wide">
                        Exclusive Goodies
                      </div>
                      <div className="text-[11px] text-zinc-400 font-medium mt-0.5">
                        Curated fest merchandise kits & founder crates
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex md:flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-gradient-to-br from-brand-violet to-brand-ink text-white md:w-56 text-center border-2 border-brand-violet-light/30 shadow-xl shadow-brand-violet/25">
                <div className="w-12 h-12 rounded-xl bg-brand-lime flex items-center justify-center text-brand-ink font-black text-xl shadow-md">
                  💼
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-brand-lime">
                    EXECUTIVE TRACK
                  </div>
                  <div className="font-display text-xl font-black uppercase tracking-wide text-white mt-0.5">
                    Direct Tenure
                  </div>
                  <div className="text-[11px] text-zinc-300 font-medium mt-0.5">
                    Live 1-on-1 Mentorship
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Sponsors Continuous Marquee (Only shown when sponsors are added) */}
      {sponsors.length > 0 && (
        <div className="w-full bg-black/40 text-white py-10 border-t-2 border-white/10">
          <div className="text-center mb-6">
            <span className="text-xs font-black uppercase tracking-widest text-brand-lime">
              POWERED BY OUR INDUSTRY & VENTURE PARTNERS
            </span>
          </div>

          <div className="flex overflow-x-hidden no-scrollbar select-none">
            <div className="flex items-center gap-8 sm:gap-12 animate-marquee whitespace-nowrap">
              {[...sponsors, ...sponsors].map((sponsor, i) => (
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
      )}
    </section>
  );
}
