import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import RegistrationForm from "@/components/register/registration-form";
import AnimatedGridPattern from "@/components/magicui/animated-grid-pattern";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register & Join Tracks | CABINET VALLEY 2026",
  description: "Official registration portal for Cabinet Valley 2026. Register for Startup Roulette, The War Room, The Boardroom, Entre-Prenormie, Bulls & Bears, or book a Bay Area stall.",
  keywords: [
    "Cabinet Valley Registration",
    "Startup Roulette Registration",
    "The War Room",
    "The Boardroom Case Study",
    "Bay Area Stalls Booking",
    "Bulls and Bears Trading",
    "Student Fest Registration 2026"
  ],
  alternates: {
    canonical: "/register",
  },
  openGraph: {
    title: "Register for CABINET VALLEY 2026",
    description: "Secure your pass for 3 days of startup battles, trading competitions, and Bay Area stalls.",
    url: "/register",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Register for CABINET VALLEY 2026",
    description: "Secure your pass for 3 days of startup battles, trading competitions, and Bay Area stalls.",
  },
};

export default function RegisterPage() {
  return (
    <div className="relative min-h-screen bg-[#FBFBFC] text-brand-ink selection:bg-brand-violet selection:text-white pb-20 overflow-hidden">
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.12}
        duration={3.5}
        repeatDelay={1}
        className="[mask-image:radial-gradient(600px_circle_at_center,white,transparent)] inset-0 text-brand-violet"
      />

      
      {/* Top Bar */}
      <div className="w-full bg-white border-b-2 border-brand-ink/10 py-4 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-brand-ink hover:text-brand-violet transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO HOME</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-lime" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              REGISTRATION OPEN
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14">
        
        {/* Page Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brand-violet text-white text-xs font-black uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>FESTIVAL ACCESS PASS</span>
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-black uppercase tracking-wide text-brand-ink">
            JOIN CABINET VALLEY
          </h1>
          <p className="mt-2 text-xs sm:text-sm font-semibold text-zinc-500 uppercase tracking-wider max-w-lg mx-auto">
            Choose one or more tracks: Startup Roulette, The War Room, The Boardroom, Entre-Prenormie, Bulls & Bears, or Bay Area Stalls.
          </p>
        </div>

        {/* Registration Form in Suspense */}
        <Suspense fallback={<div className="text-center py-20 font-bold uppercase text-xs">Loading form...</div>}>
          <RegistrationForm />
        </Suspense>

      </div>
    </div>
  );
}
