// src/app/checkin/spots/components/SpotList.tsx
// Classic button-style list: thumbnail + name/meta + collected check circle.

import { Badge, Group, Stack, Text } from "@mantine/core";
import { Check, MapPin } from "lucide-react";

import { ACCESS_LABEL, spotGlyph } from "./spotVisuals";
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
              padding: "9px 11px",
            }}
          >
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 10,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                background: knobbed
                  ? "linear-gradient(135deg,#3a2226,#241416)"
                  : "linear-gradient(135deg,#33333d,#222)",
                overflow: "hidden",
              }}
            >
              {spot.photoUrl ? (
                <img src={spot.photoUrl} alt={spot.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                spotGlyph(spot)
              )}
            </div>

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
              {collected ? <Check size={15} strokeWidth={3} /> : <MapPin size={13} />}
            </div>
          </Group>
        );
      })}
    </Stack>
  );
}
