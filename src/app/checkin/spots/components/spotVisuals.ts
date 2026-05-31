// src/app/checkin/spots/components/spotVisuals.ts
// Shared visual helpers so the map, list, and sheet stay consistent.

import type { Spot, SpotAccess } from "../types";

/** Emoji glyph used in pins/thumbnails per spot type (knobbed overrides). */
export function spotGlyph(spot: Spot): string {
  if (spot.access === "knobbed") return "⚠";
  switch (spot.type) {
    case "park": return "🛹";
    case "plaza": return "🛹";
    case "transition": return "🛹";
    case "street":
      if (spot.features.some((f) => /stair/.test(f))) return "🪜";
      return "📐";
    default: return "📍";
  }
}

export const ACCESS_LABEL: Record<SpotAccess, string> = {
  skateable: "Skateable",
  knobbed: "Knobbed",
  bust: "Bust spot",
};

/** brand colors (kept in sync with the app theme: orange primary, red accent). */
export const COLORS = {
  collected: "#e8732c",
  uncollected: "#26262e",
  knobbed: "#dc3545",
  me: "#339af0",
  text: "#f5f3ee",
};

export function pinColor(spot: Spot, collected: boolean): string {
  if (spot.access === "knobbed") return COLORS.knobbed;
  return collected ? COLORS.collected : COLORS.uncollected;
}
