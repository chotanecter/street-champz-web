// src/app/music/SongList.tsx
// Read-only playlist shown under Settings: every track in rotation.

import { useEffect, useState } from "react";
import { Badge, Group, Stack, Text } from "@mantine/core";
import { Music2 } from "lucide-react";

import { SEED_SONGS } from "./seed";
import { getUploadedSongs } from "./storage";
import type { Song } from "./types";

export function SongList() {
  const [songs, setSongs] = useState<Song[]>(SEED_SONGS);

  useEffect(() => {
    let cancelled = false;
    getUploadedSongs().then((up) => {
      if (!cancelled) setSongs([...SEED_SONGS, ...up]);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Stack gap={8}>
      <Group gap={8}>
        <Music2 size={18} color="var(--mantine-color-orange-5)" />
        <Text fw={700}>Music playlist</Text>
        <Badge size="sm" variant="light" color="orange">{songs.length}</Badge>
      </Group>
      <Text size="xs" c="dimmed">
        Plays in the top bar, muted by default — tap the title or speaker to unmute.
      </Text>
      <Stack gap={6} mt={4}>
        {songs.map((s, i) => (
          <Group
            key={s.id}
            justify="space-between"
            wrap="nowrap"
            style={{
              background: "var(--mantine-color-dark-6)",
              border: "1px solid var(--mantine-color-dark-4)",
              borderRadius: 10,
              padding: "8px 11px",
            }}
          >
            <Group gap={10} wrap="nowrap" style={{ minWidth: 0 }}>
              <Text size="sm" c="dimmed" w={18} ta="right">{i + 1}</Text>
              <div style={{ minWidth: 0 }}>
                <Text size="sm" fw={700} truncate>{s.title}</Text>
                {s.artist && <Text size="xs" c="dimmed" truncate>{s.artist}</Text>}
              </div>
            </Group>
            {s.source === "upload" && <Badge size="xs" variant="light" color="gray">added</Badge>}
          </Group>
        ))}
      </Stack>
    </Stack>
  );
}
