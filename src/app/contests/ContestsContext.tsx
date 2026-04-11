import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Contest, Submission } from "./types";

/**
 * ContestsContext
 * ----------------
 * Lightweight cache + fetcher for the S.K.A.T.E. Challenge game mode.
 *
 * v1 calls `${VITE_API_BASE}/contests`. In development with no API yet,
 * set `VITE_CONTESTS_MOCK=true` and the context returns a single hard-coded
 * Stuffed Toy Challenge so the UI can be built against realistic data.
 */

interface ContestsState {
  contests: Contest[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getBySlug: (slug: string) => Contest | undefined;
  listSubmissions: (contestId: string) => Promise<Submission[]>;
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
  judgingCloseAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 24).toISOString(),
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

  const refetch = async () => {
    setLoading(true);
    setError(null);
    try {
      if (MOCK) {
        setContests([STUFFED_TOY_MOCK]);
      } else {
        const res = await fetch(`${API_BASE}/contests`, { credentials: "include" });
        if (!res.ok) throw new Error(`Failed to load contests: ${res.status}`);
        const data: Contest[] = await res.json();
        setContests(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const listSubmissions = async (contestId: string): Promise<Submission[]> => {
    if (MOCK) return [];
    const slug = contests.find((c) => c.id === contestId)?.slug;
    if (!slug) return [];
    const res = await fetch(`${API_BASE}/contests/${slug}/submissions`, { credentials: "include" });
    if (!res.ok) throw new Error(`Failed to load submissions: ${res.status}`);
    return (await res.json()) as Submission[];
  };

  const value = useMemo<ContestsState>(
    () => ({
      contests,
      loading,
      error,
      refetch,
      getBySlug: (slug: string) => contests.find((c) => c.slug === slug),
      listSubmissions,
    }),
    [contests, loading, error],
  );

  return <ContestsContext.Provider value={value}>{children}</ContestsContext.Provider>;
}

export function useContests(): ContestsState {
  const ctx = useContext(ContestsContext);
  if (!ctx) throw new Error("useContests must be used inside <ContestsProvider>");
  return ctx;
}
