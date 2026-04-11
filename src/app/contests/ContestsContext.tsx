import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Contest, Submission } from "./types";
import { getAllContests, putContest, deleteContestBySlug } from "./storage";

/**
 * ContestsContext
 * ----------------
 * Lightweight cache + fetcher for the S.K.A.T.E. Challenge game mode.
 *
 * v1 calls `${VITE_API_BASE}/contests`. In development with no API yet,
 * set `VITE_CONTESTS_MOCK=true` and the context returns a single hard-coded
 * Stuffed Toy Challenge so the UI can be built against realistic data.
 *
 * On production (no backend), the context falls back to IndexedDB so admins
 * can author/edit contests locally and have them persist across reloads.
 */

interface ContestsState {
  contests: Contest[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getBySlug: (slug: string) => Contest | undefined;
  listSubmissions: (contestId: string) => Promise<Submission[]>;
  saveContest: (contest: Contest) => Promise<void>;
  deleteContest: (slug: string) => Promise<void>;
}

const ContestsContext = createContext<ContestsState | null>(null);

const API_BASE = (import.meta as unknown as { env: Record<string, string> }).env.VITE_API_BASE ?? "/api";
const MOCK = (import.meta as unknown as { env: Record<string, string> }).env.VITE_CONTESTS_MOCK === "true";

const STUFFED_TOY_MOCK: Contest = {
  id: "contest:stuffed-toy-challenge",
  title: "Stuffed Toy Challenge",
  slug: "stuffed-toy-challenge",
  description:
    "Legendary skater Stevie Williams drops five tricks. Match all five and the CannabisHouse exclusive stuffed toy is yours.",
  heroImageUrl: "",
  prizeDescription: "Exclusive limited-edition stuffed toy from CannabisHouse, shipped to the winner.",
  sponsor: {
    id: "sponsor:cannabishouse",
    name: "CannabisHouse",
    logoUrl: "",
  },
  featuredSkater: {
    id: "skater:stevie-williams",
    name: "Stevie Williams",
    slug: "stevie-williams",
    bio: "Legendary Philly-born street skater. DGK founder.",
    avatarUrl: "",
  },
  tricks: [
    { letter: "S", trickName: "TBD", videoUrl: "" },
    { letter: "K", trickName: "TBD", videoUrl: "" },
    { letter: "A", trickName: "TBD", videoUrl: "" },
    { letter: "T", trickName: "TBD", videoUrl: "" },
    { letter: "E", trickName: "TBD", videoUrl: "" },
  ],
  startAt: new Date().toISOString(),
  submissionsCloseAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21).toISOString(),
  judgingCloseAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 28).toISOString(),
  status: "live",
  judges: [],
  winnerCount: 1,
  winners: [],
  createdBy: "user:master",
  createdAt: new Date().toISOString(),
};

export function ContestsProvider({ children }: { children: ReactNode }) {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadFromStorage = useCallback(async (): Promise<Contest[]> => {
    const stored = await getAllContests();
    if (stored.length > 0) return stored;
    // First run on this device — seed with the mock so admins have something to edit.
    await putContest(STUFFED_TOY_MOCK);
    return [STUFFED_TOY_MOCK];
  }, []);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (MOCK) {
        setContests(await loadFromStorage());
      } else {
        const res = await fetch(`${API_BASE}/contests`, { credentials: "include" });
        if (!res.ok) throw new Error(`Failed to load contests: ${res.status}`);
        const data: Contest[] = await res.json();
        setContests(data);
      }
    } catch (err) {
      // Fall back to local storage so the UI is never empty in production.
      console.warn("[contests] fetch failed, using local storage", err);
      try {
        setContests(await loadFromStorage());
        setError(null);
      } catch (storageErr) {
        setContests([STUFFED_TOY_MOCK]);
        setError(null);
        console.warn("[contests] storage fallback failed", storageErr);
      }
    } finally {
      setLoading(false);
    }
  }, [loadFromStorage]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const listSubmissions = async (contestId: string): Promise<Submission[]> => {
    if (MOCK) return [];
    const slug = contests.find((c) => c.id === contestId)?.slug;
    if (!slug) return [];
    try {
      const res = await fetch(`${API_BASE}/contests/${slug}/submissions`, { credentials: "include" });
      if (!res.ok) return [];
      return (await res.json()) as Submission[];
    } catch {
      return [];
    }
  };

  const saveContest = useCallback(
    async (contest: Contest) => {
      await putContest(contest);
      setContests((prev) => {
        const idx = prev.findIndex((c) => c.slug === contest.slug);
        if (idx === -1) return [...prev, contest];
        const next = prev.slice();
        next[idx] = contest;
        return next;
      });
    },
    [],
  );

  const deleteContest = useCallback(async (slug: string) => {
    await deleteContestBySlug(slug);
    setContests((prev) => prev.filter((c) => c.slug !== slug));
  }, []);

  const value = useMemo<ContestsState>(
    () => ({
      contests,
      loading,
      error,
      refetch,
      getBySlug: (slug: string) => contests.find((c) => c.slug === slug),
      listSubmissions,
      saveContest,
      deleteContest,
    }),
    [contests, loading, error, refetch, saveContest, deleteContest],
  );

  return <ContestsContext.Provider value={value}>{children}</ContestsContext.Provider>;
}

export function useContests(): ContestsState {
  const ctx = useContext(ContestsContext);
  if (!ctx) throw new Error("useContests must be used inside <ContestsProvider>");
  return ctx;
}
