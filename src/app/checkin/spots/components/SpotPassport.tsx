// src/app/checkin/spots/components/SpotPassport.tsx
// Collapsible "Skate Passport" — themed ink-stamp grid of the LA spots you've
// checked in at. Self-contained: wraps its own SpotsProvider so it can drop into
// the Profile page (mirrors SpotChallengesPanel / earlier passport).

import { useState } from "react";
import { Badge, Box, Collapse, Group, Stack, Text, UnstyledButton } from "@mantine/core";
import { ChevronDown, Stamp as StampIcon } from "lucide-react";

import { SpotsProvider, useSpots } from "../SpotsContext";
import { SPOT_GAME } from "../constants";
import { spotGlyph } from "./spotVisuals";
import type { Spot } from "../types";

/** Short tag shown on each stamp by spot type. */
function typeTag(spot: Spot): string {
  if (spot.access === "knobbed") return "KNOBBED";
  switch (spot.type) {
    case "park": return "PARK";
    case "plaza": return "PLAZA";
    case "transition": return "DITCH";
    case "diy": return "DIY";
    default: return "STREET";
  }
}

function Stamp({ spot, collected }: { spot: Spot; collected: boolean }) {
  const ink = spot.access === "knobbed" ? "var(--mantine-color-red-5)" : "var(--mantine-color-orange-5)";
  const rot = ((spot.id.charCodeAt(spot.id.length - 1) % 7) - 3) * 1.4; // stable -4..+4 deg
  return (
    <Box
      title={spot.name}
      style={{
        position: "relative",
        aspectRatio: "1 / 1",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 2,
        padding: 6,
        // double-ring rubber-stamp look
        borderRadius: "50%",
        border: collected ? `2px solid ${ink}` : "2px dashed var(--mantine-color-dark-4)",
        boxShadow: collected ? `inset 0 0 0 2px var(--mantine-color-dark-7), 0 0 0 1px ${ink}` : "none",
        background: collected
          ? "repeating-linear-gradient(45deg, rgba(232,115,44,0.10) 0 6px, rgba(232,115,44,0.04) 6px 12px)"
          : "transparent",
        color: collected ? ink : "var(--mantine-color-dark-3)",
        transform: collected ? `rotate(${rot}deg)` : "none",
        opacity: collected ? 1 : 0.5,
      }}
    >
      <span style={{ fontSize: 18, lineHeight: 1, filter: collected ? "none" : "grayscale(1)" }}>
        {spotGlyph(spot)}
      </span>
      <Text
        style={{
          fontFamily: "'Permanent Marker', cursive",
          fontSize: 9,
          lineHeight: 1,
          letterSpacing: 0.3,
          color: "inherit",
          maxWidth: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {typeTag(spot)}
      </Text>
      <Text
        style={{
          fontSize: 7.5,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 0.2,
          lineHeight: 1.05,
          color: "inherit",
          opacity: 0.85,
        }}
        lineClamp={2}
      >
        {spot.name}
      </Text>
      {collected && (
        <Text
          style={{
            position: "absolute",
            bottom: 6,
            fontFamily: "'Permanent Marker', cursive",
            fontSize: 7,
            color: ink,
            opacity: 0.8,
            transform: "rotate(-8deg)",
            letterSpacing: 0.5,
          }}
        >
          STAMPED
        </Text>
      )}
    </Box>
  );
}

function PassportInner() {
  const { spots, isCollectedToday, collectedCount } = useSpots();
  const [open, setOpen] = useState(false);
  const collected = collectedCount();
  const total = spots.length;
  const pct = total ? Math.round((collected / total) * 100) : 0;

  return (
    <Stack gap="sm">
      <UnstyledButton onClick={() => setOpen((o) => !o)}>
        <Group justify="space-between" align="center" wrap="nowrap">
          <Group gap={8} wrap="nowrap">
            <StampIcon size={18} color="var(--mantine-color-orange-5)" />
            <div>
              <Text fw={700}>Skate Passport</Text>
              <Text size="xs" c="dimmed">{SPOT_GAME.editionName} · tap to {open ? "hide" : "view"} stamps</Text>
            </div>
          </Group>
          <Group gap={8} wrap="nowrap">
            <Badge size="lg" color="orange" variant="light">{collected}/{total} · {pct}%</Badge>
            <ChevronDown
              size={18}
              style={{ transition: "transform .2s", transform: open ? "rotate(180deg)" : "none" }}
            />
          </Group>
        </Group>
      </UnstyledButton>

      <Collapse in={open}>
        <Box
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 10,
            paddingTop: 6,
          }}
        >
          {spots.map((spot) => (
            <Stamp key={spot.id} spot={spot} collected={isCollectedToday(spot.id)} />
          ))}
        </Box>
        {collected === 0 && (
          <Text size="xs" c="dimmed" ta="center" mt="sm">
            No stamps yet — head to a spot and tap the sticker to collect your first.
          </Text>
        )}
      </Collapse>
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
