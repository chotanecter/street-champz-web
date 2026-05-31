// src/app/checkin/spots/spotsStorage.ts
// IndexedDB persistence for the Spot Check-In game. Mirrors contests/storage.ts:
// small async helpers, graceful failure. Stores: spots, checkins, videos, forum, news.

import type { ForumPost, SpotCheckIn, SpotNewsItem, SpotVideo } from "./types";

const DB_NAME = "streetchampz-spots";
const DB_VERSION = 1;
const S_SPOTS = "spots";        // seeded spot overrides (e.g. updated checkInCount)
const S_CHECKINS = "checkins";
const S_VIDEOS = "videos";
const S_FORUM = "forum";
const S_NEWS = "news";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(S_SPOTS)) db.createObjectStore(S_SPOTS, { keyPath: "id" });
      for (const store of [S_CHECKINS, S_VIDEOS, S_FORUM, S_NEWS]) {
        if (!db.objectStoreNames.contains(store)) {
          const os = db.createObjectStore(store, { keyPath: "id" });
          os.createIndex("by_spot", "spotId", { unique: false });
        }
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function getAll<T>(store: string): Promise<T[]> {
  return openDb().then(
    (db) =>
      new Promise<T[]>((resolve, reject) => {
        const tx = db.transaction(store, "readonly");
        const req = tx.objectStore(store).getAll();
        req.onsuccess = () => resolve((req.result as T[]) ?? []);
        req.onerror = () => reject(req.error);
        tx.oncomplete = () => db.close();
      }),
  ).catch(() => [] as T[]);
}

function put<T>(store: string, value: T): Promise<void> {
  return openDb().then(
    (db) =>
      new Promise<void>((resolve, reject) => {
        const tx = db.transaction(store, "readwrite");
        tx.objectStore(store).put(value);
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => reject(tx.error);
      }),
  ).catch(() => undefined);
}

// ---- check-ins ----
export const getAllCheckIns = () => getAll<SpotCheckIn>(S_CHECKINS);
export const putCheckIn = (c: SpotCheckIn) => put(S_CHECKINS, c);

// ---- videos ----
export const getAllVideos = () => getAll<SpotVideo>(S_VIDEOS);
export const putVideo = (v: SpotVideo) => put(S_VIDEOS, v);

// ---- forum ----
export const getAllForumPosts = () => getAll<ForumPost>(S_FORUM);
export const putForumPost = (p: ForumPost) => put(S_FORUM, p);

// ---- news (placeholder now; agent-written later) ----
export const getAllNews = () => getAll<SpotNewsItem>(S_NEWS);
export const putNews = (n: SpotNewsItem) => put(S_NEWS, n);
export async function putNewsBulk(items: SpotNewsItem[]): Promise<void> {
  for (const n of items) await putNews(n);
}

/** Read a File as a base64 data URL (same contract as contests/storage.ts). */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
