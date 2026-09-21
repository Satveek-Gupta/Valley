"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Layers,
  MapPin,
  Clock,
  Users,
  Award,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Briefcase,
  Store,
  Swords,
  TrendingUp,
} from "lucide-react";
import { EVENTS_DATA, EventItem } from "@/lib/mock-data";

const ICON_COMPONENTS: Record<string, any> = {
  Sparkles,
  Store,
  Swords,
  Briefcase,
  Users,
  TrendingUp,
};

const COLOR_PRESETS = [
  { label: "Orange (#FF5A36)", value: "#FF5A36", type: "orange" },
  { label: "Blue (#2F6FED)", value: "#2F6FED", type: "blue" },
  { label: "Lime (#C6F135)", value: "#C6F135", type: "lime" },
  { label: "Violet (#7C3AED)", value: "#7C3AED", type: "violet" },
  { label: "Pink (#EC4899)", value: "#EC4899", type: "violet" },
  { label: "Emerald (#10B981)", value: "#10B981", type: "lime" },
];

export default function EventsManager() {
  const [events, setEvents] = useState<EventItem[]>(EVENTS_DATA);
  const [selectedSlug, setSelectedSlug] = useState<string>("startup-roulette");
  const [formData, setFormData] = useState<EventItem>(EVENTS_DATA[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/events");
      const json = await res.json();
      if (json.events && json.events.length > 0) {
        setEvents(json.events);
        const current = json.events.find((e: EventItem) => e.slug === selectedSlug) || json.events[0];
        setFormData(current);
      }
    } catch (e) {
      console.error("Failed to load events", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectEvent = (event: EventItem) => {
    setSelectedSlug(event.slug);
    // Find latest in state or fallback to selected
    const existing = events.find((e) => e.slug === event.slug) || event;
    setFormData(JSON.parse(JSON.stringify(existing)));
    setSaveStatus(null);
  };

  const handleInputChange = (field: keyof EventItem, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRoundChange = (index: number, field: "title" | "desc", value: string) => {
    setFormData((prev) => {
      const newRounds = [...(prev.rounds || [])];
      if (newRounds[index]) {
        newRounds[index] = { ...newRounds[index], [field]: value };
      }
      return { ...prev, rounds: newRounds };
    });
  };

  const handleAddRound = () => {
    setFormData((prev) => ({
      ...prev,
      rounds: [
        ...(prev.rounds || []),
        {
          round: (prev.rounds?.length || 0) + 1,
          title: `Round ${(prev.rounds?.length || 0) + 1}`,
          desc: "Description of the round criteria and format",
        },
      ],
    }));
  };

  const handleRemoveRound = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      rounds: (prev.rounds || [])
        .filter((_, i) => i !== index)
        .map((r, i) => ({ ...r, round: i + 1 })),
    }));
  };

  const handleRewardChange = (index: number, value: string) => {
    setFormData((prev) => {
      const newRewards = [...(prev.rewards || [])];
      newRewards[index] = value;
      return { ...prev, rewards: newRewards };
    });
  };

  const handleAddReward = () => {
    setFormData((prev) => ({
      ...prev,
      rewards: [...(prev.rewards || []), "New Prize / Reward tier"],
    }));
  };

  const handleRemoveReward = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      rewards: (prev.rewards || []).filter((_, i) => i !== index),
    }));
  };

  const handleResetToDefault = () => {
    const defaultData = EVENTS_DATA.find((e) => e.slug === selectedSlug);
    if (defaultData) {
      setFormData(JSON.parse(JSON.stringify(defaultData)));
      setSaveStatus({
        type: "success",
        message: "Reset to default values in editor (Click 'Save Changes' to persist)",
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus(null);

    try {
      const res = await fetch("/api/admin/events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        throw new Error(json.error || "Failed to update event details");
      }

      setSaveStatus({
        type: "success",
        message: `Successfully updated ${formData.name} in Supabase!`,
      });

      // Update local state
      setEvents((prev) =>
        prev.map((ev) => (ev.slug === formData.slug ? { ...formData } : ev))
      );
    } catch (err: any) {
      console.error(err);
      setSaveStatus({
        type: "error",
        message: err.message || "Failed to save event changes",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const IconComponent = ICON_COMPONENTS[formData.iconName] || Sparkles;

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-violet/10 text-brand-violet text-[10px] font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>DYNAMIC TRACK & EVENT EDITOR</span>
          </div>
          <h2 className="font-display text-2xl font-bold uppercase text-brand-ink">
            EVENT SPECIFICATIONS & RULES
          </h2>
          <p className="text-xs text-zinc-500 font-medium">
            Update festival track names, timings, venues, rounds, and rewards in real-time. Changes are immediately reflected across the website.
          </p>
        </div>

        <button
          onClick={fetchEvents}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-300 hover:bg-zinc-50 text-brand-ink text-xs font-bold uppercase transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Reload From DB</span>
        </button>
      </div>

      {/* Notifications */}
      {saveStatus && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-bold ${
            saveStatus.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {saveStatus.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <span>{saveStatus.message}</span>
          </div>
          <button
            onClick={() => setSaveStatus(null)}
            className="text-[10px] uppercase font-black opacity-60 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Event Selector (3 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-[11px] font-black uppercase tracking-wider text-zinc-400 px-1">
            SELECT EVENT TO EDIT ({events.length})
          </div>

          <div className="space-y-2">
            {events.map((ev) => {
              const isSelected = ev.slug === selectedSlug;
              const EvIcon = ICON_COMPONENTS[ev.iconName] || Sparkles;
              return (
                <button
                  key={ev.slug}
                  onClick={() => handleSelectEvent(ev)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? "bg-white border-brand-violet ring-2 ring-brand-violet/20 shadow-md"
                      : "bg-white/60 hover:bg-white border-zinc-200 text-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: ev.badgeColor || "#7C3AED" }}
                    >
                      <EvIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-display font-bold text-sm text-brand-ink uppercase">
                        {ev.name}
                      </div>
                      <div className="text-[10px] font-bold text-zinc-400 uppercase">
                        {ev.dateLabel || `Day ${ev.day}`} · {ev.venue || "Campus"}
                      </div>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 ${
                      isSelected ? "text-brand-violet" : "text-zinc-300"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Quick Preview Card */}
          <div className="mt-6 bg-white p-5 rounded-3xl border border-zinc-200 shadow-sm space-y-3">
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              LIVE PREVIEW CARD
            </div>
            <div
              className="p-4 rounded-2xl text-white space-y-2 shadow-sm"
              style={{ backgroundColor: formData.badgeColor || "#7C3AED" }}
            >
              <div className="flex items-center justify-between text-[10px] font-black uppercase">
                <span className="bg-black/20 px-2.5 py-0.5 rounded-full">{formData.dateLabel || `Day ${formData.day}`}</span>
                <span>{formData.format || "Track"}</span>
              </div>
              <div className="font-display text-lg font-black uppercase leading-tight">
                {formData.name || "Event Title"}
              </div>
              <div className="text-xs opacity-90 font-medium line-clamp-2">
                {formData.tagline || formData.description}
              </div>
              <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[10px] font-bold">
                <span>{formData.venue}</span>
                <span>{formData.timing}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Event Form Editor (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Form Top Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: formData.badgeColor }}
                >
                  <IconComponent className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold uppercase text-brand-ink">
                    EDITING: {formData.name}
                  </h3>
                  <span className="text-[10px] font-mono text-zinc-400">
                    SLUG: {formData.slug}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="px-3 py-1.5 rounded-xl border border-zinc-300 hover:bg-zinc-50 text-[10px] font-bold uppercase text-zinc-600 transition-colors"
                >
                  Reset Defaults
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-ink hover:bg-brand-violet text-white text-xs font-black uppercase tracking-wider transition-colors shadow-md disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? "SAVING..." : "SAVE CHANGES"}</span>
                </button>
              </div>
            </div>

            {/* General Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-brand-ink mb-1">
                  EVENT NAME
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-violet"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-brand-ink mb-1">
                  TAGLINE
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => handleInputChange("tagline", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-violet"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-brand-ink mb-1">
                  FESTIVAL DAY (1, 2, or 3)
                </label>
                <select
                  value={formData.day}
                  onChange={(e) => {
                    const day = Number(e.target.value);
                    handleInputChange("day", day);
                    handleInputChange("dateLabel", `DAY 0${day}`);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-violet"
                >
                  <option value={1}>Day 1 (Sept 24, 2026)</option>
                  <option value={2}>Day 2 (Sept 25, 2026)</option>
                  <option value={3}>Day 3 (Sept 26, 2026)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-brand-ink mb-1">
                  DATE LABEL
                </label>
                <input
                  type="text"
                  value={formData.dateLabel}
                  onChange={(e) => handleInputChange("dateLabel", e.target.value)}
                  placeholder="e.g. DAY 01 or DAY 01 & 02"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-violet"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-brand-ink mb-1">
                  VENUE
                </label>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) => handleInputChange("venue", e.target.value)}
                  placeholder="e.g. Hexagon or 301 ALH"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-violet"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-brand-ink mb-1">
                  TIMING
                </label>
                <input
                  type="text"
                  value={formData.timing}
                  onChange={(e) => handleInputChange("timing", e.target.value)}
                  placeholder="e.g. 11:00 AM – 4:00 PM"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-violet"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-brand-ink mb-1">
                  TEAM SIZE
                </label>
                <input
                  type="text"
                  value={formData.teamSize}
                  onChange={(e) => handleInputChange("teamSize", e.target.value)}
                  placeholder="e.g. 5 Members (12 Teams Max) or Individual"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-violet"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-brand-ink mb-1">
                  FORMAT
                </label>
                <input
                  type="text"
                  value={formData.format}
                  onChange={(e) => handleInputChange("format", e.target.value)}
                  placeholder="e.g. 3 Elimination Rounds"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-violet"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-brand-ink mb-1">
                DESCRIPTION
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-violet"
              />
            </div>

            {/* Theme & Color Presets */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-brand-ink mb-2">
                BADGE & THEME COLOR
              </label>
              <div className="flex flex-wrap items-center gap-3">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => {
                      handleInputChange("badgeColor", preset.value);
                      handleInputChange("tagType", preset.type);
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                      formData.badgeColor === preset.value
                        ? "border-brand-ink ring-2 ring-brand-ink/20 shadow-sm"
                        : "border-zinc-200 hover:border-zinc-300"
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10"
                      style={{ backgroundColor: preset.value }}
                    />
                    <span>{preset.label.split(" ")[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Rounds Section */}
            <div className="pt-4 border-t border-zinc-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-display text-sm font-bold uppercase text-brand-ink">
                    COMPETITION ROUNDS ({formData.rounds?.length || 0})
                  </h4>
                  <p className="text-[11px] text-zinc-500">
                    Define the round-by-round stages displayed in event modals.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddRound}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-brand-ink text-xs font-bold uppercase transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Round</span>
                </button>
              </div>

              <div className="space-y-3">
                {formData.rounds?.map((r, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-brand-violet bg-brand-violet/10 px-2 py-0.5 rounded">
                        STAGE {r.round || index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRound(index)}
                        className="text-zinc-400 hover:text-red-600 transition-colors p-1"
                        title="Delete round"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-1">
                        <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1">
                          Round Title
                        </label>
                        <input
                          type="text"
                          value={r.title}
                          onChange={(e) => handleRoundChange(index, "title", e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-violet"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1">
                          Round Description
                        </label>
                        <input
                          type="text"
                          value={r.desc}
                          onChange={(e) => handleRoundChange(index, "desc", e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand-violet"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rewards Section */}
            <div className="pt-4 border-t border-zinc-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-display text-sm font-bold uppercase text-brand-ink">
                    PRIZES & REWARDS ({formData.rewards?.length || 0})
                  </h4>
                  <p className="text-[11px] text-zinc-500">
                    Highlighted rewards and certificates for winners.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddReward}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-brand-ink text-xs font-bold uppercase transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Reward</span>
                </button>
              </div>

              <div className="space-y-2">
                {formData.rewards?.map((reward, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-brand-violet flex-shrink-0" />
                    <input
                      type="text"
                      value={reward}
                      onChange={(e) => handleRewardChange(idx, e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-violet"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveReward(idx)}
                      className="p-2 text-zinc-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Internship Opportunity */}
            <div className="pt-4 border-t border-zinc-100">
              <label className="block text-[10px] font-black uppercase tracking-wider text-brand-ink mb-1">
                FEATURED INTERNSHIP / FOUNDER'S OFFICE OPPORTUNITY (OPTIONAL)
              </label>
              <input
                type="text"
                value={formData.internshipOpportunity || ""}
                onChange={(e) => handleInputChange("internshipOpportunity", e.target.value)}
                placeholder="e.g. 3-Month Founder's Office Internship"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-violet"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-zinc-100 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-brand-ink hover:bg-brand-violet text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? "SAVING TO SUPABASE..." : "SAVE & PUBLISH CHANGES"}</span>
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}
