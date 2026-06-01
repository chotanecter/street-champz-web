// src/app/checkin/spots/components/SpotList.tsx
// Classic button-style list: name/meta + collected check circle.
// (No left-side icon/thumbnail — removed per design.)

import { Badge, Group, Stack, Text } from "@mantine/core";
import { Check } from "lucide-react";

import { ACCESS_LABEL } from "./spotVisuals";
import { distanceMeters, formatDistance } from "../geo";
import type { GeoCoords, Spot } from "../types";

interface SpotListProps {
  spots: Spot[];
  isCollected: (spotId: string) => boolean;
  onSelect: (spotId: string) => void;
  userCoords: GeoCoords | null;
}

export function SpotList({ spots, isCollected, onSelect, userCoords }: SpotListProps) {
  const rows = spots
    .map((spot) => ({
      spot,
      dist: userCoords ? distanceMeters(userCoords, spot) : null,
    }))
    .sort((a, b) => {
      // JKwon Plaza is always pinned to the top.
      const aJk = a.spot.id === "spot_jkwon";
      const bJk = b.spot.id === "spot_jkwon";
      if (aJk !== bJk) return aJk ? -1 : 1;
      if (a.dist == null || b.dist == null) return b.spot.checkInCount - a.spot.checkInCount;
      return a.dist - b.dist;
    });

  return (
    <Stack gap={8} p="xs">
      {rows.map(({ spot, dist }) => {
        const collected = isCollected(spot.id);
        const knobbed = spot.access === "knobbed";
        return (
          <Group
            key={spot.id}
            wrap="nowrap"
            gap={11}
            onClick={() => onSelect(spot.id)}
            style={{
              cursor: "pointer",
              background: "var(--mantine-color-dark-6)",
              border: `1px solid ${collected ? "rgba(232,115,44,.4)" : "var(--mantine-color-dark-4)"}`,
              borderRadius: 13,
              padding: "11px 13px",
            }}
          >
            <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
              <Text fw={700} size="sm" truncate>
                {spot.name}
              </Text>
              <Group gap={7} wrap="wrap">
                <Badge size="xs" variant="light" color={knobbed ? "gold" : "gray"}>
                  {knobbed ? "Knobbed" : ACCESS_LABEL[spot.access]}
                </Badge>
                {dist != null && (
                  <Text size="xs" c="dimmed">
                    {formatDistance(dist)}
                  </Text>
                )}
                <Text size="xs" c="dimmed">
                  · {spot.checkInCount.toLocaleString()} check-ins
                </Text>
              </Group>
            </Stack>

            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `2px solid ${collected ? "var(--mantine-color-blue-6)" : "var(--mantine-color-dark-4)"}`,
                background: collected ? "var(--mantine-color-blue-6)" : "transparent",
                color: collected ? "#1a1a1a" : "var(--mantine-color-dark-2)",
              }}
            >
              {collected ? <Check size={15} strokeWidth={3} /> : null}
            </div>
          </Group>
        );
      })}
    </Stack>
  );
}
