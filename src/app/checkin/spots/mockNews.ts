// src/app/checkin/spots/mockNews.ts
// Placeholder per-spot news until the live curation agent (Phase 3) runs.
// agentGenerated:false marks these as seeds so the agent can replace them later.

import type { SpotNewsItem } from "./types";

export function seedNewsFor(spotId: string, spotName: string): SpotNewsItem[] {
  const now = Date.now();
  const day = 86_400_000;
  return [
    {
      id: `news_${spotId}_1`,
      spotId,
      category: "Event",
      title: "Go Skateboarding Day meet-up",
      summary: `Locals are organizing a June 21 session at ${spotName}. Check in to RSVP.`,
      publishedAt: now - 2 * day,
      agentGenerated: false,
    },
    {
      id: `news_${spotId}_2`,
      spotId,
      category: "Clip",
      title: "New part filmed here is making the rounds",
      summary: `A recent section featuring ${spotName} has been getting passed around this week.`,
      publishedAt: now - 5 * day,
      agentGenerated: false,
    },
    {
      id: `news_${spotId}_3`,
      spotId,
      category: "Heads up",
      title: "Conditions update",
      summary: "Surface is in good shape right now — community-reported. Confirm before you roll out.",
      publishedAt: now - 8 * day,
      agentGenerated: false,
    },
  ];
}
