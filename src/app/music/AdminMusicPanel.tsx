// src/app/music/AdminMusicPanel.tsx
// Admin portal: upload songs (stored in IndexedDB as base64) and manage the
// playlist. Seed tracks are shown read-only; uploads can be removed.

import { useEffect, useRef, useState } from "react";
import {
  Badge,
  Button,
  Card,
  FileButton,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { Music2, Trash2, Upload } from "lucide-react";

import { SEED_SONGS } from "./seed";
import { deleteSong, fileToDataUrl, getUploadedSongs, putSong, uid } from "./storage";
import type { Song } from "./types";

export function AdminMusicPanel() {
  const [uploaded, setUploaded] = useState<Song[]>([]);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [busy, setBusy] = useState(false);
  const resetRef = useRef<() => void>(null);

  async function refresh() {
    setUploaded(await getUploadedSongs());
  }
  useEffect(() => {
    void refresh();
  }, []);

  async function handleFile(file: File | null) {
    if (!file) return;
    setBusy(true);
    try {
      const url = await fileToDataUrl(file);
      const cleanName = file.name.replace(/\.[^.]+$/, "");
      const song: Song = {
        id: uid(),
        title: title.trim() || cleanName,
        artist: artist.trim() || undefined,
        url,
        source: "upload",
        createdAt: Date.now(),
      };
      await putSong(song);
      setTitle("");
      setArtist("");
      resetRef.current?.();
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    await deleteSong(id);
    await refresh();
  }

  return (
    <Stack gap="lg">
      <Title order={3}>Music</Title>

      <Card withBorder radius="md" padding="md">
        <Stack gap="sm">
          <Text fw={700} size="sm">Add a song</Text>
          <Group grow>
            <TextInput
              label="Title (optional)"
              placeholder="Defaults to the file name"
              value={title}
              onChange={(e) => setTitle(e.currentTarget.value)}
            />
            <TextInput
              label="Artist (optional)"
              placeholder="e.g. Ice Cube"
              value={artist}
              onChange={(e) => setArtist(e.currentTarget.value)}
            />
          </Group>
          <FileButton onChange={handleFile} accept="audio/*" resetRef={resetRef}>
            {(props) => (
              <Button {...props} loading={busy} leftSection={<Upload size={16} />} color="orange">
                Upload audio file
              </Button>
            )}
          </FileButton>
          <Text size="xs" c="dimmed">
            Stored on this device (IndexedDB) until the backend is live. Make sure you
            hold the rights to publish any track you add.
          </Text>
        </Stack>
      </Card>

      <div>
        <Text fw={700} size="sm" mb="xs">Default tracks</Text>
        <Stack gap={6}>
          {SEED_SONGS.map((s) => (
            <Group key={s.id} justify="space-between" wrap="nowrap"
              style={{ background: "var(--mantine-color-dark-6)", borderRadius: 8, padding: "8px 11px" }}>
              <Group gap={10} wrap="nowrap" style={{ minWidth: 0 }}>
                <Music2 size={16} />
                <div style={{ minWidth: 0 }}>
                  <Text size="sm" fw={700} truncate>{s.title}</Text>
                  {s.artist && <Text size="xs" c="dimmed" truncate>{s.artist}</Text>}
                </div>
              </Group>
              <Badge size="xs" variant="light" color="gray">default</Badge>
            </Group>
          ))}
        </Stack>
      </div>

      <div>
        <Text fw={700} size="sm" mb="xs">Uploaded tracks</Text>
        {uploaded.length === 0 ? (
          <Text size="sm" c="dimmed">No uploaded songs yet.</Text>
        ) : (
          <Stack gap={6}>
            {uploaded.map((s) => (
              <Group key={s.id} justify="space-between" wrap="nowrap"
                style={{ background: "var(--mantine-color-dark-6)", borderRadius: 8, padding: "8px 11px" }}>
                <Group gap={10} wrap="nowrap" style={{ minWidth: 0 }}>
                  <Music2 size={16} />
                  <div style={{ minWidth: 0 }}>
                    <Text size="sm" fw={700} truncate>{s.title}</Text>
                    {s.artist && <Text size="xs" c="dimmed" truncate>{s.artist}</Text>}
                  </div>
                </Group>
                <Button size="compact-xs" variant="subtle" color="red"
                  leftSection={<Trash2 size={13} />} onClick={() => remove(s.id)}>
                  Remove
                </Button>
              </Group>
            ))}
          </Stack>
        )}
      </div>
    </Stack>
  );
}
