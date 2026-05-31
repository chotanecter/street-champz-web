// src/app/checkin/spots/SpotsContext.tsx
// State + actions for the Spot Check-In game (LA Edition). Phase 1: local/mock,
// IndexedDB persistence. Points flow into the existing economy context.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useEconomy } from "../../economy/context";
import { useAuth } from "../../auth/context";
import { POINTS, RULES } from "./constants";
import { distanceMeters, dateKey, getCurrentCoords } from "./geo";
import { LA_SPOTS, LA_SPOTS_BY_ID, LA_SPOTS_BY_SLUG } from "./laSpots";
import { seedNewsFor } from "./mockNews";
import {
  fileToDataUrl,
  getAllCheckIns,
  getAllForumPosts,
  getAllNews,
  getAllVideos,
  putCheckIn,
  putForumPost,
  putNewsBulk,
  putVideo,
  uid,
} from "./spotsStorage";
import type {
  CollectResult,
  ForumPost,
  GeoCoords,
  Spot,
  SpotCheckIn,
  SpotNewsItem,
  SpotVideo,
} from "./types";

interface SpotsContextValue {
  loading: boolean;
  spots: Spot[];
  checkIns: SpotCheckIn[];
  userId: string;

  // selectors
  spotById: (id: string) => Spot | undefined;
  spotBySlug: (slug: string) => Spot | undefined;
  isCollectedToday: (spotId: string) => boolean;
  collectedCount: () => number;
  videosForSpot: (spotId: string) => SpotVideo[];
  forumForSpot: (spotId: string) => ForumPost[];
  newsForSpot: (spotId: string) => SpotNewsItem[];

  // actions
  /** Collect a spot (tap-in). `opts.bypassGps` for dev/testing. */
  collect: (spotId: string, opts?: { bypassGps?: boolean }) => Promise<CollectResult>;
  submitVideo: (spotId: string, file: File, caption?: string) => Promise<SpotVideo | null>;
  postForum: (spotId: string, body: string) => Promise<void>;
  upvoteVideo: (videoId: string) => Promise<void>;
}

const SpotsContext = createContext<SpotsContextValue | null>(null);

