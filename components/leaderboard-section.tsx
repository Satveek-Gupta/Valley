"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TrendingUp, ArrowUpRight, Trophy, Zap, ShieldAlert, Award } from "lucide-react";
import CountdownWidget from "@/components/countdown-widget";
import AnimatedGridPattern from "@/components/magicui/animated-grid-pattern";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface LeaderboardPlayer {
  rank: number;
  name: string;
  handle: string;
  score: number;
  portfolio: string;
  change?: string;
  badge?: string;
}

export default function LeaderboardSection() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLeaderboard() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from("leaderboard")
            .select("rank, player_name, handle, score, portfolio_value")
            .order("score", { ascending: false });

          if (!error && data && data.length > 0) {
            setLeaderboard(
              data.map((item: any, idx: number) => ({
                rank: item.rank || idx + 1,
                name: item.player_name,
                handle: item.handle,
                score: item.score,
                portfolio: `₹${Number(item.portfolio_value).toLocaleString("en-IN")}`,
                badge: idx === 0 ? "Alpha Trader" : "Market Participant",
              }))
            );
          }
        } catch (e) {
          console.error("Leaderboard fetch error", e);
        }
      }
      setIsLoading(false);
    }

    loadLeaderboard();
  }, []);

  const topPlayer = leaderboard[0];

  return (
    <section id="leaderboard" className="relative w-full py-16 sm:py-24 bg-white border-b border-brand-ink/10 overflow-hidden">
      <AnimatedGridPattern
        numSquares={35}
        maxOpacity={0.12}
        duration={3.5}
        repeatDelay={1}
        className="[mask-image:radial-gradient(650px_circle_at_center,white,transparent)] inset-0 text-brand-violet"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-lime bg-black px-3 py-1 rounded-full w-fit mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>LIVE TRADING ARENA</span>
            </div>
            <h2 className="font-display text-4xl sm:text-6xl font-black uppercase tracking-wide text-brand-ink">
              BULLS & BEARS
              <span className="block text-2xl sm:text-3xl text-brand-violet font-display tracking-wide mt-1">
                REAL-TIME TRADER LEADERBOARD
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <CountdownWidget compact={true} />
          </div>
        </div>

        {/* Dynamic Leaderboard Display */}
        {leaderboard.length > 0 ? (
          <>
            {/* Big Top Player Featured Row */}
            {topPlayer && (
              <div className="mb-6">
                <div className="w-full bg-brand-violet text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-4 sm:gap-6">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-brand-lime text-black flex items-center justify-center font-display text-3xl font-black shadow-lg">
                        #1
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black uppercase tracking-widest text-brand-lime">
                            LEADER OF THE BOARD
                          </span>
                          {topPlayer.badge && (
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/20">
                              {topPlayer.badge}
                            </span>
                          )}
                        </div>
                        <h3 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-wide text-white mt-1">
                          {topPlayer.name}
                        </h3>
                        <p className="text-xs font-mono font-bold text-white/70">{topPlayer.handle}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 sm:gap-10 border-t md:border-t-0 md:border-l border-white/20 pt-4 md:pt-0 md:pl-8">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-white/70 font-bold">SCORE</div>
                        <div className="font-display text-3xl sm:text-4xl font-black text-brand-lime">
                          {topPlayer.score} PTS
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-white/70 font-bold">PORTFOLIO</div>
                        <div className="font-display text-2xl sm:text-3xl font-black text-white">
                          {topPlayer.portfolio}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Secondary Runner-Up List Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {leaderboard.slice(1).map((player) => (
                <div
                  key={player.handle || player.rank}
                  className="bg-brand-surface border-2 border-brand-ink/10 rounded-2xl p-4 sm:p-5 flex items-center justify-between hover:border-brand-ink/40 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-ink text-white flex items-center justify-center font-display text-lg font-bold">
                      #{player.rank}
                    </div>
                    <div>
                      <h4 className="font-display text-lg font-bold uppercase text-brand-ink leading-tight">
                        {player.name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono font-semibold">
                        <span>{player.handle}</span>
                        {player.change && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-600 font-bold">{player.change}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-display text-xl font-black text-brand-violet">
                      {player.score} PTS
                    </div>
                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      {player.portfolio}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Live Standby Card when no tournament matches are logged yet */
          <div className="bg-brand-surface border-2 border-brand-ink/10 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="max-w-xl mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-brand-violet text-white mx-auto flex items-center justify-center shadow-lg shadow-brand-violet/20">
                <Trophy className="w-8 h-8 text-brand-lime" />
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-black uppercase text-brand-ink">
                LIVE ARENA INITIALIZING
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 font-medium">
                The Bulls & Bears dynamic trading leaderboard will go live on <strong>Day 3 (October 16, 2026)</strong> at Terminal Lab 1. Individual participants will battle across real-time market shocks and equity simulations.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>REGISTRATIONS OPEN FOR TRADERS</span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom CTA for Bulls & Bears */}
        <div className="mt-8 p-6 bg-brand-lime text-black rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 border-2 border-brand-ink">
          <div>
            <h4 className="font-display text-2xl font-black uppercase tracking-wide">
              WANT TO COMPETE ON THE CABINET TRADING FLOOR?
            </h4>
            <p className="text-xs font-bold uppercase tracking-wider text-black/80">
              Day 3 · Individual Participation · Speed Quiz & Trading Simulation
            </p>
          </div>
          <Link
            href="/register?event=bulls-and-bears"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-black text-white hover:bg-brand-violet text-xs font-black uppercase tracking-wider transition-all flex-shrink-0"
          >
            <span>JOIN BULLS & BEARS</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
