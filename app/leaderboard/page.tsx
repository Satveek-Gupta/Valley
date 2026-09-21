"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import {
  TrendingUp,
  ArrowUpRight,
  Trophy,
  Zap,
  Award,
  Sparkles,
  Search,
  Users,
  Clock,
  ShieldCheck,
  RefreshCw,
  Flame,
  ArrowLeft,
} from "lucide-react";
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

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setIsLoading(true);
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
              badge: idx === 0 ? "Alpha Trader" : idx < 3 ? "Top 3 Pro" : "Floor Trader",
            }))
          );
        }
      } catch (e) {
        console.error("Leaderboard fetch error", e);
      }
    }
    setIsLoading(false);
  };

  const filteredPlayers = leaderboard.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.handle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const topPlayer = leaderboard[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F4F6] text-brand-ink">
      <Navbar />

      <main className="flex-1">
        {/* Header Hero Section */}
        <section className="relative w-full bg-brand-ink text-white py-16 sm:py-24 border-b border-brand-ink/10 overflow-hidden">
          <AnimatedGridPattern
            numSquares={40}
            maxOpacity={0.15}
            duration={3}
            repeatDelay={1}
            className="[mask-image:radial-gradient(650px_circle_at_center,white,transparent)] inset-0 text-brand-lime"
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Breadcrumb / Back button */}
            <div className="mb-6">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Festival HQ</span>
              </Link>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-lime bg-white/10 px-3.5 py-1.5 rounded-full mb-4">
                  <TrendingUp className="w-4 h-4" />
                  <span>DAY 03 · LIVE TRADING ARENA</span>
                </div>
                <h1 className="font-display text-4xl sm:text-7xl font-black uppercase tracking-tight text-white leading-none">
                  BULLS & BEARS
                </h1>
                <p className="mt-3 text-sm sm:text-base text-zinc-300 font-semibold uppercase tracking-wide max-w-xl">
                  Real-time stock market simulation, ticker movements, and high-frequency equity trading rankings.
                </p>
              </div>

              {/* Countdown & Quick Action */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <CountdownWidget compact={false} />
                <Link
                  href="/register?event=bulls-and-bears"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-brand-lime text-black hover:bg-white font-black text-xs uppercase tracking-wider transition-all shadow-xl"
                >
                  <span>JOIN COMPETITION</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Quick KPI Stats Band */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10 pt-8 border-t border-white/10">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] font-mono uppercase text-zinc-400">VENUE</span>
                <div className="font-display text-lg sm:text-xl font-bold text-white mt-0.5">
                  301 ALH
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] font-mono uppercase text-zinc-400">FORMAT</span>
                <div className="font-display text-lg sm:text-xl font-bold text-brand-lime mt-0.5">
                  Quiz & Live Sim
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] font-mono uppercase text-zinc-400">TIMING</span>
                <div className="font-display text-lg sm:text-xl font-bold text-white mt-0.5">
                  Day 3 · 1:30 PM
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] font-mono uppercase text-zinc-400">PARTICIPATION</span>
                <div className="font-display text-lg sm:text-xl font-bold text-white mt-0.5">
                  Individual Only
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Area */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          
          {/* Active Leaderboard or Live Standby */}
          {leaderboard.length > 0 ? (
            <div className="space-y-6">
              
              {/* Search & Refresh Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search trader by name or handle..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-violet"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-zinc-500">
                    {filteredPlayers.length} TRADERS RANKED
                  </span>
                  <button
                    onClick={loadLeaderboard}
                    disabled={isLoading}
                    className="p-2.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-600 transition-colors"
                    title="Refresh rankings"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>

              {/* #1 Featured Player Banner */}
              {topPlayer && !searchQuery && (
                <div className="w-full bg-brand-violet text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-4 sm:gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-brand-lime text-black flex items-center justify-center font-display text-3xl font-black shadow-lg">
                        #1
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black uppercase tracking-widest text-brand-lime">
                            CURRENT ALPHA TRADER
                          </span>
                          <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-white/20">
                            {topPlayer.badge}
                          </span>
                        </div>
                        <h2 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-wide text-white mt-1">
                          {topPlayer.name}
                        </h2>
                        <p className="text-xs font-mono font-bold text-white/70">{topPlayer.handle}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8 border-t md:border-t-0 md:border-l border-white/20 pt-4 md:pt-0 md:pl-8">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-white/70 font-bold">TOTAL SCORE</div>
                        <div className="font-display text-3xl sm:text-4xl font-black text-brand-lime">
                          {topPlayer.score} PTS
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-white/70 font-bold">PORTFOLIO VALUATION</div>
                        <div className="font-display text-2xl sm:text-3xl font-black text-white">
                          {topPlayer.portfolio}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Full Standings Table */}
              <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-zinc-50 border-b border-zinc-200 text-[10px] font-black uppercase tracking-wider text-zinc-500">
                      <tr>
                        <th className="py-3.5 px-4 sm:px-6">RANK</th>
                        <th className="py-3.5 px-4 sm:px-6">TRADER</th>
                        <th className="py-3.5 px-4 sm:px-6">TIER / BADGE</th>
                        <th className="py-3.5 px-4 sm:px-6 text-right">SCORE</th>
                        <th className="py-3.5 px-4 sm:px-6 text-right">PORTFOLIO VALUE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 text-xs font-semibold">
                      {filteredPlayers.map((player) => (
                        <tr key={player.handle || player.rank} className="hover:bg-zinc-50/80 transition-colors">
                          <td className="py-4 px-4 sm:px-6">
                            <span
                              className={`w-7 h-7 rounded-lg inline-flex items-center justify-center font-display font-black text-xs ${
                                player.rank === 1
                                  ? "bg-brand-lime text-black"
                                  : player.rank === 2
                                  ? "bg-zinc-300 text-brand-ink"
                                  : player.rank === 3
                                  ? "bg-amber-100 text-amber-900"
                                  : "bg-zinc-100 text-zinc-600"
                              }`}
                            >
                              #{player.rank}
                            </span>
                          </td>
                          <td className="py-4 px-4 sm:px-6">
                            <div className="font-bold text-brand-ink uppercase">{player.name}</div>
                            <div className="text-[11px] font-mono text-zinc-400">{player.handle}</div>
                          </td>
                          <td className="py-4 px-4 sm:px-6">
                            <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-brand-violet/10 text-brand-violet">
                              {player.badge || "Trader"}
                            </span>
                          </td>
                          <td className="py-4 px-4 sm:px-6 text-right font-display font-bold text-base text-brand-violet">
                            {player.score} PTS
                          </td>
                          <td className="py-4 px-4 sm:px-6 text-right font-mono font-bold text-sm text-brand-ink">
                            {player.portfolio}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          ) : (
            /* Standby State Before Tournament Begins */
            <div className="bg-white rounded-3xl border-2 border-brand-ink/10 p-8 sm:p-14 text-center shadow-md space-y-6">
              <div className="w-20 h-20 rounded-3xl bg-brand-violet text-white mx-auto flex items-center justify-center shadow-xl shadow-brand-violet/25">
                <Trophy className="w-10 h-10 text-brand-lime" />
              </div>

              <div className="max-w-xl mx-auto space-y-3">
                <span className="text-[11px] font-black uppercase tracking-widest text-brand-violet bg-brand-violet/10 px-3.5 py-1 rounded-full">
                  FESTIVAL TOURNAMENT ARENA
                </span>
                <h2 className="font-display text-3xl sm:text-5xl font-black uppercase text-brand-ink">
                  LIVE ARENA INITIALIZING
                </h2>
                <p className="text-xs sm:text-sm text-zinc-600 font-medium leading-relaxed">
                  The Bulls & Bears dynamic trading leaderboard will go live on <strong>Day 3 (September 26, 2026)</strong> at 301 ALH.
                  Scores will automatically stream here in real time as market shocks, portfolio bids, and quiz sprints occur.
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/register?event=bulls-and-bears"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-brand-ink hover:bg-brand-violet text-white font-black text-xs uppercase tracking-wider transition-colors shadow-lg"
                >
                  <span>REGISTER FOR BULLS & BEARS</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-zinc-300 hover:bg-zinc-50 text-brand-ink font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  <span>EXPLORE ALL EVENTS</span>
                </Link>
              </div>
            </div>
          )}

          {/* Rules & Competition Blueprint Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-brand-violet">
                <Zap className="w-4 h-4" />
                <span>STAGE 01 · MARKET SPRINT</span>
              </div>
              <h3 className="font-display text-2xl font-bold uppercase text-brand-ink">
                SPEED FINANCIAL ANALYSIS
              </h3>
              <p className="text-xs text-zinc-600 font-medium leading-relaxed">
                Rapid-fire equity, macro-economics, and technical chart interpretation. High speed and precision earn bonus initial capital allocations for the trading floor.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-emerald-700">
                <Flame className="w-4 h-4" />
                <span>STAGE 02 · PORTFOLIO RUN</span>
              </div>
              <h3 className="font-display text-2xl font-bold uppercase text-brand-ink">
                SIMULATION & HIGHEST RETURN
              </h3>
              <p className="text-xs text-zinc-600 font-medium leading-relaxed">
                Live simulated trading window with dynamic breaking news flash crashes, earnings surprise triggers, and liquidity shocks. Maximize ROI to win the Alpha Trader title.
              </p>
            </div>
          </div>

        </section>
      </main>

      <Footer />
    </div>
  );
}
