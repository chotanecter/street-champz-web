import type { Contest } from "./types";

/**
 * IndexedDB-backed persistence for S.K.A.T.E. contests.
 *
 * The contests game mode currently has no backend on production, so admins
 * need a way to author/edit contests (and upload trick videos) that survives
 * page reloads. We use IndexedDB because video data URLs can run into the
 * tens of megabytes, which would blow past the localStorage quota.
 *
 * One object store, keyed by `slug`. Each record is a full Contest object,
 * with `tricks[].videoUrl` containing either an absolute URL the admin
 * pasted in or a `data:video/...;base64,...` data URL produced by reading
 * an uploaded file with FileReader.
 */

const DB_NAME = "skate-contests";
const DB_VERSION = 1;
const STORE = "contests";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "slug" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllContests(): Promise<Contest[]> {
  try {
    const db = await openDb();
    return await new Promise<Contest[]>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => resolve((req.result as Contest[]) ?? []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

export async function putContest(contest: Contest): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(contest);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteContestBySlug(slug: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(slug);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Read a File from an <input type="file"> as a base64 data URL so it can be
 * persisted in IndexedDB and rendered by a <video> tag without a backend.
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
