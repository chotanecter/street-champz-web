// src/app/checkin/spots/types.ts
// Data model for the Spot Check-In game (LA Edition). Phase 1 = local/mock.

export type SpotType = "park" | "plaza" | "street" | "diy" | "transition";

/** skateable = roll there; knobbed = landmark collectible, not a session; bust = high-bust. */
export type SpotAccess = "skateable" | "knobbed" | "bust";

export interface Spot {
  id: string;            // "spot_venice"
  slug: string;          // "venice-beach-skatepark"
  name: string;
  type: SpotType;
  access: SpotAccess;
  lat: number;
  lng: number;
  /** TODO(verify): coordinates are best-known and must be confirmed before public launch. */
  coordsVerified: boolean;
  address: string;
  neighborhood: string;
  photoUrl?: string;
  photos?: string[];   // gallery of the spot (where the sticker is)
  stickerLocation?: string;  // human description of where the NFC sticker is mounted
  description: string;
  features: string[];          // ["ledges","stairs","banks"]
  nfcTagId?: string;           // the one main sticker for this spot
  checkInCount: number;        // all-time (seeded for flavor)
  edition: "la";               // future: other city editions
  sponsored?: { by: string; note?: string };
}

export interface NfcTag {
  id: string;                  // token baked into the sticker URL
  spotId: string;
  type: "ntag424";
  keyRef?: string;             // backend-held CMAC key reference (Phase 2)
  active: boolean;
}

export type CheckInMethod = "nfc" | "gps";

export interface SpotCheckIn {
  id: string;
  userId: string;
  spotId: string;
  timestamp: number;
  method: CheckInMethod;
  verified: boolean;
  pointsEarned: number;
}

export type VideoStatus = "approved" | "featured"; // Phase 1: instant approve, no "pending"

export interface SpotVideo {
  id: string;
  spotId: string;
  userId: string;
  authorName: string;
  url: string;                 // base64 data URL in Phase 1
  thumbnailUrl?: string;
  caption?: string;
  status: VideoStatus;
  upvotes: number;
  createdAt: number;
  pointsAwarded: number;
}

export type ForumKind = "announcement" | "discussion";

export interface ForumPost {
  id: string;
  spotId: string;
  userId: string;
  authorName: string;
  kind: ForumKind;
  body: string;
  createdAt: number;
}

export interface SpotNewsItem {
  id: string;
  spotId: string;
  category: string;            // "Event" | "Clip" | "Heads up" | ...
  title: string;
  summary: string;
  sourceUrl?: string;
  publishedAt: number;
  /** true once the live curation agent (Phase 3) produced it; false for seeded placeholders. */
  agentGenerated: boolean;
}

export interface GeoCoords {
  lat: number;
  lng: number;
}

/** Result of attempting a collect (tap-in), so the UI can explain failures. */
export interface CollectResult {
  ok: boolean;
  checkIn?: SpotCheckIn;
  pointsEarned?: number;
  error?: "not-found" | "out-of-range" | "already-today" | "no-location" | "unknown";
  message?: string;
  distanceMeters?: number;
}
