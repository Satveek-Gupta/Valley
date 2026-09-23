"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowUpRight,
  Sparkles,
  Calendar,
  Clock,
  Award,
  QrCode,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Overview",
    href: "/#overview",
    description: "What is Cabinet Valley 2026",
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    label: "Events & Tracks",
    href: "/#events",
    description: "5 Flagship competitions & arenas",
    icon: <Calendar className="w-4 h-4" />,
  },
  {
    label: "Festival Timeline",
    href: "/#timeline",
    description: "3-Day schedule & arena timetable",
    icon: <Clock className="w-4 h-4" />,
  },
  {
    label: "Sponsors & Prizes",
    href: "/#sponsors",
    description: "Prizes, mentors & industry partners",
    icon: <Award className="w-4 h-4" />,
  },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Automatically close mobile menu and unlock body scroll on route change
  useEffect(() => {
    document.body.style.overflow = "";
    setIsOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        document.body.style.overflow = "";
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Helper for smooth scrolling with Lenis or native scrollTo with header offset
  const scrollToTarget = (targetId: string) => {
    const element = document.getElementById(targetId);
    if (!element) return;

    const lenis = typeof window !== "undefined" ? (window as any).lenis : null;
    if (lenis && typeof lenis.scrollTo === "function") {
      lenis.scrollTo(element, { offset: -80, duration: 1.1 });
    } else {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  // Handle mobile drawer link taps
  const handleMobileLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // 1. Immediately unlock scroll
    document.body.style.overflow = "";
    setIsOpen(false);

    if (href.startsWith("/#")) {
      const targetId = href.replace("/#", "");
      if (pathname === "/") {
        e.preventDefault();
        if (typeof window !== "undefined") {
          window.history.pushState(null, "", `#${targetId}`);
          setTimeout(() => {
            scrollToTarget(targetId);
          }, 80);
        }
      }
    }
  };

  // Handle desktop hash navigation
  const handleDesktopHashClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("/#") && pathname === "/") {
      e.preventDefault();
      const targetId = href.replace("/#", "");
      if (typeof window !== "undefined") {
        window.history.pushState(null, "", `#${targetId}`);
        scrollToTarget(targetId);
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top Navbar Bar (Backdrop filter isolated here so position:fixed drawer is not trapped) */}
      <div className="relative z-50 w-full bg-white/95 backdrop-blur-md border-b-2 border-brand-ink/10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Left: Brandmark */}
          <Link
            href="/"
            onClick={() => {
              document.body.style.overflow = "";
              setIsOpen(false);
            }}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-brand-ink/10 flex items-center justify-center bg-white shadow-sm transition-transform group-hover:scale-105">
              <Image
                src="/Cabinet Assets/cabinet-square-logo-white-bg.png"
                alt="Student Cabinet Logo"
                width={40}
                height={40}
                className="w-full h-full object-contain p-0.5"
                priority
              />
            </div>
            <span className="font-display text-lg sm:text-xl font-bold tracking-wide text-brand-ink">
              STUDENT CABINET
            </span>
          </Link>

          {/* Center: Nav links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-black tracking-wider uppercase text-brand-ink/80">
            <Link
              href="/#overview"
              onClick={(e) => handleDesktopHashClick(e, "/#overview")}
              className="hover:text-brand-violet transition-colors"
            >
              OVERVIEW
            </Link>
            <Link
              href="/#events"
              onClick={(e) => handleDesktopHashClick(e, "/#events")}
              className="hover:text-brand-violet transition-colors"
            >
              EVENTS
            </Link>
            <Link
              href="/#timeline"
              onClick={(e) => handleDesktopHashClick(e, "/#timeline")}
              className="hover:text-brand-violet transition-colors"
            >
              TIMELINE
            </Link>
            <Link
              href="/my-registrations"
              className="text-brand-violet hover:text-brand-violet-dark font-black transition-colors flex items-center gap-1"
            >
              <span>MY PASSES</span>
            </Link>
          </nav>

          {/* Right: Date Badge, CTA & Mobile Burger */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-brand-surface rounded-full border border-brand-border text-[11px] font-bold uppercase tracking-wider text-brand-ink">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>SEPT 24–26</span>
            </div>

            <Link
              href="/register"
              onClick={() => {
                document.body.style.overflow = "";
                setIsOpen(false);
              }}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full bg-brand-violet hover:bg-brand-violet-dark text-white text-xs sm:text-sm font-black uppercase tracking-wider transition-all transform hover:scale-105 active:scale-95 shadow-md shadow-brand-violet/20"
            >
              <span>REGISTER NOW</span>
              <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>

            {/* Smooth Morphing Mobile Burger Button */}
            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              className="md:hidden relative w-10 h-10 rounded-xl bg-brand-surface border border-brand-border hover:bg-zinc-100 flex flex-col items-center justify-center p-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet transition-colors cursor-pointer"
              aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isOpen}
            >
              <div className="w-5 h-4 relative flex flex-col justify-between items-center">
                <motion.span
                  animate={isOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="w-5 h-0.5 bg-brand-ink rounded-full block origin-center"
                />
                <motion.span
                  animate={isOpen ? { opacity: 0, scaleX: 0.5 } : { opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="w-5 h-0.5 bg-brand-ink rounded-full block origin-center"
                />
                <motion.span
                  animate={isOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="w-5 h-0.5 bg-brand-ink rounded-full block origin-center"
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Smooth Mobile Burger Drawer Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Dimmed backdrop */}
            <motion.div
              key="mobile-nav-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => {
                document.body.style.overflow = "";
                setIsOpen(false);
              }}
              className="fixed inset-0 top-16 sm:top-20 bg-black/60 z-40 md:hidden"
              aria-hidden="true"
            />

            {/* Slide-down Sheet */}
            <motion.div
              key="mobile-nav-sheet"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-16 sm:top-20 left-0 right-0 z-50 bg-white border-b-4 border-brand-ink shadow-2xl md:hidden flex flex-col max-h-[calc(100dvh-4rem)] sm:max-h-[calc(100dvh-5rem)] overflow-y-auto"
              style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
            >
              <div className="px-5 py-6 space-y-5">
                {/* Section Header */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between px-3 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      FESTIVAL NAVIGATION
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      <span>LIVE</span>
                    </span>
                  </div>

                  {NAV_ITEMS.map((item, idx) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.03 + idx * 0.03, duration: 0.2 }}
                    >
                      <Link
                        href={item.href}
                        onClick={(e) => handleMobileLinkClick(e, item.href)}
                        className="flex items-center justify-between px-3.5 py-3 rounded-2xl hover:bg-brand-surface active:bg-zinc-100 transition-colors group cursor-pointer touch-manipulation"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-zinc-100 group-hover:bg-brand-violet/10 text-zinc-600 group-hover:text-brand-violet flex items-center justify-center transition-colors">
                            {item.icon}
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm font-black uppercase tracking-wider text-brand-ink group-hover:text-brand-violet transition-colors flex items-center gap-2">
                              <span>{item.label}</span>
                              {item.badge && (
                                <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-brand-lime text-black">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-zinc-400 font-medium">
                              {item.description}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-brand-violet group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Direct Action Cards */}
                <div className="pt-2 border-t border-zinc-100 space-y-2.5">
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18, duration: 0.2 }}
                  >
                    <Link
                      href="/my-registrations"
                      onClick={() => {
                        document.body.style.overflow = "";
                        setIsOpen(false);
                      }}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-brand-surface border-2 border-brand-violet/20 hover:border-brand-violet transition-all group cursor-pointer touch-manipulation"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-brand-violet text-white flex items-center justify-center shadow-sm">
                          <QrCode className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-black uppercase tracking-wider text-brand-ink group-hover:text-brand-violet transition-colors">
                            MY PASSES & QR CODES
                          </div>
                          <div className="text-[10px] text-zinc-500 font-medium">
                            View gate check-in passes & team badges
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-brand-violet group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.22, duration: 0.2 }}
                  >
                    <Link
                      href="/register"
                      onClick={() => {
                        document.body.style.overflow = "";
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-brand-violet hover:bg-brand-violet-dark text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-brand-violet/20 active:scale-98 cursor-pointer touch-manipulation"
                    >
                      <span>REGISTER FOR VALLEY 2026</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </motion.div>
                </div>

                {/* Drawer Footer Meta */}
                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>SEPT 24–26, 2026</span>
                  </div>
                  <span className="font-bold text-zinc-600">CABINET VALLEY</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
