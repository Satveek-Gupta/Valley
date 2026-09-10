"use client";

import { STATS_METRICS } from "@/lib/mock-data";

export default function StatsBand() {
  return (
    <section className="w-full bg-brand-ink text-white py-10 sm:py-14 border-y-4 border-brand-violet">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-4 items-center justify-between text-center">
          {STATS_METRICS.map((stat, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl transition-all ${
                stat.highlight
                  ? "bg-brand-violet text-white ring-2 ring-brand-violet-light/50 shadow-lg shadow-brand-violet/20"
                  : "bg-white/5 hover:bg-white/10"
              }`}
            >
              <div
                className={`font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-wide leading-none ${
                  stat.highlight ? "text-brand-lime" : "text-white"
                }`}
              >
                {stat.value}
              </div>
              <div className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-zinc-400 mt-2">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
