// src/app/checkin/CheckInContext.tsx
// Owns check-in state, GPS, and the 60-second nearby poll.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import * as api from './api';
import { CHECKIN } from './constants';
import { getCurrentCoords } from './geo';
import type { CheckInStatus, MyCheckIn, NearbySkater } from './types';

interface CheckInContextValue {
  status: CheckInStatus;
  myCheckIn: MyCheckIn | null;
  nearby: NearbySkater[];
  error: string | null;
  /** Last time the nearby list was refreshed. */
  lastUpdated: number | null;
  locationDenied: boolean;

  /** Grab GPS once and POST a check-in. */
  doCheckIn: (spotLabel?: string) => Promise<void>;
  /** DELETE the check-in. */
  doCheckOut: () => Promise<void>;
  /** Re-fetch nearby without re-triggering GPS. */
  refresh: () => Promise<void>;
}

const CheckInContext = createContext<CheckInContextValue | null>(null);

export function CheckInProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<CheckInStatus>('idle');
  const [myCheckIn, setMyCheckIn] = useState<MyCheckIn | null>(null);
  const [nearby, setNearby] = useState<NearbySkater[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await api.getNearby();
      if (res.isCheckedIn && res.myCheckIn) {
        setMyCheckIn(res.myCheckIn);
        setNearby(res.nearbySkaters);
        setStatus('checked-in');
      } else {
        setMyCheckIn(null);
        setNearby([]);
        setStatus('idle');
      }
      setLastUpdated(Date.now());
    } catch {
      // keep current state; surface a soft error
      setError('Could not refresh nearby skaters.');
    }
  }, []);

  const startPolling = useCallback(() => {
    stopPolling();
    pollRef.current = setInterval(() => {
      void refresh();
    }, CHECKIN.POLL_MS);
  }, [refresh, stopPolling]);

  // Restore state on mount (handoff: GET /check-in/nearby tells us if we're still in).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await api.getNearby().catch(() => null);
      if (cancelled || !res) return;
      if (res.isCheckedIn && res.myCheckIn) {
        setMyCheckIn(res.myCheckIn);
        setNearby(res.nearbySkaters);
        setStatus('checked-in');
        setLastUpdated(Date.now());
        startPolling();
      }
    })();
    return () => {
      cancelled = true;
      stopPolling();
    };
  }, [startPolling, stopPolling]);

  const doCheckIn = useCallback(
    async (spotLabel?: string) => {
      setError(null);
      setLocationDenied(false);
      setStatus('locating');

      const { coords, denied } = await getCurrentCoords();
      if (!coords) {
        setLocationDenied(denied);
        setStatus('error');
        setError(
          denied
            ? 'Location access is needed to check in. Enable it and try again.'
            : 'Could not get your location. Try again.',
        );
        return;
      }

      setStatus('checking-in');
      try {
        const res = await api.checkIn(coords, spotLabel?.trim() || null);
        setMyCheckIn({
          location: coords,
          checkedInAt: new Date().toISOString(),
          spotLabel: spotLabel?.trim() || null,
        });
        setNearby(res.nearbySkaters);
        setStatus('checked-in');
        setLastUpdated(Date.now());
        startPolling();
        void api.logCheckIn(spotLabel?.trim() || null);
      } catch {
        setStatus('error');
        setError('Check-in failed. Try again.');
      }
    },
    [startPolling],
  );

  const doCheckOut = useCallback(async () => {
    stopPolling();
    try {
      await api.checkOut();
    } finally {
      setMyCheckIn(null);
      setNearby([]);
      setStatus('idle');
      setLastUpdated(null);
    }
  }, [stopPolling]);

  const value = useMemo<CheckInContextValue>(
    () => ({
      status,
      myCheckIn,
      nearby,
      error,
      lastUpdated,
      locationDenied,
      doCheckIn,
      doCheckOut,
      refresh,
    }),
    [
      status,
      myCheckIn,
      nearby,
      error,
      lastUpdated,
      locationDenied,
      doCheckIn,
      doCheckOut,
      refresh,
    ],
  );

  return <CheckInContext.Provider value={value}>{children}</CheckInContext.Provider>;
}

export function useCheckIn(): CheckInContextValue {
  const ctx = useContext(CheckInContext);
  if (!ctx) throw new Error('useCheckIn must be used within a CheckInProvider');
  return ctx;
}
