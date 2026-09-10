"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import confetti from "canvas-confetti";
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Store,
  Swords,
  Briefcase,
  Users,
  TrendingUp,
  Download,
  RotateCcw,
} from "lucide-react";
import { registrationSchema, RegistrationFormData, EventSlug } from "@/lib/schema";
import { EVENTS_DATA } from "@/lib/mock-data";

export default function RegistrationForm() {
  const searchParams = useSearchParams();
  const preselectedEvent = searchParams.get("event") as EventSlug | null;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      selectedEvents: preselectedEvent ? [preselectedEvent] : ["startup-roulette"],
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
      bayArea: {
        stallName: "",
        contactPerson: "",
        phoneNumber: "",
        stallType: "main",
      },
    },
  });

  const selectedEvents = watch("selectedEvents") || [];

  // Toggle event selection in multi-select array
  const toggleEventSelection = (slug: EventSlug) => {
    if (selectedEvents.includes(slug)) {
      if (selectedEvents.length === 1) return; // Keep at least one
      setValue(
        "selectedEvents",
        selectedEvents.filter((item) => item !== slug),
        { shouldValidate: true }
      );
    } else {
      setValue("selectedEvents", [...selectedEvents, slug], { shouldValidate: true });
    }
  };

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
          Your registration has been securely logged. Present this pass at the registration desk on Day 1.
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
              <div className="text-xs font-bold text-white">OCT 14–16, 2026</div>
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
            <div className="flex justify-between pt-2 border-t border-white/10">
              <span className="text-zinc-400">TRACKS:</span>
              <span className="font-bold text-brand-lime uppercase">
                {submissionResult.data?.selectedEvents?.join(", ")}
              </span>
            </div>
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
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border-2 border-brand-ink text-brand-ink font-black text-xs uppercase tracking-wider hover:bg-zinc-100 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>REGISTER ANOTHER</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
      
      {/* 1. Basic Participant Details */}
      <div className="bg-white rounded-3xl border-2 border-brand-ink/20 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 pb-4 mb-6 border-b border-zinc-200">
          <div className="w-8 h-8 rounded-xl bg-brand-ink text-white flex items-center justify-center font-display font-bold">
            01
          </div>
          <div>
            <h3 className="font-display text-2xl font-black uppercase text-brand-ink leading-tight">
              BASIC PARTICIPANT DETAILS
            </h3>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Primary registrant & point of contact
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
              placeholder="e.g. Satveek Gupta"
              {...register("fullName")}
              className={`w-full px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-violet ${
                errors.fullName ? "border-red-500 bg-red-50" : "border-zinc-300 focus:border-brand-ink"
              }`}
            />
            {errors.fullName && (
              <p className="mt-1 text-xs text-red-600 font-bold">{errors.fullName.message}</p>
            )}
          </div>

          {/* Email ID */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-brand-ink mb-1.5">
              EMAIL ADDRESS <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="e.g. satveek@cabinet.edu"
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
              placeholder="e.g. 9876543210"
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

      {/* 2. Event Selection (Multi-Select) */}
      <div className="bg-white rounded-3xl border-2 border-brand-ink/20 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 pb-4 mb-6 border-b border-zinc-200">
          <div className="w-8 h-8 rounded-xl bg-brand-violet text-white flex items-center justify-center font-display font-bold">
            02
          </div>
          <div>
            <h3 className="font-display text-2xl font-black uppercase text-brand-ink leading-tight">
              SELECT EVENTS & TRACKS
            </h3>
            <p className="text-xs font-semibold text-brand-violet uppercase tracking-wider">
              Choose one or more tracks you wish to participate in
            </p>
          </div>
        </div>

        {errors.selectedEvents && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errors.selectedEvents.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {EVENTS_DATA.map((event) => {
            const isSelected = selectedEvents.includes(event.slug as EventSlug);

            return (
              <div
                key={event.id}
                onClick={() => toggleEventSelection(event.slug as EventSlug)}
                className={`cursor-pointer rounded-2xl p-5 border-2 transition-all flex flex-col justify-between select-none ${
                  isSelected
                    ? "bg-brand-violet text-white border-brand-violet shadow-md scale-[1.01]"
                    : "bg-brand-surface hover:bg-white border-zinc-300 text-brand-ink"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isSelected ? "bg-brand-lime text-black" : "bg-zinc-200 text-zinc-700"
                      }`}
                    >
                      {event.dateLabel}
                    </span>
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                        isSelected ? "bg-brand-lime border-brand-lime text-black" : "border-zinc-400 bg-white"
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-4 h-4 fill-current" />}
                    </span>
                  </div>

                  <h4 className="font-display text-xl font-bold uppercase tracking-wide leading-none mb-1">
                    {event.name}
                  </h4>
                  <p
                    className={`text-xs line-clamp-2 font-medium ${
                      isSelected ? "text-white/80" : "text-zinc-500"
                    }`}
                  >
                    {event.tagline}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-current/10 text-[10px] font-bold uppercase tracking-wider flex items-center justify-between">
                  <span>{event.teamSize}</span>
                  <span>{event.format}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Conditional Event-Specific Form Sections */}
      
      {/* 3A. Startup Roulette Fields */}
      {selectedEvents.includes("startup-roulette") && (
        <div className="bg-[#FFF5F2] rounded-3xl border-2 border-[#FF5A36] p-6 sm:p-8">
          <div className="flex items-center gap-3 pb-3 mb-6 border-b border-[#FF5A36]/30">
            <span className="px-3 py-1 rounded-full bg-[#FF5A36] text-white text-[10px] font-black uppercase">
              TRACK: STARTUP ROULETTE
            </span>
            <span className="text-xs font-bold text-zinc-600">5 Members · 3 Pitch Rounds</span>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase text-brand-ink mb-1">
                  TEAM NAME <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Quantum Founders"
                  {...register("startupRoulette.teamName")}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-zinc-300 bg-white text-sm font-medium focus:border-[#FF5A36] focus:outline-none"
                />
                {errors.startupRoulette?.teamName && (
                  <p className="mt-1 text-xs text-red-600 font-bold">{errors.startupRoulette.teamName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-brand-ink mb-1">
                  TEAM LEADER NAME <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lead Pitcher"
                  {...register("startupRoulette.teamLeaderName")}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-zinc-300 bg-white text-sm font-medium focus:border-[#FF5A36] focus:outline-none"
                />
                {errors.startupRoulette?.teamLeaderName && (
                  <p className="mt-1 text-xs text-red-600 font-bold">{errors.startupRoulette.teamLeaderName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-brand-ink mb-1">
                TEAM MEMBERS' NAMES (UP TO 5) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Member 1, Member 2, Member 3, Member 4, Member 5"
                {...register("startupRoulette.teamMembersNames")}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-zinc-300 bg-white text-sm font-medium focus:border-[#FF5A36] focus:outline-none"
              />
              {errors.startupRoulette?.teamMembersNames && (
                <p className="mt-1 text-xs text-red-600 font-bold">{errors.startupRoulette.teamMembersNames.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase text-brand-ink mb-1">
                  STARTUP IDEA NAME <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. SolarDrop Logistics"
                  {...register("startupRoulette.ideaName")}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-zinc-300 bg-white text-sm font-medium focus:border-[#FF5A36] focus:outline-none"
                />
                {errors.startupRoulette?.ideaName && (
                  <p className="mt-1 text-xs text-red-600 font-bold">{errors.startupRoulette.ideaName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-brand-ink mb-1">
                  BRIEF IDEA DESCRIPTION <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Briefly describe what your venture solves..."
                  {...register("startupRoulette.ideaDescription")}
                  className="w-full px-4 py-2 rounded-xl border-2 border-zinc-300 bg-white text-sm font-medium focus:border-[#FF5A36] focus:outline-none"
                />
                {errors.startupRoulette?.ideaDescription && (
                  <p className="mt-1 text-xs text-red-600 font-bold">{errors.startupRoulette.ideaDescription.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3B. The War Room Fields */}
      {selectedEvents.includes("the-war-room") && (
        <div className="bg-[#F0F5FF] rounded-3xl border-2 border-[#2F6FED] p-6 sm:p-8">
          <div className="flex items-center gap-3 pb-3 mb-6 border-b border-[#2F6FED]/30">
            <span className="px-3 py-1 rounded-full bg-[#2F6FED] text-white text-[10px] font-black uppercase">
              TRACK: THE WAR ROOM
            </span>
            <span className="text-xs font-bold text-zinc-600">5 Members · Live Auction & Pitch Battle</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-black uppercase text-brand-ink mb-1">
                WAR ROOM TEAM NAME <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Citadel Syndicate"
                {...register("theWarRoom.teamName")}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-zinc-300 bg-white text-sm font-medium focus:border-[#2F6FED] focus:outline-none"
              />
              {errors.theWarRoom?.teamName && (
                <p className="mt-1 text-xs text-red-600 font-bold">{errors.theWarRoom.teamName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-brand-ink mb-1">
                TEAM LEADER NAME <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Lead Strategist"
                {...register("theWarRoom.teamLeaderName")}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-zinc-300 bg-white text-sm font-medium focus:border-[#2F6FED] focus:outline-none"
              />
              {errors.theWarRoom?.teamLeaderName && (
                <p className="mt-1 text-xs text-red-600 font-bold">{errors.theWarRoom.teamLeaderName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-brand-ink mb-1">
                MEMBERS' NAMES (UP TO 5) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Member 1, 2, 3, 4, 5"
                {...register("theWarRoom.teamMembersNames")}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-zinc-300 bg-white text-sm font-medium focus:border-[#2F6FED] focus:outline-none"
              />
              {errors.theWarRoom?.teamMembersNames && (
                <p className="mt-1 text-xs text-red-600 font-bold">{errors.theWarRoom.teamMembersNames.message}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3C. The Boardroom Fields */}
      {selectedEvents.includes("the-boardroom") && (
        <div className="bg-[#FFF5F2] rounded-3xl border-2 border-[#FF5A36] p-6 sm:p-8">
          <div className="flex items-center gap-3 pb-3 mb-6 border-b border-[#FF5A36]/30">
            <span className="px-3 py-1 rounded-full bg-[#FF5A36] text-white text-[10px] font-black uppercase">
              TRACK: THE BOARDROOM
            </span>
            <span className="text-xs font-bold text-zinc-600">2 Members (Duos) · Executive Case Study</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-black uppercase text-brand-ink mb-1">
                DUO / TEAM NAME <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. McKinsey Mavericks"
                {...register("theBoardroom.teamName")}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-zinc-300 bg-white text-sm font-medium focus:border-[#FF5A36] focus:outline-none"
              />
              {errors.theBoardroom?.teamName && (
                <p className="mt-1 text-xs text-red-600 font-bold">{errors.theBoardroom.teamName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-brand-ink mb-1">
                PRIMARY LEAD <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Partner A"
                {...register("theBoardroom.teamLeaderName")}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-zinc-300 bg-white text-sm font-medium focus:border-[#FF5A36] focus:outline-none"
              />
              {errors.theBoardroom?.teamLeaderName && (
                <p className="mt-1 text-xs text-red-600 font-bold">{errors.theBoardroom.teamLeaderName.message}</p>
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
                className="w-full px-4 py-2.5 rounded-xl border-2 border-zinc-300 bg-white text-sm font-medium focus:border-[#FF5A36] focus:outline-none"
              />
              {errors.theBoardroom?.teamMembersNames && (
                <p className="mt-1 text-xs text-red-600 font-bold">{errors.theBoardroom.teamMembersNames.message}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3D. Entre-Prenormie Fields */}
      {selectedEvents.includes("entre-prenormie") && (
        <div className="bg-[#FAF5FF] rounded-3xl border-2 border-brand-violet p-6 sm:p-8">
          <div className="flex items-center gap-3 pb-3 mb-6 border-b border-brand-violet/30">
            <span className="px-3 py-1 rounded-full bg-brand-violet text-white text-[10px] font-black uppercase">
              TRACK: ENTRE-PRENORMIE
            </span>
            <span className="text-xs font-bold text-zinc-600">Individual · 1-on-1 Founder Mentorship</span>
          </div>

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
          </div>
        </div>
      )}

      {/* 3E. Bulls & Bears Info Note */}
      {selectedEvents.includes("bulls-and-bears") && (
        <div className="bg-brand-lime/20 rounded-3xl border-2 border-brand-lime p-6 sm:p-8 text-brand-ink">
          <div className="flex items-center gap-3 pb-3 mb-3 border-b border-black/10">
            <span className="px-3 py-1 rounded-full bg-black text-brand-lime text-[10px] font-black uppercase">
              TRACK: BULLS & BEARS
            </span>
            <span className="text-xs font-bold text-brand-ink">Speed Stock Quiz & Real-Time Trading Simulation</span>
          </div>
          <p className="text-xs font-bold uppercase tracking-wide text-black/80">
            ✓ Individual track: No extra team fields required. Terminal access code will be emailed upon confirmation.
          </p>
        </div>
      )}

      {/* 3F. Bay Area (Stall Registration) */}
      {selectedEvents.includes("bay-area") && (
        <div className="bg-[#FAF5FF] rounded-3xl border-2 border-brand-violet p-6 sm:p-8">
          <div className="flex items-center justify-between pb-3 mb-6 border-b border-brand-violet/30">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-brand-violet text-white text-[10px] font-black uppercase">
                TRACK: BAY AREA STALLS
              </span>
              <span className="text-xs font-bold text-zinc-600">Day 1 & Day 2 Commercial Floor</span>
            </div>
            <span className="font-mono text-xs font-black text-brand-violet">₹4,000 / MAIN STALL</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-black uppercase text-brand-ink mb-1">
                STALL / BUSINESS NAME <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Nitro Brew Cafe"
                {...register("bayArea.stallName")}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-zinc-300 bg-white text-sm font-medium focus:border-brand-violet focus:outline-none"
              />
              {errors.bayArea?.stallName && (
                <p className="mt-1 text-xs text-red-600 font-bold">{errors.bayArea.stallName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-brand-ink mb-1">
                CONTACT PERSON <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Business Lead"
                {...register("bayArea.contactPerson")}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-zinc-300 bg-white text-sm font-medium focus:border-brand-violet focus:outline-none"
              />
              {errors.bayArea?.contactPerson && (
                <p className="mt-1 text-xs text-red-600 font-bold">{errors.bayArea.contactPerson.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-brand-ink mb-1">
                STALL PHONE <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="e.g. 9876543210"
                {...register("bayArea.phoneNumber")}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-zinc-300 bg-white text-sm font-medium focus:border-brand-violet focus:outline-none"
              />
              {errors.bayArea?.phoneNumber && (
                <p className="mt-1 text-xs text-red-600 font-bold">{errors.bayArea.phoneNumber.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-brand-ink mb-1">
                STALL TYPE <span className="text-red-500">*</span>
              </label>
              <select
                {...register("bayArea.stallType")}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-zinc-300 bg-white text-sm font-medium focus:border-brand-violet focus:outline-none"
              >
                <option value="main">Main Stall (German Hangar - ₹4,000)</option>
                <option value="food">Food Stall (D5 Stage Ground)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 4. Confirmation Checkbox */}
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

      {/* Submit Error */}
      {submitError && (
        <div className="p-4 bg-red-50 border-2 border-red-500 text-red-700 text-xs font-bold rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex items-center justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full bg-brand-violet hover:bg-brand-violet-dark text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-brand-violet/30 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          {isSubmitting ? (
            <span>PROCESSING REGISTRATION...</span>
          ) : (
            <>
              <span>CONFIRM & REGISTER PASS</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

    </form>
  );
}
