"use client";

import { useState } from "react";
import { Clock, CheckCircle2, RotateCcw, Sparkles } from "lucide-react";
import { HeroUIDatePicker } from "@/components/ui/heroui-date-picker";

export default function SettingsForm() {
  // Convert ISO string to format (YYYY-MM-DDTHH:mm)
  const defaultTarget = "2026-10-14T09:00";
  const [dateTimeValue, setDateTimeValue] = useState(defaultTarget);
  const [stallFee, setStallFee] = useState(4000);
  const [isSaved, setIsSaved] = useState(false);

  const formattedPreview = (() => {
    try {
      const date = new Date(dateTimeValue);
      if (isNaN(date.getTime())) return dateTimeValue;
      return new Intl.DateTimeFormat("en-IN", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      }).format(date);
    } catch {
      return dateTimeValue;
    }
  })();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem("cv_countdown_target", dateTimeValue);
      localStorage.setItem("cv_stall_fee", String(stallFee));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (e) {
      // ignore in non-browser env
    }
  };

  const setPreset = (isoString: string) => {
    setDateTimeValue(isoString);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      
      {/* HeroUI Date & Time Selector */}
      <div className="space-y-3">
        <HeroUIDatePicker
          value={dateTimeValue}
          onChange={setDateTimeValue}
          label="COUNTDOWN TARGET DATE & TIME"
          placeholder="Select festival start date..."
        />

        {/* Human Readable Date & Time Card */}
        <div className="p-3.5 bg-brand-surface rounded-2xl border border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <Clock className="w-4 h-4 text-brand-violet flex-shrink-0" />
            <span className="font-bold text-zinc-700">Selected Target:</span>
            <span className="font-black text-brand-ink">{formattedPreview}</span>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mr-1">PRESETS:</span>
          <button
            type="button"
            onClick={() => setPreset("2026-10-14T09:00")}
            className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-brand-violet hover:text-white text-[11px] font-bold transition-colors"
          >
            Day 1 Launch (Oct 14, 9:00 AM)
          </button>
          <button
            type="button"
            onClick={() => setPreset("2026-10-15T10:00")}
            className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-brand-violet hover:text-white text-[11px] font-bold transition-colors"
          >
            Day 2 (Oct 15, 10:00 AM)
          </button>
          <button
            type="button"
            onClick={() => setPreset("2026-10-16T10:00")}
            className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-brand-violet hover:text-white text-[11px] font-bold transition-colors"
          >
            Day 3 Finale (Oct 16, 10:00 AM)
          </button>
        </div>
      </div>

      {/* Main Stall Unit Fee */}
      <div className="space-y-2 pt-4 border-t border-zinc-100">
        <label className="block text-xs font-black uppercase tracking-wider text-brand-ink">
          MAIN STALL UNIT FEE (INR)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">₹</span>
          <input
            type="number"
            value={stallFee}
            onChange={(e) => setStallFee(Number(e.target.value))}
            className="w-full pl-8 pr-4 py-3 rounded-2xl border-2 border-zinc-300 font-mono text-sm font-bold text-brand-ink focus:outline-none focus:border-brand-violet bg-zinc-50"
          />
        </div>
        <p className="text-[11px] text-zinc-500 font-medium">
          Standard registration fee per 10x10ft booth in German Hangar.
        </p>
      </div>

      {/* Save Button with Success Notification */}
      <div className="pt-4 border-t border-zinc-200 flex items-center justify-between">
        {isSaved ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" />
            <span>CONFIGURATION SAVED</span>
          </span>
        ) : (
          <span className="text-[11px] font-medium text-zinc-400">
            Changes update festival timer and stall allocations
          </span>
        )}

        <button
          type="submit"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-brand-violet hover:bg-brand-violet-dark text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-brand-violet/20 transition-all transform active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>SAVE CONFIGURATION</span>
        </button>
      </div>

    </form>
  );
}
