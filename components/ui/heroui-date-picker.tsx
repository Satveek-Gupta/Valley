"use client";

import { useState, useRef, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroUIDatePickerProps {
  value: string; // ISO string or YYYY-MM-DDTHH:mm
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function HeroUIDatePicker({
  value,
  onChange,
  label = "Select Date & Time",
  placeholder = "Pick a date...",
  className,
}: HeroUIDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial date
  const parsedDate = value ? new Date(value) : new Date("2026-10-14T09:00:00");
  const validDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

  const [currentMonth, setCurrentMonth] = useState(
    new Date(validDate.getFullYear(), validDate.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState<Date>(validDate);
  const [hours, setHours] = useState(String(validDate.getHours()).padStart(2, "0"));
  const [minutes, setMinutes] = useState(String(validDate.getMinutes()).padStart(2, "0"));

  // Sync when value prop changes externally
  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setSelectedDate(d);
        setCurrentMonth(new Date(d.getFullYear(), d.getMonth(), 1));
        setHours(String(d.getHours()).padStart(2, "0"));
        setMinutes(String(d.getMinutes()).padStart(2, "0"));
      }
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const emitChange = (newDate: Date, h: string, m: string) => {
    const updated = new Date(newDate);
    updated.setHours(parseInt(h, 10) || 0);
    updated.setMinutes(parseInt(m, 10) || 0);
    updated.setSeconds(0);
    
    // Format to local ISO (YYYY-MM-DDTHH:mm)
    const year = updated.getFullYear();
    const month = String(updated.getMonth() + 1).padStart(2, "0");
    const day = String(updated.getDate()).padStart(2, "0");
    const formattedHours = String(updated.getHours()).padStart(2, "0");
    const formattedMins = String(updated.getMinutes()).padStart(2, "0");
    
    const isoLocal = `${year}-${month}-${day}T${formattedHours}:${formattedMins}`;
    onChange(isoLocal);
  };

  const handleSelectDay = (dayNumber: number) => {
    const newDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      dayNumber
    );
    setSelectedDate(newDate);
    emitChange(newDate, hours, minutes);
  };

  const handleTimeChange = (newHours: string, newMins: string) => {
    setHours(newHours);
    setMinutes(newMins);
    emitChange(selectedDate, newHours, newMins);
  };

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  // Calendar calculations
  const year = currentMonth.getFullYear();
  const monthIndex = currentMonth.getMonth();
  const monthName = currentMonth.toLocaleString("en-US", { month: "long" });

  const firstDayOfWeek = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const formattedDisplay = (() => {
    try {
      return new Intl.DateTimeFormat("en-IN", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      }).format(selectedDate);
    } catch {
      return value;
    }
  })();

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {label && (
        <label className="block text-xs font-black uppercase tracking-wider text-brand-ink mb-1.5">
          {label}
        </label>
      )}

      {/* HeroUI-style Trigger Pill */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full cursor-pointer flex items-center justify-between px-4 py-3 rounded-2xl border-2 transition-all bg-zinc-50 hover:bg-white",
          isOpen
            ? "border-brand-violet ring-4 ring-brand-violet/10 bg-white"
            : "border-zinc-300 hover:border-zinc-400"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-brand-violet/10 text-brand-violet flex items-center justify-center">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-brand-ink leading-tight">
              {formattedDisplay || placeholder}
            </div>
            <div className="text-[10px] font-mono text-zinc-400 font-semibold">
              {year}-{String(monthIndex + 1).padStart(2, "0")}-{String(selectedDate.getDate()).padStart(2, "0")} {hours}:{minutes}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-brand-violet bg-brand-violet/10 px-2 py-0.5 rounded-full">
            CHANGE
          </span>
        </div>
      </div>

      {/* Floating Popover Container */}
      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-2 w-full max-w-sm bg-white rounded-3xl border-2 border-brand-ink shadow-2xl p-5 animate-in fade-in zoom-in-95 duration-150">
          
          {/* Popover Header: Month / Year Navigation */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100">
            <button
              type="button"
              onClick={prevMonth}
              className="w-8 h-8 rounded-xl hover:bg-zinc-100 flex items-center justify-center text-brand-ink transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="font-display text-base font-bold uppercase tracking-wide text-brand-ink">
              {monthName} <span className="text-brand-violet">{year}</span>
            </div>

            <button
              type="button"
              onClick={nextMonth}
              className="w-8 h-8 rounded-xl hover:bg-zinc-100 flex items-center justify-center text-brand-ink transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black uppercase text-zinc-400 mb-2">
            <span>SU</span>
            <span>MO</span>
            <span>TU</span>
            <span>WE</span>
            <span>TH</span>
            <span>FR</span>
            <span>SA</span>
          </div>

          {/* Calendar Day Matrix */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Blank offset days */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-8" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected =
                selectedDate.getDate() === day &&
                selectedDate.getMonth() === monthIndex &&
                selectedDate.getFullYear() === year;

              const isFestivalDay =
                year === 2026 && monthIndex === 9 && (day === 14 || day === 15 || day === 16);

              return (
                <button
                  type="button"
                  key={day}
                  onClick={() => handleSelectDay(day)}
                  className={cn(
                    "h-8 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center relative",
                    isSelected
                      ? "bg-brand-violet text-white shadow-md shadow-brand-violet/30 font-black scale-105"
                      : "hover:bg-zinc-100 text-brand-ink",
                    !isSelected && isFestivalDay && "ring-1 ring-brand-violet text-brand-violet font-black"
                  )}
                >
                  <span>{day}</span>
                  {isFestivalDay && !isSelected && (
                    <span className="w-1 h-1 rounded-full bg-brand-violet absolute bottom-1" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Time Picker Controls */}
          <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-brand-ink">
              <Clock className="w-3.5 h-3.5 text-brand-violet" />
              <span>TIME:</span>
            </div>

            <div className="flex items-center gap-1 font-mono text-xs">
              <input
                type="number"
                min="0"
                max="23"
                value={hours}
                onChange={(e) => {
                  const val = String(Math.min(23, Math.max(0, parseInt(e.target.value, 10) || 0))).padStart(2, "0");
                  handleTimeChange(val, minutes);
                }}
                className="w-12 px-2 py-1 text-center font-bold bg-zinc-100 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-violet"
              />
              <span className="font-bold text-zinc-400">:</span>
              <input
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => {
                  const val = String(Math.min(59, Math.max(0, parseInt(e.target.value, 10) || 0))).padStart(2, "0");
                  handleTimeChange(hours, val);
                }}
                className="w-12 px-2 py-1 text-center font-bold bg-zinc-100 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-violet"
              />
            </div>
          </div>

          {/* Popover Action Buttons */}
          <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                setSelectedDate(now);
                setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
                const h = String(now.getHours()).padStart(2, "0");
                const m = String(now.getMinutes()).padStart(2, "0");
                setHours(h);
                setMinutes(m);
                emitChange(now, h, m);
              }}
              className="text-[11px] font-bold text-zinc-500 hover:text-brand-ink"
            >
              Set Current Time
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-1.5 rounded-full bg-brand-ink hover:bg-brand-violet text-white text-xs font-black uppercase tracking-wider transition-colors shadow-sm"
            >
              DONE
            </button>
          </div>

        </div>
      )}
    </div>
  );
}

export default HeroUIDatePicker;
