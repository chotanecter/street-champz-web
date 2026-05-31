// src/app/checkin/spots/components/SpotGameSection.tsx
// Embeddable Spot Check-In game section. Renders BELOW the presence check-in.
// List is the default view; the map is compact. Owns the selected-spot sheet.

import { useEffect, useState } from "react";
import { Box, Divider, Group, Stack, Text } from "@mantine/core";

import { useSpots } from "../SpotsContext";
import { SPOT_GAME } from "../constants";
import { getCurrentCoords } from "../geo";
import type { GeoCoords } from "../types";
import { SpotMap } from "./SpotMap";
import { SpotList } from "./SpotList";
import { SpotSheet } from "./SpotSheet";
import { ViewToggle, type SpotView } from "./ViewToggle";

const MAP_HEIGHT = 240;

export function SpotGameSection() {
  const { spots, isCollectedToday, collectedCount, spotById } = useSpots();
  const [view, setView] = useState<SpotView>("list"); // list is the default
  const [coords, setCoords] = useState<GeoCoords | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getCurrentCoords().then(({ coords: c }) => { if (!cancelled) setCoords(c); });
    return () => { cancelled = true; };
  }, []);

  return (
    <Box px="md" pb={96}>
      <Divider my="md" />

      <Group justify="space-between" align="flex-start" wrap="nowrap" mb="sm">
        <div>
          <Text fw={800}>Spot Check-In — {SPOT_GAME.editionName}</Text>
          <Text size="xs" c="dimmed">{SPOT_GAME.sponsorNote} · tap a spot&apos;s sticker to collect it</Text>
        </div>
        <ViewToggle view={view} onChange={setView} collected={collectedCount()} total={spots.length} />
      </Group>

      {view === "map" ? (
        <Box style={{ height: MAP_HEIGHT, borderRadius: 14, overflow: "hidden", border: "1px solid var(--mantine-color-dark-4)" }}>
          <SpotMap spots={spots} isCollected={isCollectedToday} onSelect={setSelectedId} userCoords={coords} />
        </Box>
      ) : (
        <SpotList spots={spots} isCollected={isCollectedToday} onSelect={setSelectedId} userCoords={coords} />
      )}

      <SpotSheet spot={selectedId ? spotById(selectedId) ?? null : null} onClose={() => setSelectedId(null)} />
    </Box>
  );
}
