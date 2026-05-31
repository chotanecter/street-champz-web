// src/app/music/seed.ts
// Default tracks bundled as static assets in /public/music. Admin-uploaded songs
// are added on top of these via IndexedDB. Ice Cube plays first by default.
//
// NOTE: these are the tracks the owner uploaded; served from the app's own /music
// static folder.

import type { Song } from "./types";

export const SEED_SONGS: Song[] = [
  {
    id: "seed_ice_cube",
    title: "It Was A Good Day",
    artist: "Ice Cube",
    url: "/music/ice-cube-it-was-a-good-day.mp3",
    source: "seed",
    createdAt: 0,
  },
  {
    id: "seed_eminem",
    title: "Mockingbird",
    artist: "Eminem",
    url: "/music/eminem-mockingbird.mp3",
    source: "seed",
    createdAt: 1,
  },
  {
    id: "seed_relic",
    title: "My Lord (Hair Done)",
    artist: "RelicRhymes",
    url: "/music/relicrhymes-my-lord.mp3",
    source: "seed",
    createdAt: 2,
  },
];
