// src/app/checkin/spots/components/RecentCheckInsFeed.tsx
// One unified recent check-ins feed: Username · City · Time.
// Sources REAL check-ins only (no fake data) — the presence check-in (top
// "Check In" button) and any geo/sticker spot collect. In mock mode that's the
// signed-in user; Phase 2 swaps to the global backend feed of all skaters.

import { useMemo } from "react";
import { Avatar, Box, Group, ScrollArea, Stack, Text } from "@mantine/core";
import { Clock } from "lucide-react";

import { useSpots } from "../SpotsContext";
import { useCheckIn } from "../../CheckInContext";
import { useAuth } from "../../../auth/context";

interface Row {
  id: string;
  username: string;
  city: string;
  timestamp: number;
}

function timeAgo(ts: number): string {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const MAX_ROWS = 12;

export function RecentCheckInsFeed() {
  const { checkIns, spotById, userId } = useSpots();
  const presence = useCheckIn();
  const auth = useAuth() as { username?: string };
  const myName = auth?.username || "You";

  const rows = useMemo<Row[]>(() => {
    const out: Row[] = [];

    // 1) presence check-in (top "Check In" button)
    if (presence.myCheckIn) {
      const ts = new Date(presence.myCheckIn.checkedInAt).getTime();
      out.push({
        id: `presence_${ts}`,
        username: myName,
        city: presence.myCheckIn.spotLabel || "Los Angeles",
        timestamp: Number.isNaN(ts) ? Date.now() : ts,
      });
    }

    // 2) sticker / spot collects
    checkIns
      .filter((c) => c.userId === userId)
      .forEach((c) => {
        const spot = spotById(c.spotId);
        out.push({
          id: c.id,
          username: myName,
          city: spot?.neighborhood || spot?.name || "Los Angeles",
          timestamp: c.timestamp,
        });
      });

    return out.sort((a, b) => b.timestamp - a.timestamp).slice(0, MAX_ROWS);
  }, [checkIns, spotById, userId, presence.myCheckIn, myName]);

  return (
    <Box px="md" pt="xs">
      <Group gap={6} mb={8}>
        <Clock size={15} color="var(--mantine-color-blue-5)" />
        <Text fw={700} size="sm">Recent check-ins</Text>
      </Group>

      {rows.length === 0 ? (
        <Box
          style={{
            background: "var(--mantine-color-dark-6)",
            border: "1px solid var(--mantine-color-dark-4)",
            borderRadius: 10,
            padding: "14px 12px",
          }}
        >
          <Text size="sm" c="dimmed" ta="center">
            No check-ins yet. Tap in above or at a spot sticker to start the feed.
          </Text>
        </Box>
      ) : (
        <ScrollArea.Autosize mah={240} type="auto">
          <Stack gap={6}>
            {rows.map((e) => (
              <Group
                key={e.id}
                justify="space-between"
                wrap="nowrap"
                style={{
                  background: "var(--mantine-color-dark-6)",
                  border: "1px solid var(--mantine-color-dark-4)",
                  borderRadius: 10,
                  padding: "7px 10px",
                }}
              >
                <Group gap={9} wrap="nowrap" style={{ minWidth: 0 }}>
                  <Avatar size={26} radius="xl" color="orange">
                    {e.username.slice(0, 1).toUpperCase()}
                  </Avatar>
                  <Box style={{ minWidth: 0 }}>
                    <Text size="sm" fw={700} truncate>{e.username}</Text>
                    <Text size="xs" c="dimmed" truncate>{e.city}</Text>
                  </Box>
                </Group>
                <Text size="xs" c="dimmed" style={{ whiteSpace: "nowrap" }}>
                  {timeAgo(e.timestamp)}
                </Text>
              </Group>
            ))}
          </Stack>
        </ScrollArea.Autosize>
      )}
    </Box>
  );
}
