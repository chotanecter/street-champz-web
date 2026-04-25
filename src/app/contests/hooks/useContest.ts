import { useEffect, useState } from "react";
import { useContests } from "../ContestsContext";
import type { Contest, Submission } from "../types";

/**
 * useContest
 * ----------
 * Loads a single contest by slug and its public (submitted) entries.
 * Hook is thin on purpose — follows the pattern in src/app/progression & economy.
 */
export function useContest(slug: string | undefined) {
  const { getBySlug, listSubmissions, loading: contestsLoading } = useContests();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const contest: Contest | undefined = slug ? getBySlug(slug) : undefined;

  useEffect(() => {
    if (!contest) return;
    let cancelled = false;
    setSubmissionsLoading(true);
    listSubmissions(contest.id)
      .then((rows) => {
        if (!cancelled) setSubmissions(rows);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unknown error");
      })
      .finally(() => {
        if (!cancelled) setSubmissionsLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contest?.id]);

  return {
    contest,
    submissions,
    loading: contestsLoading || submissionsLoading,
    error,
  };
}
