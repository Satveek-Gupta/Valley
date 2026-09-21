import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { EVENTS_DATA } from "@/lib/mock-data";
import { CheckCircle2, Clock, XCircle, ArrowRight, ShieldCheck, MapPin, Calendar, Users } from "lucide-react";

export const dynamic = "force-dynamic";

interface VerifyPageProps {
  params: Promise<{ token: string }>;
}

function getShortCode(val: string | null | undefined): string {
  if (!val) return "";
  return val.replace(/[^a-zA-Z0-9]/g, "").slice(-4).toUpperCase();
}

export default async function VerifyPage({ params }: VerifyPageProps) {
  const { token } = await params;

  if (!token) {
    notFound();
  }

  const cleanToken = token.trim().replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const isShortCode = cleanToken.length > 0 && cleanToken.length <= 4;

  let eventReg: any = null;
  let participant: any = null;

  if (isSupabaseConfigured && supabaseAdmin) {
    // 1. Search primary event registration tables
    const eventTableLookups = [
      { slug: "startup-roulette", table: "registrations_startup_roulette" },
      { slug: "the-war-room", table: "registrations_the_war_room" },
      { slug: "the-boardroom", table: "registrations_the_boardroom" },
      { slug: "entre-prenormie", table: "registrations_entre_prenormie" },
      { slug: "bulls-and-bears", table: "registrations_bulls_and_bears" },
    ];

    for (const item of eventTableLookups) {
      try {
        if (isShortCode) {
          const { data: rows } = await supabaseAdmin
            .from(item.table)
            .select("*");

          if (rows && rows.length > 0) {
            const match = rows.find((r: any) => {
              const codeId = getShortCode(r.id);
              const codeToken = getShortCode(r.qr_token);
              return codeId === cleanToken || codeToken === cleanToken;
            });

            if (match) {
              eventReg = {
                id: match.id,
                qr_token: match.qr_token || match.id,
                event_slug: item.slug,
                checked_in_at: match.checked_in_at,
                details: {
                  teamName: match.team_name || null,
                  teamLeaderName: match.team_leader_name || match.full_name,
                  teamMembersNames: match.team_members_names || match.partner_name || null,
                },
              };
              participant = {
                full_name: match.full_name,
                email: match.email,
              };
              break;
            }
          }
        } else {
          const { data } = await supabaseAdmin
            .from(item.table)
            .select("*")
            .or(`qr_token.eq.${token},id.eq.${token}`)
            .maybeSingle();

          if (data) {
            eventReg = {
              id: data.id,
              qr_token: data.qr_token || data.id,
              event_slug: item.slug,
              checked_in_at: data.checked_in_at,
              details: {
                teamName: data.team_name || null,
                teamLeaderName: data.team_leader_name || data.full_name,
                teamMembersNames: data.team_members_names || data.partner_name || null,
              },
            };
            participant = {
              full_name: data.full_name,
              email: data.email,
            };
            break;
          }
        }
      } catch (e) {
        // Fallback: try by id only
        try {
          const { data: byId } = await supabaseAdmin
            .from(item.table)
            .select("*")
            .eq("id", token)
            .maybeSingle();
          if (byId) {
            eventReg = {
              id: byId.id,
              qr_token: byId.qr_token || byId.id,
              event_slug: item.slug,
              checked_in_at: byId.checked_in_at,
              details: {
                teamName: byId.team_name || null,
                teamLeaderName: byId.team_leader_name || byId.full_name,
                teamMembersNames: byId.team_members_names || byId.partner_name || null,
              },
            };
            participant = {
              full_name: byId.full_name,
              email: byId.email,
            };
            break;
          }
        } catch (e2) {
          // ignore
        }
      }
    }

  }

  let eventMeta: any = null;
  if (eventReg && isSupabaseConfigured && supabaseAdmin) {
    try {
      const { data: dbEvent } = await supabaseAdmin
        .from("events")
        .select("*")
        .eq("slug", eventReg.event_slug)
        .maybeSingle();

      if (dbEvent) {
        eventMeta = {
          name: dbEvent.name,
          day: dbEvent.day,
          dateLabel: dbEvent.date_label || `DAY 0${dbEvent.day}`,
          venue: dbEvent.venue,
          timing: dbEvent.timing,
          badgeColor: dbEvent.badge_color || "#7C3AED",
        };
      }
    } catch (e) {
      // fallback
    }
  }
  if (!eventMeta && eventReg) {
    eventMeta = EVENTS_DATA.find((e) => e.slug === eventReg.event_slug) || null;
  }
  const checkedInAt = eventReg?.checked_in_at || eventReg?.details?.checked_in_at;
  const isCheckedIn = Boolean(checkedInAt);

  return (
    <div className="min-h-screen bg-[#F7F7F8] text-brand-ink flex flex-col justify-between p-4 sm:p-8">
      <div className="max-w-lg w-full mx-auto my-auto">
        <div className="bg-white rounded-3xl border-4 border-brand-ink p-6 sm:p-10 shadow-[8px_8px_0px_0px_rgba(10,10,10,1)] text-center space-y-6">
          {/* Header Branding */}
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-zinc-200">
              <Image
                src="/Cabinet Assets/cabinet-square-logo-white-bg.png"
                alt="Student Cabinet"
                width={32}
                height={32}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-display text-lg font-black uppercase tracking-wide">
              CABINET VALLEY 2026
            </span>
          </div>

          {eventReg ? (
            <>
              {/* Status Badge */}
              <div>
                {isCheckedIn ? (
                  <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-100 border-2 border-emerald-300 text-emerald-800 text-xs font-black uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>CHECKED IN</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-zinc-100 border-2 border-zinc-300 text-zinc-700 text-xs font-black uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-brand-violet" />
                    <span>OFFICIAL VALID PASS</span>
                  </div>
                )}
              </div>

              {/* Event Name */}
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-violet bg-brand-violet/10 px-3 py-1 rounded-full">
                  {eventMeta?.dateLabel || "DAY 01"}
                </span>
                <h1 className="font-display text-4xl sm:text-5xl font-black uppercase text-brand-ink mt-2 leading-none">
                  {eventMeta?.name || eventReg.event_slug.toUpperCase().replace(/-/g, " ")}
                </h1>
                <p className="text-xs font-semibold text-zinc-500 mt-2 flex items-center justify-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-brand-violet" />
                  <span>{eventMeta?.venue || "University Auditorium"}</span>
                </p>
              </div>

              {/* Attendee Details Card */}
              <div className="bg-brand-surface rounded-2xl p-5 border border-zinc-200 text-left space-y-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
                    ATTENDEE / TEAM LEADER
                  </span>
                  <div className="text-lg font-black uppercase text-brand-ink">
                    {eventReg.details?.teamLeaderName || participant?.full_name || "Confirmed Attendee"}
                  </div>
                </div>

                {eventReg.details?.teamName && (
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
                      REGISTERED TEAM
                    </span>
                    <div className="text-sm font-black text-brand-violet uppercase">
                      {eventReg.details.teamName}
                    </div>
                  </div>
                )}

                {eventReg.details?.teamMembersNames && (
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1">
                      TEAM MEMBERS
                    </span>
                    <div className="text-xs font-medium text-zinc-700">
                      {eventReg.details.teamMembersNames}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-zinc-200/60 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-zinc-700 bg-white px-3 py-2 rounded-xl border border-zinc-200">
                    <span className="text-zinc-500 uppercase text-[10px]">GATE PASS CODE</span>
                    <span className="text-base font-black tracking-[0.25em] text-brand-violet">
                      {getShortCode(eventReg.qr_token || eventReg.id || token)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                    <span>PASS ID</span>
                    <span>{(eventReg.qr_token || eventReg.id || token).substring(0, 18)}...</span>
                  </div>
                </div>
              </div>

              {isCheckedIn && checkedInAt && (
                <p className="text-xs font-medium text-zinc-500">
                  Checked in on{" "}
                  {new Date(checkedInAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              )}

              <div className="pt-4 border-t border-zinc-200 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/my-registrations"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 rounded-xl bg-brand-ink hover:bg-brand-violet text-white text-xs font-black uppercase tracking-wider transition-colors shadow-md"
                >
                  <span>VIEW ALL MY PASSES</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </>
          ) : (
            <div className="space-y-4 py-6">
              <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8" />
              </div>
              <h2 className="font-display text-3xl font-black uppercase text-brand-ink">
                PASS NOT FOUND
              </h2>
              <p className="text-xs font-medium text-zinc-600 max-w-xs mx-auto">
                No active registration was found for this QR token. It may have expired or was typed incorrectly.
              </p>
              <div className="pt-4 flex flex-col gap-2">
                <Link
                  href="/my-registrations"
                  className="py-3 rounded-xl bg-brand-ink text-white text-xs font-black uppercase tracking-wider hover:bg-brand-violet"
                >
                  FIND MY PASS BY EMAIL
                </Link>
                <Link
                  href="/register"
                  className="py-3 rounded-xl border border-zinc-300 text-zinc-700 text-xs font-bold uppercase hover:bg-zinc-100"
                >
                  REGISTER FOR CABINET VALLEY
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="text-center text-xs font-semibold text-zinc-400 py-4">
        Official Pass Verification · Student Cabinet Valley
      </footer>
    </div>
  );
}
