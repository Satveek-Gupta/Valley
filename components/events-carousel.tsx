"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowUpRight, Sparkles, X, CheckCircle2, Award, MapPin, Clock, Users } from "lucide-react";
import { EVENTS_DATA, EventItem } from "@/lib/mock-data";
import CountdownWidget from "@/components/countdown-widget";

export default function EventsCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedEventModal, setSelectedEventModal] = useState<EventItem | null>(null);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? EVENTS_DATA.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === EVENTS_DATA.length - 1 ? 0 : prev + 1));
  };

  return (
    <section id="events" className="w-full py-16 sm:py-24 bg-[#FAFAFA] border-b border-brand-ink/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-violet mb-2">
              <Sparkles className="w-4 h-4" />
              <span>COMPETITIONS & TRACKS</span>
            </div>
            <h2 className="font-display text-4xl sm:text-6xl font-black uppercase tracking-wide text-brand-ink">
              6 FEST EVENTS
            </h2>
          </div>

          {/* Right: Mini Countdown & Fast Action */}
          <div className="flex items-center gap-4">
            <CountdownWidget compact={true} />
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-ink hover:bg-brand-violet text-white text-xs font-black uppercase tracking-wider transition-all"
            >
              <span>REGISTER</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Carousel Viewport */}
        <div className="relative w-full py-6">
          <div className="flex items-stretch justify-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-4 px-2">
            {EVENTS_DATA.map((event, index) => {
              const isActive = index === activeIndex;

              return (
                <div
                  key={event.id}
                  onClick={() => setActiveIndex(index)}
                  className={`cursor-pointer transition-all duration-300 flex-shrink-0 w-[280px] sm:w-[320px] rounded-3xl p-6 flex flex-col justify-between select-none ${
                    isActive
                      ? "bg-brand-violet text-white scale-105 shadow-2xl shadow-brand-violet/40 ring-4 ring-brand-violet/20 z-20"
                      : "bg-white text-brand-ink border-2 border-brand-ink/10 hover:border-brand-ink/40 opacity-85 hover:opacity-100 scale-95 z-10"
                  }`}
                >
                  {/* Top: Day tag & Event name */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                          isActive
                            ? "bg-white text-brand-violet"
                            : "bg-brand-surface text-brand-ink"
                        }`}
                      >
                        {event.dateLabel}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          isActive ? "text-brand-lime" : "text-zinc-500"
                        }`}
                      >
                        {event.teamSize}
                      </span>
                    </div>

                    <h3 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-wide leading-none mb-3">
                      {event.name}
                    </h3>

                    <p
                      className={`text-xs font-medium line-clamp-3 mb-4 ${
                        isActive ? "text-white/90" : "text-zinc-600"
                      }`}
                    >
                      {event.description}
                    </p>
                  </div>

                  {/* Bottom: Rounds info & detail button */}
                  <div className="pt-4 border-t border-current/10">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-black uppercase tracking-wider">
                        {event.rounds.length} {event.rounds.length === 1 ? "SESSION" : "ROUNDS"}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEventModal(event);
                        }}
                        className={`inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider underline underline-offset-4 ${
                          isActive ? "text-brand-lime hover:text-white" : "text-brand-violet hover:text-black"
                        }`}
                      >
                        <span>VIEW DETAILS</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={handlePrev}
              aria-label="Previous Event"
              className="w-12 h-12 rounded-full bg-white border-2 border-brand-ink text-brand-ink hover:bg-brand-ink hover:text-white flex items-center justify-center transition-all shadow-md active:scale-95"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="font-mono text-sm font-black tracking-wider text-brand-ink">
              {String(activeIndex + 1).padStart(2, "0")} / {String(EVENTS_DATA.length).padStart(2, "0")}
            </div>
            <button
              onClick={handleNext}
              aria-label="Next Event"
              className="w-12 h-12 rounded-full bg-white border-2 border-brand-ink text-brand-ink hover:bg-brand-ink hover:text-white flex items-center justify-center transition-all shadow-md active:scale-95"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

      </div>

      {/* Event Details Modal */}
      {selectedEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 border-4 border-brand-ink shadow-2xl relative">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedEventModal(null)}
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-brand-surface hover:bg-brand-ink hover:text-white flex items-center justify-center transition-colors text-brand-ink"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="pr-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-violet text-white text-xs font-black uppercase mb-3">
                <span>{selectedEventModal.dateLabel}</span>
                <span>•</span>
                <span>{selectedEventModal.format}</span>
              </div>
              <h3 className="font-display text-3xl sm:text-4xl font-black uppercase text-brand-ink">
                {selectedEventModal.name}
              </h3>
              <p className="text-sm font-semibold text-brand-violet mt-1">
                {selectedEventModal.tagline}
              </p>
            </div>

            {/* Quick Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6 p-4 bg-brand-surface rounded-2xl text-xs font-bold text-brand-ink">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-violet" />
                <span>{selectedEventModal.teamSize}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-violet" />
                <span>{selectedEventModal.venue}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-violet" />
                <span>{selectedEventModal.timing}</span>
              </div>
            </div>

            {/* Rounds / Schedule Breakdown */}
            <div className="mb-6">
              <h4 className="font-display text-lg font-bold uppercase text-brand-ink mb-3">
                FORMAT & ROUNDS
              </h4>
              <div className="space-y-3">
                {selectedEventModal.rounds.map((round) => (
                  <div key={round.round} className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl">
                    <div className="flex items-center gap-2 text-xs font-black text-brand-ink uppercase mb-1">
                      <span className="w-5 h-5 rounded-full bg-brand-ink text-white flex items-center justify-center text-[10px]">
                        {round.round}
                      </span>
                      <span>{round.title}</span>
                    </div>
                    <p className="text-xs text-zinc-600 font-medium ml-7">{round.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Rewards & Internships */}
            <div className="mb-6 p-4 rounded-2xl bg-brand-violet/10 border-2 border-brand-violet/30">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-brand-violet mb-2">
                <Award className="w-4 h-4" />
                <span>REWARDS & INCENTIVES</span>
              </div>
              <ul className="space-y-1.5 text-xs font-semibold text-brand-ink">
                {selectedEventModal.rewards.map((reward, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-violet flex-shrink-0 mt-0.5" />
                    <span>{reward}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200">
              <button
                onClick={() => setSelectedEventModal(null)}
                className="px-5 py-2.5 rounded-full border-2 border-brand-ink text-xs font-black uppercase tracking-wider hover:bg-zinc-100 transition-colors"
              >
                CLOSE
              </button>
              <Link
                href={`/register?event=${selectedEventModal.slug}`}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-brand-violet hover:bg-brand-violet-dark text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-brand-violet/30 transition-all"
              >
                <span>REGISTER FOR THIS TRACK</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
