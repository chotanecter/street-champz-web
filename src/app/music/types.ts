// src/app/music/types.ts
export interface Song {
  id: string;
  title: string;
  artist?: string;
  /** Playable URL: a static /music/*.mp3 (seed) or a base64 data URL (admin upload). */
  url: string;
  /** "seed" = bundled default track; "upload" = added via the admin portal. */
  source: "seed" | "upload";
  createdAt: number;
}
