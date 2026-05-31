// src/app/checkin/spots/geo.ts
// Pure geo helpers + a getCurrentPosition wrapper. distanceMeters is unit-tested.

import { RULES } from "./constants";
import type { GeoCoords } from "./types";

const EARTH_RADIUS_M = 6_371_000;
const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance in metres (haversine). */
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
  if (!Number.isFinite(meters)) return "—";
  const miles = meters / 1609.34;
  if (miles < 0.1) return `${Math.round(meters * 3.281)} ft`;
  return `${miles.toFixed(1)} mi`;
}

export interface GeoResult {
  coords: GeoCoords | null;
  denied: boolean;
}

/** Promise wrapper; never rejects — resolves denied:true so callers can fall back. */
export function getCurrentCoords(timeoutMs = RULES.GEO_TIMEOUT_MS): Promise<GeoResult> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      resolve({ coords: null, denied: true });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ coords: { lat: pos.coords.latitude, lng: pos.coords.longitude }, denied: false }),
      () => resolve({ coords: null, denied: true }),
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 60_000 },
    );
  });
}

/** Local YYYY-MM-DD for one-per-day check-in logic. */
export function dateKey(ts: number = Date.now()): string {
  const d = new Date(ts);
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}
