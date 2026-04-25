import {
  ActionIcon,
  Badge,
  Button,
  Divider,
  FileButton,
  Group,
  Loader,
  Modal,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  Textarea,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2, Upload } from "lucide-react";
import { useContests } from "../ContestsContext";
import type { Contest, FeaturedTrick, Scorecard, Submission, TrickLetter } from "../types";
import { fileToDataUrl } from "../storage";
import { ScorecardForm } from "./ScorecardForm";

/**
 * AdminContestsPanel — contest management view for the admin portal.
 *
 * Lets admins:
 *   • Create new S.K.A.T.E. contests from scratch
 *   • Edit any existing contest (title, sponsor, skater, prize, status)
 *   • Upload (or paste a URL for) the trick video for each S/K/A/T/E letter
 *   • Reveal/hide a contest to players (scheduled ↔ live)
 *   • Review submissions and submit judge scorecards
 *
 * Persistence on production goes through IndexedDB via the contests context's
 * `saveContest` / `deleteContest` helpers, so admins can author content with
 * no backend.
 */

const LETTERS: TrickLetter[] = ["S", "K", "A", "T", "E"];

function emptyTricks(): FeaturedTrick[] {
  return LETTERS.map((l) => ({ letter: l, trickName: "", videoUrl: "" }));
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function blankContest(): Contest {
  const now = new Date().toISOString();
  return {
    id: `contest:${Date.now()}`,
    title: "",
    slug: "",
    description: "",
    heroImageUrl: "",
    prizeDescription: "",
    sponsor: { id: "sponsor:new", name: "", logoUrl: "" },
    featuredSkater: {
      id: "skater:new",
      name: "",
      slug: "",
      bio: "",
      avatarUrl: "",
    },
    tricks: emptyTricks(),
    startAt: now,
    submissionsCloseAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21).toISOString(),
    judgingCloseAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 28).toISOString(),
    status: "scheduled",
    judges: [],
    winnerCount: 1,
    winners: [],
    createdBy: "user:master",
    createdAt: now,
  };
}