export function SpotsProvider({ children }: { children: ReactNode }) {
  // economy.addPoints expects a strict PointsSource union; "achievement" is the
  // closest existing category for spot rewards in Phase 1.
  const economy = useEconomy() as {
    addPoints?: (n: number, source: "achievement", toast?: boolean) => void;
  };
  const POINTS_SOURCE = "achievement" as const;
  const auth = useAuth() as { id?: string; username?: string };
  const userId = auth?.id || "me";
  const authorName = auth?.username || "You";

  const [loading, setLoading] = useState(true);
  const [spots] = useState<Spot[]>(LA_SPOTS);
  const [checkIns, setCheckIns] = useState<SpotCheckIn[]>([]);
  const [videos, setVideos] = useState<SpotVideo[]>([]);
  const [forum, setForum] = useState<ForumPost[]>([]);
  const [news, setNews] = useState<SpotNewsItem[]>([]);

  // initial load from IndexedDB (+ seed news on first run)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [c, v, f, n] = await Promise.all([
        getAllCheckIns(),
        getAllVideos(),
        getAllForumPosts(),
        getAllNews(),
      ]);
      let newsList = n;
      if (newsList.length === 0) {
        newsList = LA_SPOTS.flatMap((s) => seedNewsFor(s.id, s.name));
        await putNewsBulk(newsList);
      }
      if (cancelled) return;
      setCheckIns(c);
      setVideos(v);
      setForum(f);
      setNews(newsList);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const award = useCallback(
    (n: number) => {
      try {
        economy.addPoints?.(n, POINTS_SOURCE, true);
      } catch {
        /* economy not ready — points are best-effort in Phase 1 */
      }
    },
    [economy],
  );

  // ---- selectors ----
  const spotById = useCallback((id: string) => LA_SPOTS_BY_ID[id], []);
  const spotBySlug = useCallback((slug: string) => LA_SPOTS_BY_SLUG[slug], []);

  const isCollectedToday = useCallback(
    (spotId: string) => {
      const today = dateKey();
      return checkIns.some(
        (c) => c.spotId === spotId && c.userId === userId && dateKey(c.timestamp) === today,
      );
    },
    [checkIns, userId],
  );

  const collectedCount = useCallback(() => {
    const ids = new Set(checkIns.filter((c) => c.userId === userId).map((c) => c.spotId));
    return ids.size;
  }, [checkIns, userId]);

  const videosForSpot = useCallback(
    (spotId: string) => videos.filter((v) => v.spotId === spotId).sort((a, b) => b.createdAt - a.createdAt),
    [videos],
  );
  const forumForSpot = useCallback(
    (spotId: string) => forum.filter((p) => p.spotId === spotId).sort((a, b) => b.createdAt - a.createdAt),
    [forum],
  );
  const newsForSpot = useCallback(
    (spotId: string) => news.filter((nn) => nn.spotId === spotId).sort((a, b) => b.publishedAt - a.publishedAt),
    [news],
  );

  // ---- actions ----
  const collect = useCallback<SpotsContextValue["collect"]>(
    async (spotId, opts = {}) => {
      const spot = LA_SPOTS_BY_ID[spotId];
      if (!spot) return { ok: false, error: "not-found", message: "Spot not found." };

      if (isCollectedToday(spotId)) {
        return { ok: false, error: "already-today", message: "You already checked in here today." };
      }

      // GPS gate (skippable for dev/testing)
      let distance: number | undefined;
      if (!opts.bypassGps) {
        const { coords } = await getCurrentCoords();
        if (!coords) {
          return { ok: false, error: "no-location", message: "Turn on location to check in at this spot." };
        }
        distance = distanceMeters(coords as GeoCoords, spot);
        if (distance > RULES.GPS_GATE_METERS) {
          return {
            ok: false,
            error: "out-of-range",
            distanceMeters: distance,
            message: `You're ${Math.round(distance)}m away. Get within ${RULES.GPS_GATE_METERS}m of the sticker.`,
          };
        }
      }

      const checkIn: SpotCheckIn = {
        id: uid("ci"),
        userId,
        spotId,
        timestamp: Date.now(),
        method: "nfc",
        verified: !opts.bypassGps,
        pointsEarned: POINTS.CHECK_IN,
      };
      setCheckIns((prev) => [checkIn, ...prev]);
      await putCheckIn(checkIn);
      award(POINTS.CHECK_IN);

      return { ok: true, checkIn, pointsEarned: POINTS.CHECK_IN, distanceMeters: distance };
    },
    [isCollectedToday, userId, award],
  );

  const submitVideo = useCallback<SpotsContextValue["submitVideo"]>(
    async (spotId, file, caption) => {
      const url = await fileToDataUrl(file).catch(() => "");
      if (!url) return null;
      const video: SpotVideo = {
        id: uid("vid"),
        spotId,
        userId,
        authorName,
        url,
        caption: caption?.trim() || undefined,
        status: "approved", // instant, no approval
        upvotes: 0,
        createdAt: Date.now(),
        pointsAwarded: POINTS.VIDEO_SUBMIT,
      };
      setVideos((prev) => [video, ...prev]);
      await putVideo(video);
      award(POINTS.VIDEO_SUBMIT);
      return video;
    },
    [userId, authorName, award],
  );

  const postForum = useCallback<SpotsContextValue["postForum"]>(
    async (spotId, body) => {
      const text = body.trim();
      if (!text) return;
      const post: ForumPost = {
        id: uid("post"),
        spotId,
        userId,
        authorName,
        kind: "discussion",
        body: text,
        createdAt: Date.now(),
      };
      setForum((prev) => [post, ...prev]);
      await putForumPost(post);
    },
    [userId, authorName],
  );

  const upvoteVideo = useCallback<SpotsContextValue["upvoteVideo"]>(
    async (videoId) => {
      setVideos((prev) => {
        const next = prev.map((v) => (v.id === videoId ? { ...v, upvotes: v.upvotes + 1 } : v));
        const updated = next.find((v) => v.id === videoId);
        if (updated) putVideo(updated);
        return next;
      });
    },
    [],
  );

  const value = useMemo<SpotsContextValue>(
    () => ({
      loading,
      spots,
      checkIns,
      userId,
      spotById,
      spotBySlug,
      isCollectedToday,
      collectedCount,
      videosForSpot,
      forumForSpot,
      newsForSpot,
      collect,
      submitVideo,
      postForum,
      upvoteVideo,
    }),
    [
      loading, spots, checkIns, userId, spotById, spotBySlug, isCollectedToday,
      collectedCount, videosForSpot, forumForSpot, newsForSpot, collect,
      submitVideo, postForum, upvoteVideo,
    ],
  );

  return <SpotsContext.Provider value={value}>{children}</SpotsContext.Provider>;
}

export function useSpots(): SpotsContextValue {
  const ctx = useContext(SpotsContext);
  if (!ctx) throw new Error("useSpots must be used within a SpotsProvider");
  return ctx;
}
