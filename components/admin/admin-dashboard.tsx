"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  Store,
  Calendar,
  Layers,
  Sparkles,
  TrendingUp,
  Settings,
  ArrowUpRight,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import RegistrationsTable from "./registrations-table";
import StallManager from "./stall-manager";
import SettingsForm from "./settings-form";
import { EVENTS_DATA } from "@/lib/mock-data";

export default function AdminDashboard({
  initialRegistrations = [],
  userEmail,
  onLogout,
}: {
  initialRegistrations: any[];
  userEmail?: string | null;
  onLogout?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "registrations" | "stalls" | "settings">("overview");

  // Calculations
  const totalRegistrations = initialRegistrations.length;
  const rouletteCount = initialRegistrations.filter((r) => r.selectedEvents?.includes("startup-roulette")).length;
  const warRoomCount = initialRegistrations.filter((r) => r.selectedEvents?.includes("the-war-room")).length;
  const boardroomCount = initialRegistrations.filter((r) => r.selectedEvents?.includes("the-boardroom")).length;
  const entreprenormieCount = initialRegistrations.filter((r) => r.selectedEvents?.includes("entre-prenormie")).length;
  const bullsCount = initialRegistrations.filter((r) => r.selectedEvents?.includes("bulls-and-bears")).length;
  const bayAreaCount = initialRegistrations.filter((r) => r.selectedEvents?.includes("bay-area")).length;

  return (
    <div className="min-h-screen bg-[#F4F4F6] text-brand-ink">
      
      {/* Admin Top Navigation */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-ink text-white flex items-center justify-center font-display text-lg">
              CV
            </div>
            <div>
              <span className="font-display text-lg font-black uppercase text-brand-ink">
                CABINET VALLEY
              </span>
              <span className="text-[10px] uppercase font-bold text-brand-violet ml-2 px-2 py-0.5 rounded bg-brand-violet/10">
                ADMIN CONSOLE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {userEmail && (
              <span className="hidden sm:inline-block text-[11px] font-mono text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-full">
                {userEmail}
              </span>
            )}

            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1 text-xs font-bold text-zinc-600 hover:text-brand-ink uppercase"
            >
              <span>LIVE SITE</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            {onLogout && (
              <button
                onClick={onLogout}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-zinc-300 hover:bg-zinc-100 text-zinc-700 text-xs font-bold uppercase transition-colors"
              >
                <span>SIGN OUT</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-zinc-500 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "overview"
                ? "border-brand-violet text-brand-violet font-black"
                : "border-transparent hover:text-brand-ink"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>OVERVIEW DASHBOARD</span>
          </button>

          <button
            onClick={() => setActiveTab("registrations")}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "registrations"
                ? "border-brand-violet text-brand-violet font-black"
                : "border-transparent hover:text-brand-ink"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>REGISTRATIONS ({totalRegistrations})</span>
          </button>

          <button
            onClick={() => setActiveTab("stalls")}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "stalls"
                ? "border-brand-violet text-brand-violet font-black"
                : "border-transparent hover:text-brand-ink"
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>BAY AREA STALLS</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "settings"
                ? "border-brand-violet text-brand-violet font-black"
                : "border-transparent hover:text-brand-ink"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>FESTIVAL SETTINGS</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && (
          <div className="space-y-8">
            
            {/* Top KPI row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
                <div className="flex items-center justify-between text-zinc-500 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider">TOTAL REGISTRATIONS</span>
                  <Users className="w-4 h-4 text-brand-violet" />
                </div>
                <div className="font-display text-4xl font-black text-brand-ink">{totalRegistrations}</div>
                <div className="text-[11px] text-emerald-600 font-bold mt-1">Live submissions logged</div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
                <div className="flex items-center justify-between text-zinc-500 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider">BAY AREA OCCUPANCY</span>
                  <Store className="w-4 h-4 text-brand-lime" />
                </div>
                <div className="font-display text-4xl font-black text-brand-ink">{bayAreaCount} / 40</div>
                <div className="text-[11px] text-zinc-500 font-bold mt-1">German Hangar Main Stalls</div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
                <div className="flex items-center justify-between text-zinc-500 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider">ROULETTE TEAMS</span>
                  <Sparkles className="w-4 h-4 text-[#FF5A36]" />
                </div>
                <div className="font-display text-4xl font-black text-brand-ink">{rouletteCount} / 12</div>
                <div className="text-[11px] text-zinc-500 font-bold mt-1">Pitch Teams Cap</div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
                <div className="flex items-center justify-between text-zinc-500 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider">BULLS & BEARS TRADERS</span>
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="font-display text-4xl font-black text-brand-ink">{bullsCount}</div>
                <div className="text-[11px] text-zinc-500 font-bold mt-1">Terminal Participants</div>
              </div>
            </div>

            {/* Per-Track Breakdown Card */}
            <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
              <h3 className="font-display text-xl font-bold uppercase text-brand-ink mb-4">
                TRACK PARTICIPATION BREAKDOWN
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200">
                  <div className="text-xs font-black uppercase text-[#FF5A36]">Startup Roulette</div>
                  <div className="font-display text-2xl font-bold text-brand-ink mt-1">{rouletteCount} Registrations</div>
                  <div className="text-[10px] font-bold text-zinc-500 mt-1">Day 1 · Main Auditorium</div>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                  <div className="text-xs font-black uppercase text-[#2F6FED]">The War Room</div>
                  <div className="font-display text-2xl font-bold text-brand-ink mt-1">{warRoomCount} Registrations</div>
                  <div className="text-[10px] font-bold text-zinc-500 mt-1">Day 2 · Strategy Arena</div>
                </div>

                <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200">
                  <div className="text-xs font-black uppercase text-[#FF5A36]">The Boardroom</div>
                  <div className="font-display text-2xl font-bold text-brand-ink mt-1">{boardroomCount} Duos</div>
                  <div className="text-[10px] font-bold text-zinc-500 mt-1">Day 2 · Executive Suite</div>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200">
                  <div className="text-xs font-black uppercase text-brand-violet">Entre-Prenormie</div>
                  <div className="font-display text-2xl font-bold text-brand-ink mt-1">{entreprenormieCount} 1-on-1s</div>
                  <div className="text-[10px] font-bold text-zinc-500 mt-1">Day 3 · Founder Lounge</div>
                </div>

                <div className="p-4 rounded-2xl bg-lime-50 border border-lime-300">
                  <div className="text-xs font-black uppercase text-emerald-800">Bulls & Bears</div>
                  <div className="font-display text-2xl font-bold text-brand-ink mt-1">{bullsCount} Traders</div>
                  <div className="text-[10px] font-bold text-zinc-500 mt-1">Day 3 · Terminal Lab</div>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200">
                  <div className="text-xs font-black uppercase text-brand-violet">Bay Area Stalls</div>
                  <div className="font-display text-2xl font-bold text-brand-ink mt-1">{bayAreaCount} Stalls</div>
                  <div className="text-[10px] font-bold text-zinc-500 mt-1">Days 1 & 2 · German Hangar</div>
                </div>
              </div>
            </div>

          </div>
        )}

        {activeTab === "registrations" && (
          <RegistrationsTable registrations={initialRegistrations} />
        )}

        {activeTab === "stalls" && <StallManager />}

        {activeTab === "settings" && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200 shadow-sm max-w-2xl space-y-6">
            <div>
              <h3 className="font-display text-2xl font-black uppercase text-brand-ink">
                FESTIVAL CONFIGURATION & TOGGLES
              </h3>
              <p className="text-xs text-zinc-500 font-semibold uppercase mt-1">
                Configure live site datetime targets and operational parameters
              </p>
            </div>

            <SettingsForm />
          </div>
        )}
      </main>

    </div>
  );
}
