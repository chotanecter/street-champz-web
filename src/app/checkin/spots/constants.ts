// src/app/checkin/spots/constants.ts

export const SPOT_GAME = {
  edition: "la" as const,
  editionName: "LA Edition",
  sponsorName: "Stevie Williams",
  sponsorNote: "Sponsored by Stevie Williams",
} as const;

export const POINTS = {
  /** Tap-in (NFC) check-in at a spot. */
  CHECK_IN: 250,
  /** One-time bonus for being part of a spot's first check-ins (handled later/optional). */
  FIRST_VISIT_BONUS: 250,
  /** Submitting a clip — instant, no approval (per product decision). */
  VIDEO_SUBMIT: 500,
  /** A clip getting featured. */
  VIDEO_FEATURED: 1000,
} as const;

export const RULES = {
  /** GPS gate: tap-in only counts within this many metres of the spot. */
  GPS_GATE_METERS: 100,
  /** One scoring check-in per spot per calendar day. */
  ONE_PER_DAY: true,
  GEO_TIMEOUT_MS: 8000,
} as const;

/** Same flag the rest of the app uses; forces local/mock mode. */
export const FORCE_MOCK =
  import.meta.env.VITE_CONTESTS_MOCK === "true";

/** API base — matches ContestsContext / env.ts convention (Phase 2 will use it). */
export const API_BASE =
  ((import.meta.env.VITE_API_BASE as string | undefined) || "/api").replace(/\/$/, "");