export function AdminContestsPanel() {
  const { contests, loading, error, listSubmissions, saveContest, deleteContest } = useContests();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [subsLoading, setSubsLoading] = useState(false);
  const [active, setActive] = useState<Submission | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  // Editor modal state
  const [editorOpened, { open: openEditor, close: closeEditor }] = useDisclosure(false);
  const [draft, setDraft] = useState<Contest | null>(null);
  const [draftBusy, setDraftBusy] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);

  const selectedContest = useMemo(
    () => contests.find((c) => c.slug === selectedSlug) ?? null,
    [contests, selectedSlug],
  );
  const isLive =
    selectedContest?.status === "live" ||
    selectedContest?.status === "judging" ||
    selectedContest?.status === "complete";

  useEffect(() => {
    if (!selectedSlug) {
      setSubmissions([]);
      return;
    }
    if (!selectedContest) return;
    setSubsLoading(true);
    listSubmissions(selectedContest.id)
      .then(setSubmissions)
      .catch(() => setSubmissions([]))
      .finally(() => setSubsLoading(false));
  }, [selectedSlug, selectedContest, listSubmissions]);

  const toggleLive = async () => {
    if (!selectedContest) return;
    setDraftBusy(true);
    try {
      const next: Contest = { ...selectedContest, status: isLive ? "scheduled" : "live" };
      await saveContest(next);
    } finally {
      setDraftBusy(false);
    }
  };

  const startCreate = () => {
    setDraft(blankContest());
    setDraftError(null);
    openEditor();
  };

  const startEdit = () => {
    if (!selectedContest) return;
    // Deep copy so the form doesn't mutate the live contest until Save.
    setDraft(JSON.parse(JSON.stringify(selectedContest)));
    setDraftError(null);
    openEditor();
  };

  const handleDelete = async () => {
    if (!selectedContest) return;
    if (!window.confirm(`Delete "${selectedContest.title}"? This cannot be undone.`)) return;
    await deleteContest(selectedContest.slug);
    setSelectedSlug(null);
  };

  const handleSaveDraft = async () => {
    if (!draft) return;
    if (!draft.title.trim()) {
      setDraftError("Title is required");
      return;
    }
    const slug = draft.slug.trim() || slugify(draft.title);
    if (!slug) {
      setDraftError("Slug is required");
      return;
    }
    setDraftBusy(true);
    setDraftError(null);
    try {
      const finalContest: Contest = {
        ...draft,
        slug,
        id: draft.id || `contest:${Date.now()}`,
      };
      await saveContest(finalContest);
      setSelectedSlug(slug);
      closeEditor();
      setDraft(null);
    } catch (err) {
      setDraftError(err instanceof Error ? err.message : "Failed to save contest");
    } finally {
      setDraftBusy(false);
    }
  };

  const handleTrickFile = async (letter: TrickLetter, file: File | null) => {
    if (!file || !draft) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      setDraft({
        ...draft,
        tricks: draft.tricks.map((t) => (t.letter === letter ? { ...t, videoUrl: dataUrl } : t)),
      });
    } catch (err) {
      setDraftError(err instanceof Error ? err.message : "Failed to read video file");
    }
  };

  const updateTrick = (letter: TrickLetter, patch: Partial<FeaturedTrick>) => {
    if (!draft) return;
    setDraft({
      ...draft,
      tricks: draft.tricks.map((t) => (t.letter === letter ? { ...t, ...patch } : t)),
    });
  };

  const saveScorecard = async (
    sub: Submission,
    card: Omit<Scorecard, "submissionId" | "judgeId" | "submittedAt">,
  ) => {
    if (!selectedContest) return;
    const base = (import.meta as unknown as { env: Record<string, string> }).env.VITE_API_BASE ?? "/api";
    try {
      await fetch(`${base}/contests/${selectedContest.slug}/submissions/${sub.id}/scorecards`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(card),
      });
    } catch {
      // No backend on prod — silently no-op for now.
    }
    close();
  };

  if (loading) return <Loader />;
  if (error) return <Text c="red">{error}</Text>;

  const isExisting = !!(draft && contests.some((c) => c.slug === draft.slug));

  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-start">
        <Stack gap={4}>
          <Title order={3}>Contests</Title>
          <Text c="dimmed" size="sm">
            Create and manage S.K.A.T.E. challenges. Upload trick videos for each letter and reveal the contest when
            ready.
          </Text>
        </Stack>
        <Button leftSection={<Plus size={16} />} onClick={startCreate}>
          Create new contest
        </Button>
      </Group>

      <Group align="flex-end">
        <Select
          label="Contest"
          placeholder="Select a contest"
          value={selectedSlug}
          onChange={setSelectedSlug}
          data={contests.map((c) => ({ value: c.slug, label: c.title || c.slug }))}
          style={{ flex: 1 }}
        />
        {selectedContest && (
          <Group>
            <Tooltip label="Edit contest">
              <ActionIcon variant="light" size="lg" onClick={startEdit}>
                <Pencil size={18} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Delete contest">
              <ActionIcon variant="light" color="red" size="lg" onClick={handleDelete}>
                <Trash2 size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>
        )}
      </Group>

      {selectedContest && (
        <Paper withBorder radius="md" p="md">
          <Group justify="space-between" align="center">
            <Stack gap={4}>
              <Group gap="xs">
                <Text fw={600}>{selectedContest.title}</Text>
                <Badge color={isLive ? "green" : "gray"} variant="light">
                  {selectedContest.status}
                </Badge>
              </Group>
              <Text size="sm" c="dimmed">
                {isLive
                  ? "Live — players can see the trick videos and submit clips."
                  : "Scheduled — players see a Coming Soon placeholder until you reveal the tricks."}
              </Text>
            </Stack>
            <Button
              color={isLive ? "orange" : "green"}
              variant={isLive ? "light" : "filled"}
              loading={draftBusy}
              onClick={toggleLive}
            >
              {isLive ? "Hide tricks" : "Reveal tricks (go live)"}
            </Button>
          </Group>
        </Paper>
      )}

      {subsLoading && <Loader size="sm" />}

      {selectedSlug && !subsLoading && submissions.length === 0 && (
        <Text c="dimmed" size="sm">
          No submissions yet for this contest.
        </Text>
      )}

      {submissions.length > 0 && (
        <Paper withBorder radius="md" p="md">
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Player</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Upvotes</Table.Th>
                <Table.Th>Judge score</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {submissions.map((sub) => (
                <Table.Tr key={sub.id}>
                  <Table.Td>{sub.playerName}</Table.Td>
                  <Table.Td>{sub.status}</Table.Td>
                  <Table.Td>{sub.upvoteCount}</Table.Td>
                  <Table.Td>{sub.judgeScore}</Table.Td>
                  <Table.Td>
                    <Button
                      size="xs"
                      onClick={() => {
                        setActive(sub);
                        open();
                      }}
                    >
                      Score
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      )}

      <Modal opened={opened} onClose={close} title="Judge scorecard" size="lg">
        {active && <ScorecardForm submission={active} onSubmit={(card) => saveScorecard(active, card)} />}
      </Modal>

      <Modal
        opened={editorOpened}
        onClose={() => {
          closeEditor();
          setDraft(null);
        }}
        title={isExisting ? "Edit contest" : "Create contest"}
        size="xl"
      >
        {draft && (
          <Stack gap="md">
            {draftError && (
              <Text c="red" size="sm">
                {draftError}
              </Text>
            )}
            <Group grow>
              <TextInput
                label="Title"
                required
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.currentTarget.value })}
              />
              <TextInput
                label="Slug"
                placeholder="auto from title"
                value={draft.slug}
                onChange={(e) => setDraft({ ...draft, slug: e.currentTarget.value })}
              />
            </Group>
            <Textarea
              label="Description"
              minRows={2}
              autosize
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.currentTarget.value })}
            />
            <Textarea
              label="Prize description"
              minRows={2}
              autosize
              value={draft.prizeDescription}
              onChange={(e) => setDraft({ ...draft, prizeDescription: e.currentTarget.value })}
            />
            <Group grow>
              <TextInput
                label="Sponsor name"
                value={draft.sponsor.name}
                onChange={(e) => setDraft({ ...draft, sponsor: { ...draft.sponsor, name: e.currentTarget.value } })}
              />
              <TextInput
                label="Featured skater"
                value={draft.featuredSkater.name}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    featuredSkater: {
                      ...draft.featuredSkater,
                      name: e.currentTarget.value,
                      slug: slugify(e.currentTarget.value),
                    },
                  })
                }
              />
            </Group>

            <Divider label="Trick videos" labelPosition="left" />
            <Text size="xs" c="dimmed">
              Upload a video file or paste a video URL for each letter. Uploaded files are stored locally in your
              browser via IndexedDB. Large files (over ~50&nbsp;MB) may slow the page; prefer hosted URLs for HD clips.
            </Text>

            {draft.tricks.map((trick) => (
              <Paper key={trick.letter} withBorder radius="md" p="sm">
                <Stack gap="xs">
                  <Group align="flex-end">
                    <Title order={4} style={{ width: 32, textAlign: "center" }}>
                      {trick.letter}
                    </Title>
                    <TextInput
                      label="Trick name"
                      placeholder="e.g. Kickflip"
                      value={trick.trickName}
                      onChange={(e) => updateTrick(trick.letter, { trickName: e.currentTarget.value })}
                      style={{ flex: 1 }}
                    />
                    <FileButton accept="video/*" onChange={(file) => handleTrickFile(trick.letter, file)}>
                      {(props) => (
                        <Button {...props} variant="light" leftSection={<Upload size={14} />}>
                          Upload
                        </Button>
                      )}
                    </FileButton>
                  </Group>
                  <TextInput
                    label="Video URL"
                    placeholder="https://... or leave blank if uploading a file"
                    value={trick.videoUrl.startsWith("data:") ? "" : trick.videoUrl}
                    onChange={(e) => updateTrick(trick.letter, { videoUrl: e.currentTarget.value })}
                  />
                  {trick.videoUrl && (
                    <video
                      src={trick.videoUrl}
                      controls
                      style={{ width: "100%", maxHeight: 220, background: "#000", borderRadius: 6 }}
                    />
                  )}
                </Stack>
              </Paper>
            ))}

            <Group justify="flex-end" mt="md">
              <Button
                variant="default"
                onClick={() => {
                  closeEditor();
                  setDraft(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveDraft} loading={draftBusy}>
                Save contest
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}
