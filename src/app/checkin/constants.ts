// src/app/checkin/constants.ts

export const CHECKIN = {
  /** 1 mile in metres — nearby radius (handoff). */
  RADIUS_METERS: 1609.34,
  /** Check-ins older than 2h are "ghosts" and never shown (handoff). */
  EXPIRY_MS: 2 * 60 * 60 * 1000,
  /** Moving more than 1 mile from your old check-in wipes it (handoff displacement rule). */
  DISPLACEMENT_METERS: 1609.34,
  /** Re-poll the nearby list this often while checked in (handoff: ~60s). */
  POLL_MS: 60_000,
  /** getCurrentPosition timeout. */
  GEO_TIMEOUT_MS: 8000,
  METERS_PER_MILE: 1609.34,
} as const;

/**
 * API base — same convention the rest of the app uses (ContestsContext, env.ts):
 * VITE_API_BASE when set (Railway host in production), else "/api" which Vite's
 * dev server proxies to the backend (stripping the /api prefix). So requests go
 * to `<host>/check-in` in prod and `localhost:3000/check-in` in dev.
 */
export const API_BASE =
  ((import.meta.env.VITE_API_BASE as string | undefined) || '/api').replace(/\/$/, '');

/** Force mock mode (shares the existing flag used by Contests). */
export const FORCE_MOCK = import.meta.env.VITE_CONTESTS_MOCK === 'true';

/**
 * Bearer token for the backend. The handoff says the auth pattern is "already
 * established" — adjust this getter to read from wherever the app stores it.
 * In mock mode it's unused.
 */
export function getAuthToken(): string | null {
  try {
    return (
      localStorage.getItem('authToken') ??
      localStorage.getItem('token') ??
      localStorage.getItem('sc_token') ??
      null
    );
  } catch {
    return null;
  }
}
