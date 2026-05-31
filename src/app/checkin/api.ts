// src/app/checkin/api.ts
// Thin client for the 3 handoff endpoints, with a mock fallback so the feature
// works on production today (no backend yet) — same philosophy as ContestsContext:
// try the API, fall back to local persistence + mock data on any failure.

import { API_BASE, CHECKIN, FORCE_MOCK, getAuthToken } from './constants';
import { distanceMeters } from './geo';
import { mockNearbySkaters } from './mockData';
import { clearMyCheckIn, loadMyCheckIn, saveMyCheckIn } from './storage';
import type {
  CheckInResponse,
  GeoCoords,
  MyCheckIn,
  NearbyResponse,
} from './types';

function authHeaders(): HeadersInit {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}/check-in${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`check-in API ${res.status}`);
  return (await res.json()) as T;
}

// ---------------------------------------------------------------------------
// POST /check-in  — create/update my check-in, return nearby skaters
// ---------------------------------------------------------------------------
export async function checkIn(
  coords: GeoCoords,
  spotLabel?: string | null,
): Promise<CheckInResponse> {
  const body = { lat: coords.lat, lng: coords.lng, spot_label: spotLabel ?? null };

  if (!FORCE_MOCK) {
    try {
      return await fetchJson<CheckInResponse>('', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    } catch {
      /* fall through to mock */
    }
  }

  // --- mock ---
  // Displacement rule: moving >1mi replaces the old check-in (we just overwrite).
  await saveMyCheckIn({
    location: coords,
    checkedInAt: new Date().toISOString(),
    spotLabel: spotLabel ?? null,
  });
  return { success: true, nearbySkaters: mockNearbySkaters(coords) };
}

// ---------------------------------------------------------------------------
// DELETE /check-in  — check out
// ---------------------------------------------------------------------------
export async function checkOut(): Promise<{ success: boolean }> {
  if (!FORCE_MOCK) {
    try {
      return await fetchJson<{ success: boolean }>('', { method: 'DELETE' });
    } catch {
      /* fall through to mock */
    }
  }
  await clearMyCheckIn();
  return { success: true };
}

// ---------------------------------------------------------------------------
// GET /check-in/nearby  — refresh without re-triggering GPS
// ---------------------------------------------------------------------------
export async function getNearby(): Promise<NearbyResponse> {
  if (!FORCE_MOCK) {
    try {
      return await fetchJson<NearbyResponse>('/nearby', { method: 'GET' });
    } catch {
      /* fall through to mock */
    }
  }

  // --- mock ---
  const mine: MyCheckIn | null = await loadMyCheckIn();
  if (!mine) return { isCheckedIn: false, nearbySkaters: [] };

  // Honour the 2-hour expiry on my own check-in too (ghost prevention).
  if (Date.now() - new Date(mine.checkedInAt).getTime() > CHECKIN.EXPIRY_MS) {
    await clearMyCheckIn();
    return { isCheckedIn: false, nearbySkaters: [] };
  }

  return {
    isCheckedIn: true,
    myCheckIn: mine,
    nearbySkaters: mockNearbySkaters(mine.location),
  };
}

/** Local helper kept for parity/testing: is `b` a displacement (>1mi) from `a`? */
export function isDisplaced(a: GeoCoords, b: GeoCoords): boolean {
  return distanceMeters(a, b) > CHECKIN.DISPLACEMENT_METERS;
}
