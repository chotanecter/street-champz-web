// src/app/checkin/spots/mockFeed.ts
// Seeded "recent check-ins" activity from other skaters, so the mini feed isn't
// empty in mock mode. The signed-in user's real check-ins are merged in by the
// component. Replaced by a backend feed in Phase 2.

export interface FeedEntry {
  id: string;
  username: string;
  city: string;
  /** epoch ms */
  timestamp: number;
}

const M = 60_000;
const H = 60 * M;

export function seedFeed(now: number = Date.now()): FeedEntry[] {
  return [
    { id: "f1", username: "riley_g", city: "Venice", timestamp: now - 4 * M },
    { id: "f2", username: "dom", city: "West LA", timestamp: now - 18 * M },
    { id: "f3", username: "kaya", city: "Downtown", timestamp: now - 41 * M },
    { id: "f4", username: "marcus", city: "El Sereno", timestamp: now - 1 * H - 12 * M },
    { id: "f5", username: "sk8_king", city: "Hollywood", timestamp: now - 2 * H - 5 * M },
    { id: "f6", username: "reckless_ria", city: "Santa Monica", timestamp: now - 3 * H - 20 * M },
    { id: "f7", username: "gnarbar", city: "Koreatown", timestamp: now - 5 * H },
    { id: "f8", username: "flipmode", city: "Mid-City", timestamp: now - 8 * H },
  ];
}
