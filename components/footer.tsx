"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Instagram, Linkedin } from "lucide-react";
import CountdownWidget from "@/components/countdown-widget";
import AnimatedGridPattern from "@/components/magicui/animated-grid-pattern";

export default function Footer() {
  const SOCIAL_LINKS = [
    {
      name: "X (Twitter)",
      href: "https://x.com/SCSETBennett",
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      )
    },
    {
      name: "Instagram",
      href: "https://www.instagram.com/bu.cabinet/",
      icon: <Instagram className="w-3.5 h-3.5" />
    },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/company/scset-student-cabinet-bennett-university/home/",
      icon: <Linkedin className="w-3.5 h-3.5" />
    }
  ];

  return (
    <footer className="relative w-full bg-brand-violet text-white pt-16 pb-12 overflow-hidden border-t-4 border-brand-ink">
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.10}
        duration={4}
        repeatDelay={1}
        className="[mask-image:radial-gradient(600px_circle_at_center,white,transparent)] inset-0 text-white"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-white/20">
          
          {/* Column 1: Brandmark & Tagline */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/20 bg-white p-1">
                  <Image
                    src="/Cabinet Assets/cabinet-square-logo-white-bg.png"
                    alt="Student Cabinet Logo"
                    width={48}
                    height={48}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-black uppercase text-white leading-none">
                    STUDENT CABINET
                  </h3>
                </div>
              </div>

              <p className="text-xs text-white/80 font-medium max-w-sm mb-6">
                Organized by the Student Cabinet. 3 days of high-intensity startup battles, real-time trading simulations, and 55 dynamic startup & commercial stalls.
              </p>
            </div>

            {/* Tag pills */}
            <div className="flex flex-wrap gap-2">
              <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/40 text-white border border-white/10">
                SEPTEMBER 24–26
              </span>
              <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-lime text-black font-bold">
                6 TRACKS
              </span>
              <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#FF5A36] text-white">
                FOUNDER&apos;S OFFICE
              </span>
            </div>
          </div>

          {/* Column 2: Event Tracks Links */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-brand-lime mb-4">
              EVENT TRACKS
            </h4>
            <ul className="space-y-2.5 text-xs font-bold uppercase tracking-wider text-white/90">
              <li>
                <Link href="#events" className="hover:text-brand-lime transition-colors">
                  Startup Roulette
                </Link>
              </li>
              <li>
                <Link href="#events" className="hover:text-brand-lime transition-colors">
                  Bay Area Stalls
                </Link>
              </li>
              <li>
                <Link href="#events" className="hover:text-brand-lime transition-colors">
                  The War Room
                </Link>
              </li>
              <li>
                <Link href="#events" className="hover:text-brand-lime transition-colors">
                  The Boardroom
                </Link>
              </li>
              <li>
                <Link href="#events" className="hover:text-brand-lime transition-colors">
                  Entrepre-Normie
                </Link>
              </li>
              <li>
                <Link href="#events" className="hover:text-brand-lime transition-colors">
                  Bulls & Bears
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Navigation & Admin */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-black uppercase tracking-widest text-brand-lime mb-4">
              EXPLORE
            </h4>
            <ul className="space-y-2.5 text-xs font-bold uppercase tracking-wider text-white/90">
              <li>
                <Link href="#overview" className="hover:text-brand-lime transition-colors">
                  Overview
                </Link>
              </li>
              <li>
                <Link href="#timeline" className="hover:text-brand-lime transition-colors">
                  3-Day Schedule
                </Link>
              </li>
              <li>
                <Link href="#sponsors" className="hover:text-brand-lime transition-colors">
                  Sponsors
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-brand-lime transition-colors">
                  Registration
                </Link>
              </li>
              <li>
                <Link href="/my-registrations" className="hover:text-brand-lime text-brand-lime transition-colors flex items-center gap-1">
                  <span>My Passes (QR)</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Countdown & Quick Action */}
          <div className="lg:col-span-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/70">
                  FEST COUNTDOWN
                </span>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black text-brand-lime hover:bg-white hover:text-black text-[10px] font-black uppercase tracking-wider transition-colors"
                >
                  <span>JOIN NOW</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="p-4 bg-black/40 rounded-2xl border border-white/10">
                <CountdownWidget />
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2.5 mt-6">
              {SOCIAL_LINKS.map((item, idx) => (
                <a
                  key={idx}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.name}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white hover:text-brand-violet flex items-center justify-center transition-all text-white hover:scale-105"
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-white/70">
          <div>
            © 2026 CABINET VALLEY. ALL RIGHTS RESERVED. ORGANIZED BY THE STUDENT CABINET.
          </div>
          <div className="text-white/80 font-medium">
            Built with ❤️ by{" "}
            <a
              href="https://www.linkedin.com/in/satveek-gupta/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-lime font-bold hover:underline transition-colors"
            >
              Satveek Gupta
            </a>
            , Deputy Minister of Digital Infrastructure
          </div>
        </div>

      </div>
    </footer>
  );
}
