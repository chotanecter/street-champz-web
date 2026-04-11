import { Badge, Button, Group, Loader, Modal, Paper, Select, Stack, Table, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { useContests } from "../ContestsContext";
import type { Scorecard, Submission } from "../types";
import { ScorecardForm } from "./ScorecardForm";

/**
 * AdminContestsPanel — contest management view for the admin portal.
 *
 * Responsibilities:
 *   • List every contest (draft, live, judging, complete)
 *   • Pick one, load its submissions
 *   • Open a scoring modal per submission using <ScorecardForm>
 *
 * The panel assumes it is mounted inside <ContestsProvider>, which the admin
 * route wraps around it. Actual persistence of scorecards hits
 * `POST /contests/:slug/submissions/:id/scorecards` on the backend — stubbed
 * here against the same fetch pattern used by the rest of the contests UI.
 */
export function AdminContestsPanel() {
  const { contests, loading, error, listSubmissions } = useContests();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [subsLoading, setSubsLoading] = useState(false);
  const [active, setActive] = useState<Submission | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [statusOverride, setStatusOverride] = useState<Record<string, string>>({});
  const [statusBusy, setStatusBusy] = useState(false);

  useEffect(() => {
    if (!selectedSlug) {
      setSubmissions([]);
      return;
    }
    const contest = contests.find((c) => c.slug === selectedSlug);
    if (!contest) return;
    setSubsLoading(true);
    listSubmissions(contest.id)
      .then(setSubmissions)
      .catch(() => setSubmissions([]))
      .finally(() => setSubsLoading(false));
  }, [selectedSlug, contests, listSubmissions]);

  if (loading) return <Loader />;
  if (error) return <Text c="red">{error}</Text>;

  const selectedContest = contests.find((c) => c.slug === selectedSlug);
  const effectiveStatus = selectedContest
    ? statusOverride[selectedContest.slug] ?? selectedContest.status
    : null;
  const isLive =
    effectiveStatus === "live" ||
    effectiveStatus === "judging" ||
    effectiveStatus === "complete";

  const toggleLive = async () => {
    if (!selectedContest) return;
    setStatusBusy(true);
    const next = isLive ? "scheduled" : "live";
    const base =
      (import.meta as unknown as { env: Record<string, string> }).env.VITE_API_BASE ?? "/api";
    try {
      await fetch(`${base}/contests/${selectedContest.slug}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      setStatusOverride((prev) => ({ ...prev, [selectedContest.slug]: next }));
    } finally {
      setStatusBusy(false);
    }
  };

  const saveScorecard = async (
    sub: Submission,
    card: Omit<Scorecard, "submissionId" | "judgeId" | "submittedAt">,
  ) => {
    const contest = contests.find((c) => c.slug === selectedSlug);
    if (!contest) return;
    const base = (import.meta as unknown as { env: Record<string, string> }).env.VITE_API_BASE ?? "/api";
    await fetch(`${base}/contests/${contest.slug}/submissions/${sub.id}/scorecards`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(card),
    });
    close();
  };

  return (
    <Stack gap="md">
      <Title order={3}>Contests</Title>
      <Text c="dimmed" size="sm">
        Pick a contest to review its completed entries and submit judge scorecards.
      </Text>

      <Select
        label="Contest"
        placeholder="Select a contest"
        data={contests.map((c) => ({ value: c.slug, label: `${c.title} (${c.status})` }))}
        value={selectedSlug}
        onChange={setSelectedSlug}
        searchable
      />

      {selectedContest && (
        <Paper withBorder radius="md" p="md">
          <Group justify="space-between" align="center">
            <Stack gap={2}>
              <Group gap="xs">
                <Text fw={700}>{selectedContest.title}</Text>
                <Badge color={isLive ? "green" : "gray"} variant="light">
                  {effectiveStatus}
                </Badge>
              </Group>
              <Text size="sm" c="dimmed">
                {isLive
                  ? "The featured trick videos are revealed to players."
                  : "Players see a Coming Soon placeholder until you reveal the tricks."}
              </Text>
            </Stack>
            <Button
              color={isLive ? "orange" : "green"}
              variant={isLive ? "light" : "filled"}
              loading={statusBusy}
              onClick={toggleLive}
            >
              {isLive ? "Hide tricks" : "Reveal tricks (go live)"}
            </Button>
          </Group>
        </Paper>
      )}

      {subsLoading && <Loader size="sm" />}

      {selectedSlug && !subsLoading && submissions.length === 0 && (
        <Text c="dimmed">No submissions yet for this contest.</Text>
      )}

      {submissions.length > 0 && (
        <Paper withBorder radius="md" p="md">
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Player</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Upvotes</Table.Th>
                <Table.Th>Score</Table.Th>
                <Table.Th></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {submissions.map((s) => (
                <Table.Tr key={s.id}>
                  <Table.Td>{s.playerName}</Table.Td>
                  <Table.Td>
                    <Badge variant="light">{s.status}</Badge>
                  </Table.Td>
                  <Table.Td>{s.upvoteCount}</Table.Td>
                  <Table.Td>{s.judgeScore.toFixed(1)}</Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Button
                        size="xs"
                        onClick={() => {
                          setActive(s);
                          open();
                        }}
                      >
                        Score entry
                      </Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      )}

      <Modal opened={opened} onClose={close} title="Judge scorecard" size="lg">
        {active && (
          <ScorecardForm
            submission={active}
            onSubmit={(card) => saveScorecard(active, card)}
          />
        )}
      </Modal>
    </Stack>
  );
}
