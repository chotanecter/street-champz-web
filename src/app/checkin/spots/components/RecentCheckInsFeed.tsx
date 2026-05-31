// src/app/checkin/spots/components/RecentCheckInsFeed.tsx
// Compact "recent check-ins" mini feed: Username · City · Time.
// Shows the signed-in user's OWN check-ins from BOTH systems — the presence
// check-in (top "Check In" button) and spot collects — merged with seeded
// other-skater activity for mock mode. Real "You" rows always sort to the top
// when fresh, so pressing Check In shows you immediately.

import { useMemo } from "react";
import { Avatar, Box, Group, ScrollArea, Stack, Text } from "@mantine/core";
import { Clock } from "lucide-react";

import { useSpots } from "../SpotsContext";
import { useCheckIn } from "../../CheckInContext";
import { seedFeed, type FeedEntry } from "../mockFeed";

function timeAgo(ts: number): string {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const MAX_ROWS = 8;

export function RecentCheckInsFeed() {
  const { checkIns, spotById, userId } = useSpots();
  const presence = useCheckIn();

  const entries = useMemo<FeedEntry[]>(() => {
    const mine: FeedEntry[] = [];

    // 1) presence check-in (the top "Check In" button)
    if (presence.myCheckIn) {
      const ts = new Date(presence.myCheckIn.checkedInAt).getTime();
      mine.push({
        id: `presence_${ts}`,
        username: "You",
        city: presence.myCheckIn.spotLabel || "Los Angeles",
        timestamp: Number.isNaN(ts) ? Date.now() : ts,
      });
    }

    // 2) spot collects (tap-in at a curated spot)
    checkIns
      .filter((c) => c.userId === userId)
      .forEach((c) => {
        const spot = spotById(c.spotId);
        mine.push({
          id: c.id,
          username: "You",
          city: spot?.neighborhood || spot?.name || "Los Angeles",
          timestamp: c.timestamp,
        });
      });

    return [...mine, ...seedFeed()]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, MAX_ROWS);
  }, [checkIns, spotById, userId, presence.myCheckIn]);

  return (
    <Box px="md" pt="xs">
      <Group gap={6} mb={8}>
        <Clock size={15} color="var(--mantine-color-blue-5)" />
        <Text fw={700} size="sm">Recent check-ins</Text>
      </Group>

      <ScrollArea.Autosize mah={210} type="auto">
        <Stack gap={6}>
          {entries.map((e) => {
            const isYou = e.username === "You";
            return (
              <Group
                key={e.id}
                justify="space-between"
                wrap="nowrap"
                style={{
                  background: "var(--mantine-color-dark-6)",
                  border: `1px solid ${isYou ? "rgba(232,115,44,.4)" : "var(--mantine-color-dark-4)"}`,
                  borderRadius: 10,
                  padding: "7px 10px",
                }}
              >
                <Group gap={9} wrap="nowrap" style={{ minWidth: 0 }}>
                  <Avatar size={26} radius="xl" color={isYou ? "orange" : "blue"}>
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
            );
          })}
        </Stack>
      </ScrollArea.Autosize>
    </Box>
  );
}
