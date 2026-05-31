// src/app/checkin/geo.ts
// Geolocation + formatting helpers. distanceMeters is pure and unit-tested.

import { CHECKIN } from './constants';
import type { GeoCoords } from './types';

const EARTH_RADIUS_M = 6_371_000;
const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance in metres (haversine). Matches SurrealDB geo::distance closely enough for display. */
export function distanceMeters(a: GeoCoords, b: GeoCoords): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Human distance: feet under ~0.1mi, else miles to 1 dp. */
export function formatDistance(meters: number): string {
  if (!Number.isFinite(meters)) return '—';
  const miles = meters / CHECKIN.METERS_PER_MILE;
  if (miles < 0.1) return `${Math.round(meters * 3.281)} ft`;
  return `${miles.toFixed(1)} mi`;
}

/** "just now" / "5m ago" / "1h ago" from an ISO timestamp. */
export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const s = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export interface GeoResult {
  coords: GeoCoords | null;
  denied: boolean;
}

/**
 * Promise wrapper around navigator.geolocation.getCurrentPosition.
 * Resolves (never rejects) with denied:true if unavailable/denied so callers can
 * surface a clear "enable location" message instead of crashing.
 */
export function getCurrentCoords(
  timeoutMs = CHECKIN.GEO_TIMEOUT_MS,
): Promise<GeoResult> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      resolve({ coords: null, denied: true });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          coords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          denied: false,
        }),
      () => resolve({ coords: null, denied: true }),
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 60_000 },
    );
  });
}
