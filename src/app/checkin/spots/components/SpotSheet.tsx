// src/app/checkin/spots/components/SpotSheet.tsx
// Spot profile (PR-C): slide-up Drawer with Info / Videos / Forum / News and the
// NFC tap-in button (GPS-gated; dev bypass via ?dev=1 or DEV build).

import { useEffect, useState } from "react";
import {
  ActionIcon,
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Drawer,
  FileButton,
  Group,
  Stack,
  Tabs,
  Text,
  TextInput,
  ThemeIcon,
} from "@mantine/core";
import {
  ArrowUp,
  Check,
  MapPin,
  MessageSquare,
  Newspaper,
  Smartphone,
  Trophy,
  Video,
} from "lucide-react";

import { useSpots } from "../SpotsContext";
import { POINTS } from "../constants";
import { ACCESS_LABEL, spotGlyph } from "./spotVisuals";
import type { CollectResult, Spot } from "../types";

function timeAgo(ts: number): string {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const DEV_BYPASS =
  (typeof window !== "undefined" && new URLSearchParams(window.location.search).has("dev")) ||
  Boolean(import.meta.env.DEV);

export function SpotSheet({ spot, onClose }: { spot: Spot | null; onClose: () => void }) {
  const {
    isCollectedToday,
    collect,
    videosForSpot,
    forumForSpot,
    newsForSpot,
    submitVideo,
    postForum,
    upvoteVideo,
  } = useSpots();

  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<CollectResult | null>(null);
  const [postText, setPostText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setResult(null);
    setPostText("");
  }, [spot?.id]);

  if (!spot) return null;

  const collected = isCollectedToday(spot.id);
  const knobbed = spot.access === "knobbed";
  const videos = videosForSpot(spot.id);
  const forum = forumForSpot(spot.id);
  const news = newsForSpot(spot.id);
  const announcements = forum.filter((p) => p.kind === "announcement");
  const discussion = forum.filter((p) => p.kind === "discussion");

  async function handleCollect() {
    if (!spot || collected) return;
    setBusy(true);
    const res = await collect(spot.id, { bypassGps: DEV_BYPASS });
    setResult(res);
    setBusy(false);
  }

  async function handleVideo(file: File | null) {
    if (!spot || !file) return;
    setSubmitting(true);
    await submitVideo(spot.id, file);
    setSubmitting(false);
  }

  async function handlePost() {
    if (!spot || !postText.trim()) return;
    await postForum(spot.id, postText);
    setPostText("");
  }

  return (
    <Drawer
      opened={!!spot}
      onClose={onClose}
      position="bottom"
      size="92%"
      withCloseButton
      title={
        <Group gap={8}>
          <ThemeIcon variant="light" color={knobbed ? "gold" : "blue"} radius="md">
            <span style={{ fontSize: 16 }}>{spotGlyph(spot)}</span>
          </ThemeIcon>
          <div>
            <Text fw={800}>{spot.name}</Text>
            <Text size="xs" c="dimmed">{spot.neighborhood} · {spot.address}</Text>
          </div>
        </Group>
      }
      styles={{ content: { display: "flex", flexDirection: "column" } }}
    >
      <Stack gap="sm">
        <Group gap={6}>
          <Badge variant="light" color={knobbed ? "gold" : "gray"} tt="capitalize">
            {knobbed ? "Knobbed — landmark" : ACCESS_LABEL[spot.access]}
          </Badge>
          <Badge variant="light" color="gray" tt="capitalize">{spot.type}</Badge>
          {collected && (
            <Badge variant="light" color="blue" leftSection={<Check size={11} />}>Collected today</Badge>
          )}
          {spot.sponsored && (
            <Badge variant="light" color="blue" leftSection={<Trophy size={11} />}>
              {spot.sponsored.by}
            </Badge>
          )}
        </Group>

        {/* Tap-in result */}
        {result && (
          <Alert color={result.ok ? "blue" : "red"} variant="light" p="xs"
            icon={result.ok ? <Check size={16} /> : undefined}>
            {result.ok
              ? `Collected! +${result.pointsEarned} pts`
              : result.message}
          </Alert>
        )}

        {/* The NFC tap-in CTA */}
        <Button
          size="lg"
          radius="md"
          color="blue"
          disabled={collected}
          loading={busy}
          onClick={handleCollect}
          leftSection={<Smartphone size={18} />}
        >
          {collected ? "✓ Collected today" : `Tap the sticker here · +${POINTS.CHECK_IN}`}
        </Button>
        {!collected && (
          <Text size="xs" c="dimmed" ta="center" mt={-6}>
            Tap your phone to the StreetChampz sticker at the spot to check in.
            {DEV_BYPASS ? " (dev: GPS gate bypassed)" : " You must be within 100m."}
          </Text>
        )}

        <Tabs defaultValue="info" color="blue" keepMounted={false} mt="xs">
          <Tabs.List grow>
            <Tabs.Tab value="info" leftSection={<MapPin size={14} />}>Info</Tabs.Tab>
            <Tabs.Tab value="videos" leftSection={<Video size={14} />}>Videos</Tabs.Tab>
            <Tabs.Tab value="forum" leftSection={<MessageSquare size={14} />}>Forum</Tabs.Tab>
            <Tabs.Tab value="news" leftSection={<Newspaper size={14} />}>News</Tabs.Tab>
          </Tabs.List>

          {/* INFO */}
          <Tabs.Panel value="info" pt="sm">
            <Text size="sm" c="dimmed">{spot.description}</Text>
            <Group gap={6} mt="sm">
              {spot.features.map((f) => (
                <Badge key={f} variant="light" color="gray" size="sm">{f}</Badge>
              ))}
            </Group>
            <Group gap="lg" mt="md">
              <div><Text fw={800}>{spot.checkInCount.toLocaleString()}</Text><Text size="xs" c="dimmed">all-time check-ins</Text></div>
              <div><Text fw={800}>{videos.length}</Text><Text size="xs" c="dimmed">clips</Text></div>
            </Group>
          </Tabs.Panel>

          {/* VIDEOS */}
          <Tabs.Panel value="videos" pt="sm">
            <Group justify="space-between" mb="sm">
              <Text fw={700} size="sm">Clips filmed here</Text>
              <FileButton onChange={handleVideo} accept="video/*">
                {(props) => (
                  <Button {...props} size="compact-sm" variant="light" color="blue" loading={submitting}
                    leftSection={<Video size={14} />}>
                    Submit · +{POINTS.VIDEO_SUBMIT}
                  </Button>
                )}
              </FileButton>
            </Group>
            {videos.length === 0 ? (
              <Text size="sm" c="dimmed" ta="center" py="md">No clips yet — be the first.</Text>
            ) : (
              <Box style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {videos.map((v) => (
                  <Box key={v.id} style={{ background: "var(--mantine-color-dark-6)", borderRadius: 10, overflow: "hidden" }}>
                    <video src={v.url} controls style={{ width: "100%", height: 96, objectFit: "cover", background: "#000" }} />
                    <Group justify="space-between" px={8} py={6} wrap="nowrap">
                      <Text size="xs" truncate>{v.caption || v.authorName}</Text>
                      <Button size="compact-xs" variant="subtle" color="blue"
                        onClick={() => upvoteVideo(v.id)} leftSection={<ArrowUp size={12} />}>
                        {v.upvotes}
                      </Button>
                    </Group>
                  </Box>
                ))}
              </Box>
            )}
          </Tabs.Panel>

          {/* FORUM */}
          <Tabs.Panel value="forum" pt="sm">
            {announcements.map((p) => (
              <Box key={p.id} style={{ borderLeft: "2px solid var(--mantine-color-blue-6)", paddingLeft: 10, marginBottom: 8 }}>
                <Group gap={6}><Text size="sm" fw={700}>{p.authorName}</Text>
                  <Badge size="xs" color="blue">Announcement</Badge></Group>
                <Text size="sm" c="dimmed">{p.body}</Text>
              </Box>
            ))}
            <Group gap={8} mb="sm" mt={announcements.length ? "sm" : 0}>
              <TextInput
                placeholder="Say something about this spot…"
                value={postText}
                onChange={(e) => setPostText(e.currentTarget.value)}
                style={{ flex: 1 }}
                onKeyDown={(e) => { if (e.key === "Enter") handlePost(); }}
              />
              <ActionIcon size="lg" color="blue" variant="filled" onClick={handlePost} aria-label="Post">
                <MessageSquare size={16} />
              </ActionIcon>
            </Group>
            {discussion.length === 0 ? (
              <Text size="sm" c="dimmed" ta="center" py="sm">No discussion yet.</Text>
            ) : (
              discussion.map((p) => (
                <Group key={p.id} gap="sm" align="flex-start" mb="sm" wrap="nowrap">
                  <Avatar radius="xl" size="sm" color="blue">{p.authorName.slice(0, 1)}</Avatar>
                  <div style={{ minWidth: 0 }}>
                    <Group gap={6}><Text size="sm" fw={700}>{p.authorName}</Text>
                      <Text size="xs" c="dimmed">· {timeAgo(p.createdAt)}</Text></Group>
                    <Text size="sm" c="dimmed">{p.body}</Text>
                  </div>
                </Group>
              ))
            )}
          </Tabs.Panel>

          {/* NEWS */}
          <Tabs.Panel value="news" pt="sm">
            {news.length === 0 ? (
              <Text size="sm" c="dimmed" ta="center" py="md">No news yet.</Text>
            ) : (
              news.map((n) => (
                <Box key={n.id} style={{ borderBottom: "1px solid var(--mantine-color-dark-4)", paddingBottom: 8, marginBottom: 8 }}>
                  <Text size="xs" c="blue.5" fw={700} tt="uppercase">{n.category}</Text>
                  <Text fw={700} size="sm">{n.title}</Text>
                  <Text size="xs" c="dimmed">{n.summary}</Text>
                  <Text size="xs" c="dimmed" fs="italic" mt={3}>
                    ↳ {n.agentGenerated ? "curated by the StreetChampz news agent" : "placeholder — agent curation coming soon"}
                  </Text>
                </Box>
              ))
            )}
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Drawer>
  );
}
