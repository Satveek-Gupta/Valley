"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, Sparkles, X, CheckCircle2, Award, MapPin, Clock, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { EVENTS_DATA, EventItem } from "@/lib/mock-data";
import CountdownWidget from "@/components/countdown-widget";
import AnimatedGridPattern from "@/components/magicui/animated-grid-pattern";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

export default function EventsCarousel() {
  const [events, setEvents] = useState<EventItem[]>(EVENTS_DATA);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [selectedEventModal, setSelectedEventModal] = useState<EventItem | null>(null);

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        if (data.events && Array.isArray(data.events) && data.events.length > 0) {
          setEvents(data.events);
        }
      })
      .catch((err) => console.error("Could not fetch dynamic events", err));
  }, []);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api, events]);

  return (
    <section id="events" className="relative w-full py-16 sm:py-24 bg-[#FAFAFA] border-b border-brand-ink/10 overflow-hidden">
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

        {/* Shadcn / Embla Carousel Viewport */}
        <div className="relative w-full">
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-3 sm:-ml-4">
              {events.map((event, index) => {
                const isSelected = current === index + 1;

                return (
                  <CarouselItem
                    key={event.id || event.slug}
                    className="pl-3 sm:pl-4 basis-[88%] sm:basis-[48%] lg:basis-[33.333%]"
                  >
                    <div
                      onClick={() => setSelectedEventModal(event)}
                      className={`h-full cursor-pointer transition-all duration-300 rounded-3xl p-6 sm:p-7 flex flex-col justify-between select-none ${
                        isSelected
                          ? "bg-brand-violet text-white shadow-xl shadow-brand-violet/25 ring-2 ring-brand-violet"
                          : "bg-white text-brand-ink border-2 border-brand-ink/10 hover:border-brand-ink/40 shadow-sm hover:shadow-md"
                      }`}
                    >
                      {/* Top: Day tag & Event name */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span
                            className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                              isSelected
                                ? "bg-white text-brand-violet"
                                : "bg-brand-surface text-brand-ink"
                            }`}
                          >
                            {event.dateLabel}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider ${
                              isSelected ? "text-brand-lime" : "text-zinc-500"
                            }`}
                          >
                            {event.teamSize}
                          </span>
                        </div>

                        <h3 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-wide leading-none mb-3">
                          {event.name}
                        </h3>

                        <p
                          className={`text-xs font-medium line-clamp-3 mb-4 leading-relaxed ${
                            isSelected ? "text-white/90" : "text-zinc-600"
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

                          <span
                            className={`inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider underline underline-offset-4 ${
                              isSelected ? "text-brand-lime hover:text-white" : "text-brand-violet hover:text-black"
                            }`}
                          >
                            <span>VIEW DETAILS</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>

            {/* Navigation Controls Bar */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                type="button"
                onClick={() => api?.scrollPrev()}
                aria-label="Previous slide"
                className="w-12 h-12 rounded-full bg-white border-2 border-brand-ink text-brand-ink hover:bg-brand-ink hover:text-white flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <div className="font-mono text-sm font-black tracking-wider text-brand-ink min-w-[70px] text-center">
                {String(current || 1).padStart(2, "0")} / {String(count || events.length).padStart(2, "0")}
              </div>

              <button
                type="button"
                onClick={() => api?.scrollNext()}
                aria-label="Next slide"
                className="w-12 h-12 rounded-full bg-white border-2 border-brand-ink text-brand-ink hover:bg-brand-ink hover:text-white flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </Carousel>
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

            {/* Offline Booking Notice for Bay Area Stalls */}
            {selectedEventModal.slug === "bay-area" && (
              <div className="mb-6 p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900">
                <div className="text-xs font-black uppercase tracking-wider text-amber-950 mb-1">
                  OFFLINE ON-CAMPUS REGISTRATION ONLY
                </div>
                <p className="text-xs font-semibold leading-relaxed">
                  Stalls in the German Hangar (50 curated units) are allocated <strong>exclusively offline</strong> through the Student Cabinet Coordination Desk. Online registration is not applicable for stall allotments.
                </p>
              </div>
            )}


            {/* Rewards & Incentives */}
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
              {selectedEventModal.slug === "bay-area" ? (
                <div className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-zinc-900 text-brand-lime text-xs font-black uppercase tracking-wider shadow-md">
                  <span>OFFLINE BOOKING ONLY</span>
                </div>
              ) : (
                <Link
                  href={`/register?event=${selectedEventModal.slug}`}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-brand-violet hover:bg-brand-violet-dark text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-brand-violet/30 transition-all"
                >
                  <span>REGISTER FOR THIS TRACK</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              )}
            </div>


          </div>
        </div>
      )}
    </section>
  );
}
