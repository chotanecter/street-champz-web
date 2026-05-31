// src/app/checkin/mockData.ts
// Generates plausible "nearby skaters" around an origin so the Discovery list is
// never empty when there's no backend. Mirrors the backend contract: within 1
// mile, checked in within the last 2 hours, sorted by distance.

import { CHECKIN } from './constants';
import { distanceMeters } from './geo';
import type { GeoCoords, NearbySkater } from './types';

interface Seed {
  userId: string;
  username: string;
  hasAvatar: boolean;
  /** metres from origin */
  dist: number;
  /** compass bearing in degrees */
  bearing: number;
  /** minutes ago they checked in */
  minsAgo: number;
  spotLabel?: string | null;
}

const SEEDS: Seed[] = [
  { userId: 'user:sk8_king', username: 'sk8_king', hasAvatar: true, dist: 240, bearing: 35, minsAgo: 8, spotLabel: 'Embarcadero Stairs' },
  { userId: 'user:reckless', username: 'reckless_ria', hasAvatar: true, dist: 510, bearing: 120, minsAgo: 22, spotLabel: 'Courthouse Ledges' },
  { userId: 'user:gnarbar', username: 'gnarbar', hasAvatar: false, dist: 880, bearing: 210, minsAgo: 41, spotLabel: 'DIY under the 101' },
  { userId: 'user:flipmode', username: 'flipmode', hasAvatar: true, dist: 1320, bearing: 300, minsAgo: 64, spotLabel: null },
  { userId: 'user:ghost', username: 'old_ghost', hasAvatar: false, dist: 600, bearing: 90, minsAgo: 150 }, // >2h -> filtered out
  { userId: 'user:faraway', username: 'faraway_fred', hasAvatar: true, dist: 2400, bearing: 10, minsAgo: 5 }, // >1mi -> filtered out
];

/** Offset an origin by `dist` metres along `bearing` degrees. */
function project(origin: GeoCoords, dist: number, bearingDeg: number): GeoCoords {
  const R = 6_371_000;
  const br = (bearingDeg * Math.PI) / 180;
  const lat1 = (origin.lat * Math.PI) / 180;
  const lng1 = (origin.lng * Math.PI) / 180;
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(dist / R) +
      Math.cos(lat1) * Math.sin(dist / R) * Math.cos(br),
  );
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(br) * Math.sin(dist / R) * Math.cos(lat1),
      Math.cos(dist / R) - Math.sin(lat1) * Math.sin(lat2),
    );
  return { lat: (lat2 * 180) / Math.PI, lng: (lng2 * 180) / Math.PI };
}

/**
 * Build the mock nearby list as the backend would: compute real distances from
 * `origin`, drop anyone outside 1 mile or older than 2 hours, sort ascending.
 */
export function mockNearbySkaters(origin: GeoCoords): NearbySkater[] {
  const now = Date.now();
  return SEEDS.map((s) => {
    const loc = project(origin, s.dist, s.bearing);
    return {
      userId: s.userId,
      username: s.username,
      hasAvatar: s.hasAvatar,
      distanceMeters: distanceMeters(origin, loc),
      checkedInAt: new Date(now - s.minsAgo * 60_000).toISOString(),
      spotLabel: s.spotLabel ?? null,
    };
  })
    .filter(
      (s) =>
        s.distanceMeters <= CHECKIN.RADIUS_METERS &&
        now - new Date(s.checkedInAt).getTime() <= CHECKIN.EXPIRY_MS,
    )
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
}
