// src/app/checkin/types.ts
// Digital Check-In / Discovery — frontend types.
// Shapes mirror CHECKIN_BACKEND_HANDOFF.md exactly so swapping mock -> real API
// is a no-op for the UI.

export interface GeoCoords {
  lat: number;
  lng: number;
}

/** A skater returned in the "nearby" list (handoff: POST /check-in & GET /check-in/nearby). */
export interface NearbySkater {
  userId: string;
  username: string;
  hasAvatar: boolean;
  /** Raw metres from the backend's geo::distance(); we convert to miles for display. */
  distanceMeters: number;
  /** ISO timestamp. */
  checkedInAt: string;
  spotLabel?: string | null;
}

/** The current user's active check-in. */
export interface MyCheckIn {
  location: GeoCoords;
  checkedInAt: string;
  spotLabel?: string | null;
}

/** Response of POST /check-in. */
export interface CheckInResponse {
  success: boolean;
  nearbySkaters: NearbySkater[];
}

/** Response of GET /check-in/nearby. */
export interface NearbyResponse {
  isCheckedIn: boolean;
  myCheckIn?: MyCheckIn;
  nearbySkaters: NearbySkater[];
}

export type CheckInStatus =
  | 'idle' // not checked in
  | 'locating' // waiting on GPS
  | 'checking-in' // POST in flight
  | 'checked-in' // active check-in
  | 'error';
