"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import confetti from "canvas-confetti";
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
  Store,
  Swords,
  Briefcase,
  Users,
  TrendingUp,
  Download,
  RotateCcw,
  Clock,
  MapPin,
} from "lucide-react";
import { registrationSchema, RegistrationFormData, EventSlug } from "@/lib/schema";
import { EVENTS_DATA, EventItem } from "@/lib/mock-data";

const ICON_MAP: Record<string, any> = {
  Sparkles,
  Store,
  Swords,
  Briefcase,
  Users,
  TrendingUp,
};

const ONLINE_EVENTS = EVENTS_DATA.filter((e) => e.slug !== "bay-area");

export default function RegistrationForm() {
  const [eventsList, setEventsList] = useState<EventItem[]>(EVENTS_DATA);
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlEvent = searchParams.get("event") as EventSlug | null;

  const onlineEvents = eventsList.filter((e) => e.slug !== "bay-area");

  // Track the active single event for registration (only if it's an online event)
  const [selectedEvent, setSelectedEvent] = useState<EventSlug | null>(
    urlEvent && onlineEvents.some((e) => e.slug === urlEvent) ? urlEvent : null
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [warRoomMembers, setWarRoomMembers] = useState(["", "", "", ""]);
  const [rouletteMembers, setRouletteMembers] = useState(["", "", "", ""]);

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        if (data.events && Array.isArray(data.events) && data.events.length > 0) {
          setEventsList(data.events);
        }
      })
      .catch((err) => console.error("Could not fetch dynamic events", err));
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      selectedEvents: selectedEvent ? [selectedEvent] : [],
      confirmedRules: true,
      startupRoulette: {
        teamName: "",
        teamLeaderName: "",
        teamMembersNames: "",
        ideaName: "",
        ideaDescription: "",
      },
      theWarRoom: {
        teamName: "",
        teamLeaderName: "",
        teamMembersNames: "",
      },
      theBoardroom: {
        teamName: "",
        teamLeaderName: "",
        teamMembersNames: "",
      },
      entrePrenormie: {
        founderDiscussionTopic: "",
      },
    },
  });

  // Sync state if URL changes (e.g. browser back/forward or direct navigation)
  useEffect(() => {
    if (urlEvent && ONLINE_EVENTS.some((e) => e.slug === urlEvent)) {
      setSelectedEvent(urlEvent);
      setValue("selectedEvents", [urlEvent], { shouldValidate: true });
    } else if (!urlEvent) {
      setSelectedEvent(null);
      setValue("selectedEvents", [], { shouldValidate: false });
    }
  }, [urlEvent, setValue]);

  const handleSelectEvent = (slug: EventSlug) => {
    setSelectedEvent(slug);
    setValue("selectedEvents", [slug], { shouldValidate: true });
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", `/register?event=${slug}`);
    }
    router.replace(`/register?event=${slug}`, { scroll: false });
  };

  const handleBackToEventSelection = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSelectedEvent(null);
    setValue("selectedEvents", [], { shouldValidate: false });
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/register");
    }
    router.replace("/register", { scroll: false });
  };


  const currentEventData: EventItem | undefined = eventsList.find(
    (e) => e.slug === selectedEvent
  );

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to submit registration");
      }

      setSubmissionResult(json);
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#7C3AED", "#C6F135", "#FF5A36", "#2F6FED", "#0A0A0A"],
        });
      } catch (e) {
        // ignore confetti errors in non-browser env
      }
    } catch (err: any) {
      setSubmitError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // SUCCESS / RECEIPT SCREEN
  // -------------------------------------------------------------
  if (submissionResult) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-3xl border-4 border-brand-ink p-8 sm:p-12 shadow-2xl text-center">
        <div className="w-20 h-20 rounded-3xl bg-brand-lime text-black flex items-center justify-center mx-auto mb-6 shadow-lg rotate-3">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="text-xs font-black uppercase tracking-widest text-brand-violet bg-brand-violet/10 px-3 py-1 rounded-full">
          REGISTRATION CONFIRMED
        </span>

        <h2 className="font-display text-4xl sm:text-5xl font-black uppercase text-brand-ink mt-3 mb-2">
          YOU'RE IN THE VALLEY!
        </h2>

        <p className="text-sm font-semibold text-zinc-600 max-w-md mx-auto mb-8">
          Your pass for <strong>{currentEventData?.name || "Cabinet Valley"}</strong> has been registered. Present this pass code at the verification desk.
        </p>

        {/* Pass Badge */}
        <div className="p-6 bg-brand-ink text-white rounded-2xl text-left font-mono mb-8 border-2 border-brand-violet">
          <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-3">
            <div>
              <div className="text-[10px] text-zinc-400 uppercase">PASS CODE</div>
              <div className="text-lg font-black text-brand-lime">{submissionResult.submissionCode}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-zinc-400 uppercase">DATES</div>
              <div className="text-xs font-bold text-white">SEPTEMBER 24–26, 2026</div>
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-400">PARTICIPANT:</span>
              <span className="font-bold text-white uppercase">{submissionResult.data?.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">EMAIL:</span>
              <span className="text-zinc-200">{submissionResult.data?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">REGISTERED EVENT:</span>
              <span className="font-bold text-brand-lime uppercase">
                {currentEventData?.name || selectedEvent}
              </span>
            </div>
            {currentEventData?.venue && (
              <div className="flex justify-between">
                <span className="text-zinc-400">VENUE:</span>
                <span className="text-zinc-200">{currentEventData.venue}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => window.print()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-brand-ink text-white font-black text-xs uppercase tracking-wider hover:bg-brand-violet transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>PRINT / SAVE PASS</span>
          </button>

          <button
            onClick={() => {
              setSubmissionResult(null);
              reset();
              handleBackToEventSelection();
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border-2 border-brand-ink text-brand-ink font-black text-xs uppercase tracking-wider hover:bg-zinc-100 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>REGISTER FOR ANOTHER EVENT</span>
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STAGE 1: PROMPT PARTICIPANT TO CHOOSE WHICH EVENT TO REGISTER FOR
  // -------------------------------------------------------------
  if (!selectedEvent) {
    return (
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-lime text-black font-black text-[11px] uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>STEP 1: SELECT YOUR EVENT TRACK</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-black uppercase text-brand-ink">
            CHOOSE YOUR COMPETITION
          </h2>
          <p className="mt-2 text-xs sm:text-sm font-semibold text-zinc-500 uppercase tracking-wide">
            Select the specific competitive event you want to participate in to open its dedicated registration portal.
          </p>
        </div>

        {/* 5 Online Event Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {onlineEvents.map((event) => {
            const IconComponent = ICON_MAP[event.iconName] || Sparkles;

            return (
              <div
                key={event.id}
                onClick={() => handleSelectEvent(event.slug as EventSlug)}
                className="group cursor-pointer rounded-3xl bg-white border-2 border-brand-ink/10 hover:border-brand-ink p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-xl relative overflow-hidden"
              >
                {/* Top: Icon + Date Badge */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-110"
                      style={{ backgroundColor: event.badgeColor }}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>

                    <span className="font-mono text-xs font-black uppercase px-3 py-1 rounded-full bg-brand-surface border border-brand-border text-brand-ink">
                      {event.dateLabel}
                    </span>
                  </div>

                  <h3 className="font-display text-2xl font-black uppercase tracking-wide text-brand-ink group-hover:text-brand-violet transition-colors mb-2">
                    {event.name}
                  </h3>

                  <p className="text-xs font-semibold text-zinc-600 line-clamp-2 mb-4">
                    {event.description}
                  </p>
                </div>

                {/* Bottom: Specs & CTA Button */}
                <div className="space-y-3 pt-4 border-t border-zinc-100">
                  <div className="flex flex-col gap-1 text-[11px] font-bold text-zinc-500">
                    {/* <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-brand-violet" />
                      <span>{event.timing}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-brand-violet" />
                      <span>{event.venue}</span>
                    </div> */}
                    <div className="flex items-center gap-1.5 text-brand-ink">
                      <Users className="w-3.5 h-3.5 text-brand-violet" />
                      <span className="font-black uppercase">{event.teamSize}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="w-full py-2.5 px-4 rounded-xl bg-brand-ink group-hover:bg-brand-violet text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <span>REGISTER FOR THIS EVENT</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bay Area Stalls MS Forms Booking Banner */}
        <div className="rounded-3xl border-2 border-brand-violet/40 bg-gradient-to-r from-purple-50 via-white to-orange-50 p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-violet text-white flex items-center justify-center flex-shrink-0 shadow-md">
              <Store className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-brand-violet text-white text-[10px] font-black uppercase tracking-wider">
                  COMMERCIAL & STARTUP STALLS
                </span>
                <span className="text-xs font-bold text-zinc-500 font-mono">
                  NEAR C5 & D5 HOSTELS · 55 UNITS
                </span>
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-black uppercase text-brand-ink">
                LOOKING TO BOOK A BAY AREA STALL?
              </h3>
              <p className="text-xs font-semibold text-zinc-600 max-w-2xl mt-1 leading-relaxed">
                Stall allotment for student ventures and commercial brands is open via our official Microsoft Form. Submit your application to secure your booth near C5 & D5 Hostels.
              </p>
            </div>
          </div>

          <a
            href="https://forms.cloud.microsoft/r/JFgLTYxc8m"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-brand-violet hover:bg-brand-violet-dark text-white text-xs font-black uppercase tracking-wider transition-all transform hover:scale-105 active:scale-95 shadow-md shadow-brand-violet/20 flex-shrink-0 w-full sm:w-auto"
          >
            <span>APPLY FOR STALL</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }


  // -------------------------------------------------------------
  // STAGE 2: DEDICATED REGISTRATION FORM FOR THE CHOSEN EVENT
  // -------------------------------------------------------------
  const IconComp = currentEventData?.iconName
    ? ICON_MAP[currentEventData.iconName] || Sparkles
    : Sparkles;

  return (
    <div className="space-y-8">
      {/* Top Switcher Bar */}
      <div className="flex items-center justify-between pb-2">
        <button
          type="button"
          onClick={handleBackToEventSelection}
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-brand-ink hover:text-brand-violet transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>CHOOSE A DIFFERENT EVENT</span>
        </button>
      </div>

      {/* Selected Event Spotlight Banner */}
      {currentEventData && (
        <div className="bg-brand-ink text-white rounded-3xl p-6 sm:p-8 border-2 border-brand-violet shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/20">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md flex-shrink-0"
                style={{ backgroundColor: currentEventData.badgeColor }}
              >
                <IconComp className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-brand-lime text-black text-[10px] font-black uppercase">
                    {currentEventData.dateLabel}
                  </span>
                  <span className="text-xs font-mono font-bold text-white/70">
                    SEPTEMBER 24–26
                  </span>
                </div>
                <h2 className="font-display text-2xl sm:text-4xl font-black uppercase tracking-wide text-white">
                  {currentEventData.name}
                </h2>
              </div>
            </div>

            <div className="flex flex-col items-start sm:items-end text-xs font-mono text-white/80">
              <span className="font-black uppercase text-brand-lime text-sm">
                {currentEventData.teamSize}
              </span>
              <span>{currentEventData.venue}</span>
              <span>{currentEventData.timing}</span>
            </div>
          </div>

          <p className="pt-4 text-xs sm:text-sm text-zinc-300 font-medium">
            {currentEventData.description}
          </p>
        </div>
      )}

      {/* Dedicated Single-Event Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Step 1: Participant Information */}
        <div className="bg-white rounded-3xl border-2 border-brand-ink/20 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-zinc-200">
            <div className="w-8 h-8 rounded-xl bg-brand-ink text-white flex items-center justify-center font-display font-bold">
              01
            </div>
            <div>
              <h3 className="font-display text-2xl font-black uppercase text-brand-ink leading-tight">
                LEADER DETAILS
              </h3>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Point of contact for event credentials and access passes
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-brand-ink mb-1.5">
                FULL NAME <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Full Name"
                {...register("fullName")}
                className={`w-full px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-violet ${
                  errors.fullName ? "border-red-500 bg-red-50" : "border-zinc-300 focus:border-brand-ink"
                }`}
              />
              {errors.fullName && (
                <p className="mt-1 text-xs text-red-600 font-bold">{errors.fullName.message}</p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-brand-ink mb-1.5">
                EMAIL ADDRESS <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="e.g. enrollment@bennett.edu.in"
                {...register("email")}
                className={`w-full px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-violet ${
                  errors.email ? "border-red-500 bg-red-50" : "border-zinc-300 focus:border-brand-ink"
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600 font-bold">{errors.email.message}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-brand-ink mb-1.5">
                PHONE NUMBER <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="Phone number"
                {...register("phone")}
                className={`w-full px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-violet ${
                  errors.phone ? "border-red-500 bg-red-50" : "border-zinc-300 focus:border-brand-ink"
                }`}
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-600 font-bold">{errors.phone.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Step 2: Event-Specific Form Fields */}
        <div className="bg-white rounded-3xl border-2 border-brand-ink/20 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-zinc-200">
            <div className="w-8 h-8 rounded-xl bg-brand-violet text-white flex items-center justify-center font-display font-bold">
              02
            </div>
            <div>
              <h3 className="font-display text-2xl font-black uppercase text-brand-ink leading-tight">
                {currentEventData?.name} SPECIFICATIONS
              </h3>
              <p className="text-xs font-semibold text-brand-violet uppercase tracking-wider">
                Complete the dedicated requirements for this event
              </p>
            </div>
          </div>

          {/* 1. STARTUP ROULETTE FIELDS */}
          {selectedEvent === "startup-roulette" && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-black uppercase text-brand-ink mb-1">
                  TEAM NAME <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. ByteBrigade"
                  {...register("startupRoulette.teamName")}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-zinc-300 bg-white text-sm font-medium focus:border-brand-violet focus:outline-none"
                />
                {errors.startupRoulette?.teamName && (
                  <p className="mt-1 text-xs text-red-600 font-bold">{errors.startupRoulette.teamName.message}</p>
                )}
              </div>

              {/* Additional Team Members */}
              <div className="space-y-2 pt-2 border-t border-zinc-200">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black uppercase tracking-wider text-brand-ink">
                    TEAM MEMBERS&apos; NAMES <span className="text-red-500">*</span> (4 ADDITIONAL MEMBERS)
                  </label>
                  <span className="text-[11px] font-mono text-zinc-400 font-bold">5-MEMBER ROSTER</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-600 mb-1">
                      Member 2 Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={rouletteMembers[0]}
                      onChange={(e) => {
                        const updated = [...rouletteMembers];
                        updated[0] = e.target.value;
                        setRouletteMembers(updated);
                        setValue("startupRoulette.teamMembersNames", updated.join(", "), { shouldValidate: true });
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-zinc-300 bg-white text-sm font-medium focus:border-brand-violet focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-600 mb-1">
                      Member 3 Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={rouletteMembers[1]}
                      onChange={(e) => {
                        const updated = [...rouletteMembers];
                        updated[1] = e.target.value;
                        setRouletteMembers(updated);
                        setValue("startupRoulette.teamMembersNames", updated.join(", "), { shouldValidate: true });
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-zinc-300 bg-white text-sm font-medium focus:border-brand-violet focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-600 mb-1">
                      Member 4 Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={rouletteMembers[2]}
                      onChange={(e) => {
                        const updated = [...rouletteMembers];
                        updated[2] = e.target.value;
                        setRouletteMembers(updated);
                        setValue("startupRoulette.teamMembersNames", updated.join(", "), { shouldValidate: true });
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-zinc-300 bg-white text-sm font-medium focus:border-brand-violet focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-600 mb-1">
                      Member 5 Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={rouletteMembers[3]}
                      onChange={(e) => {
                        const updated = [...rouletteMembers];
                        updated[3] = e.target.value;
                        setRouletteMembers(updated);
                        setValue("startupRoulette.teamMembersNames", updated.join(", "), { shouldValidate: true });
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-zinc-300 bg-white text-sm font-medium focus:border-brand-violet focus:outline-none"
                    />
                  </div>
                </div>

                {errors.startupRoulette?.teamMembersNames && (
                  <p className="mt-1 text-xs text-red-600 font-bold">{errors.startupRoulette.teamMembersNames.message}</p>
                )}
              </div>
            </div>
          )}

          {/* 2. THE WAR ROOM FIELDS */}
          {selectedEvent === "the-war-room" && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-black uppercase text-brand-ink mb-1">
                  TEAM NAME <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apex Bidders"
                  {...register("theWarRoom.teamName")}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-zinc-300 bg-white text-sm font-medium focus:border-brand-violet focus:outline-none"
                />
                {errors.theWarRoom?.teamName && (
                  <p className="mt-1 text-xs text-red-600 font-bold">{errors.theWarRoom.teamName.message}</p>
                )}
              </div>

              {/* 4 Team Member Individual Fields */}
              <div className="space-y-2 pt-2 border-t border-zinc-200">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black uppercase tracking-wider text-brand-ink">
                    TEAM MEMBERS&apos; NAMES <span className="text-red-500">*</span> (4 ADDITIONAL MEMBERS)
                  </label>
                  <span className="text-[11px] font-mono text-zinc-400 font-bold">5-MEMBER ROSTER</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-600 mb-1">
                      Member 2 Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={warRoomMembers[0]}
                      onChange={(e) => {
                        const updated = [...warRoomMembers];
                        updated[0] = e.target.value;
                        setWarRoomMembers(updated);
                        setValue("theWarRoom.teamMembersNames", updated.join(", "), { shouldValidate: true });
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-zinc-300 bg-white text-sm font-medium focus:border-brand-violet focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-600 mb-1">
                      Member 3 Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={warRoomMembers[1]}
                      onChange={(e) => {
                        const updated = [...warRoomMembers];
                        updated[1] = e.target.value;
                        setWarRoomMembers(updated);
                        setValue("theWarRoom.teamMembersNames", updated.join(", "), { shouldValidate: true });
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-zinc-300 bg-white text-sm font-medium focus:border-brand-violet focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-600 mb-1">
                      Member 4 Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={warRoomMembers[2]}
                      onChange={(e) => {
                        const updated = [...warRoomMembers];
                        updated[2] = e.target.value;
                        setWarRoomMembers(updated);
                        setValue("theWarRoom.teamMembersNames", updated.join(", "), { shouldValidate: true });
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-zinc-300 bg-white text-sm font-medium focus:border-brand-violet focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-600 mb-1">
                      Member 5 Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={warRoomMembers[3]}
                      onChange={(e) => {
                        const updated = [...warRoomMembers];
                        updated[3] = e.target.value;
                        setWarRoomMembers(updated);
                        setValue("theWarRoom.teamMembersNames", updated.join(", "), { shouldValidate: true });
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-zinc-300 bg-white text-sm font-medium focus:border-brand-violet focus:outline-none"
                    />
                  </div>
                </div>

                {errors.theWarRoom?.teamMembersNames && (
                  <p className="mt-1 text-xs text-red-600 font-bold">{errors.theWarRoom.teamMembersNames.message}</p>
                )}
              </div>
            </div>
          )}

          {/* 3. THE BOARDROOM FIELDS */}
          {selectedEvent === "the-boardroom" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase text-brand-ink mb-1">
                  TEAM NAME <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. McKinsey Mavericks"
                  {...register("theBoardroom.teamName")}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-zinc-300 bg-white text-sm font-medium focus:border-brand-violet focus:outline-none"
                />
                {errors.theBoardroom?.teamName && (
                  <p className="mt-1 text-xs text-red-600 font-bold">{errors.theBoardroom.teamName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-brand-ink mb-1">
                  DUO PARTNER NAME <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Partner B"
                  {...register("theBoardroom.teamMembersNames")}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-zinc-300 bg-white text-sm font-medium focus:border-brand-violet focus:outline-none"
                />
                {errors.theBoardroom?.teamMembersNames && (
                  <p className="mt-1 text-xs text-red-600 font-bold">{errors.theBoardroom.teamMembersNames.message}</p>
                )}
              </div>
            </div>
          )}

          {/* 4. ENTRE-PRENORMIE FIELDS */}
          {selectedEvent === "entre-prenormie" && (
            <div>
              <label className="block text-xs font-black uppercase text-brand-ink mb-1.5">
                WHAT WOULD YOU LIKE TO DISCUSS WITH THE FOUNDER? <span className="text-zinc-400 font-normal">(OPTIONAL)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Share your current venture stage, specific bottleneck, career trajectory, or fundraising questions..."
                {...register("entrePrenormie.founderDiscussionTopic")}
                className="w-full px-4 py-3 rounded-xl border-2 border-zinc-300 bg-white text-sm font-medium focus:border-brand-violet focus:outline-none"
              />
              <p className="mt-2 text-xs font-semibold text-zinc-500">
                ✓ Individual track: Closed-door 1-to-1 session. Schedule slot will be sent to your email.
              </p>
            </div>
          )}

          {/* 5. BULLS & BEARS FIELDS */}
          {selectedEvent === "bulls-and-bears" && (
            <div className="p-4 bg-brand-lime/20 rounded-2xl border border-brand-lime text-brand-ink">
              <h4 className="font-display text-lg font-black uppercase mb-1">
                INDIVIDUAL TRADING TERMINAL ACCESS
              </h4>
              <p className="text-xs font-bold text-zinc-700">
                ✓ No team formation required. Your personal trading terminal credentials for Day 3 (Terminal Lab 1) will be issued upon pass generation.
              </p>
            </div>
          )}
        </div>


        {/* Step 3: Confirmation Checkbox */}
        <div className="bg-white rounded-3xl border-2 border-brand-ink/20 p-6 sm:p-8">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              {...register("confirmedRules")}
              className="w-5 h-5 mt-0.5 rounded text-brand-violet focus:ring-brand-violet border-zinc-300"
            />
            <span className="text-xs sm:text-sm font-bold text-brand-ink leading-relaxed">
              I confirm that the information provided is correct and agree to follow the rules and guidelines of Cabinet Valley.
            </span>
          </label>
          {errors.confirmedRules && (
            <p className="mt-2 text-xs text-red-600 font-bold ml-8">{errors.confirmedRules.message}</p>
          )}
        </div>

        {/* Error Alert */}
        {submitError && (
          <div className="p-4 bg-red-50 border-2 border-red-500 text-red-700 text-xs font-bold rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Submit & Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={handleBackToEventSelection}
            className="w-full sm:w-auto px-6 py-3 rounded-full border-2 border-zinc-300 text-zinc-700 hover:border-brand-ink hover:text-brand-ink font-bold text-xs uppercase tracking-wider transition-colors"
          >
            ← BACK TO EVENT LIST
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-brand-violet hover:bg-brand-ink text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            {isSubmitting ? (
              <span>SECURING YOUR PASS...</span>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5 text-brand-lime" />
                <span>CONFIRM & REGISTER FOR {currentEventData?.name || "EVENT"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
