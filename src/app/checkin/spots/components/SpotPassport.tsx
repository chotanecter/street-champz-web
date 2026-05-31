// src/app/checkin/spots/components/SpotPassport.tsx
// "Skate Passport" — a stamp grid showing which LA spots you've checked in at.
// Self-contained: wraps its own SpotsProvider so it can drop into the Profile
// page (which isn't otherwise inside SpotsProvider), mirroring SpotChallengesPanel.

import { Badge, Box, Group, Stack, Text } from "@mantine/core";
import { Check } from "lucide-react";

import { SpotsProvider, useSpots } from "../SpotsContext";
import { SPOT_GAME } from "../constants";
import { spotGlyph } from "./spotVisuals";
import type { Spot } from "../types";

function Stamp({ spot, collected }: { spot: Spot; collected: boolean }) {
  return (
    <Box
      title={spot.name}
      style={{
        position: "relative",
        aspectRatio: "1 / 1",
        borderRadius: "50%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        padding: 4,
        textAlign: "center",
        border: collected
          ? "2px solid var(--mantine-color-orange-5)"
          : "2px dashed var(--mantine-color-dark-4)",
        background: collected ? "rgba(232,115,44,0.12)" : "transparent",
        color: collected ? "var(--mantine-color-orange-4)" : "var(--mantine-color-dark-3)",
        transform: collected ? "rotate(-6deg)" : "none",
        opacity: collected ? 1 : 0.55,
      }}
    >
      <span style={{ fontSize: 18, lineHeight: 1, filter: collected ? "none" : "grayscale(1)" }}>
        {spotGlyph(spot)}
      </span>
      <Text
        style={{
          fontSize: 8,
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: 0.2,
          lineHeight: 1.05,
          maxWidth: "100%",
          overflow: "hidden",
          color: "inherit",
        }}
        lineClamp={2}
      >
        {spot.name}
      </Text>
      {collected && (
        <Box
          style={{
            position: "absolute",
            top: 2,
            right: 4,
            color: "var(--mantine-color-orange-5)",
          }}
        >
          <Check size={11} strokeWidth={3} />
        </Box>
      )}
    </Box>
  );
}

function PassportInner() {
  const { spots, isCollectedToday, collectedCount } = useSpots();
  const collected = collectedCount();
  const total = spots.length;
  const pct = total ? Math.round((collected / total) * 100) : 0;

  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-start">
        <div>
          <Text fw={700}>Skate Passport</Text>
          <Text size="xs" c="dimmed">
            {SPOT_GAME.editionName} · stamp a spot by tapping in
          </Text>
        </div>
        <Badge size="lg" color="orange" variant="light">
          {collected}/{total} · {pct}%
        </Badge>
      </Group>

      <Box
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 10,
        }}
      >
        {spots.map((spot) => (
          <Stamp key={spot.id} spot={spot} collected={isCollectedToday(spot.id)} />
        ))}
      </Box>

      {collected === 0 && (
        <Text size="xs" c="dimmed" ta="center">
          No stamps yet — head to a spot and tap the sticker to collect your first.
        </Text>
      )}
    </Stack>
  );
}

export function SpotPassport() {
  return (
    <SpotsProvider>
      <PassportInner />
    </SpotsProvider>
  );
}
