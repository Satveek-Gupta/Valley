export interface GateEventMapping {
  slug: string;
  name: string;
  initials: string[];
  sampleEmail: string;
}

export const VOLUNTEER_EVENT_MAPPINGS: Record<string, GateEventMapping> = {
  "startup-roulette": {
    slug: "startup-roulette",
    name: "STARTUP ROULETTE",
    initials: ["sr"],
    sampleEmail: "sr_gate1@cabinetbu.tech",
  },
  "the-war-room": {
    slug: "the-war-room",
    name: "THE WAR ROOM",
    initials: ["wr", "twr"],
    sampleEmail: "wr_gate1@cabinetbu.tech",
  },
  "the-boardroom": {
    slug: "the-boardroom",
    name: "THE BOARDROOM",
    initials: ["br", "tb"],
    sampleEmail: "br_gate1@cabinetbu.tech",
  },
  "entre-prenormie": {
    slug: "entre-prenormie",
    name: "ENTREPRE-NORMIE",
    initials: ["en", "ep"],
    sampleEmail: "en_gate1@cabinetbu.tech",
  },
  "bulls-and-bears": {
    slug: "bulls-and-bears",
    name: "BULLS & BEARS",
    initials: ["bb", "bnb"],
    sampleEmail: "bb_gate1@cabinetbu.tech",
  },
};

/**
 * Returns the restricted event slug for a volunteer email, or null if unrestricted (e.g. admin or general).
 */
export function getRestrictedEventSlug(email: string | null | undefined): string | null {
  if (!email) return null;
  const clean = email.toLowerCase().trim();

  // If email starts with event initial + underscore, hyphen, or dot (e.g. sr_gate1@, wr_gate2@, br_gate1@, etc.)
  for (const [slug, meta] of Object.entries(VOLUNTEER_EVENT_MAPPINGS)) {
    for (const init of meta.initials) {
      if (
        clean.startsWith(`${init}_`) ||
        clean.startsWith(`${init}-`) ||
        clean.startsWith(`${init}.`) ||
        clean.includes(`_${init}_`)
      ) {
        return slug;
      }
    }

    // Also check event slug tokens if email is e.g. startup_roulette_gate1@
    const slugWithoutHyphens = slug.replace(/-/g, "");
    const cleanWithoutSpecials = clean.replace(/[^a-z0-9]/g, "");
    if (cleanWithoutSpecials.includes(slugWithoutHyphens)) {
      return slug;
    }
  }

  return null;
}

/**
 * Returns the event name for a slug.
 */
export function getEventNameFromSlug(slug: string): string {
  return VOLUNTEER_EVENT_MAPPINGS[slug]?.name || slug.toUpperCase().replace(/-/g, " ");
}
