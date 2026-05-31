// src/app/checkin/spots/pages/SpotGamePage.tsx
// The /checkin screen: LA Edition header + map/list toggle + map or list.
// (Spot profile sheet + tap-in arrive in PR-C; selecting a spot is stubbed to a
//  console hook here so the browse layer is independently shippable.)

import { useEffect, useState } from "react";
import { Box, Group, Stack, Text } from "@mantine/core";
import { MapPin } from "lucide-react";

import { useSpots } from "../SpotsContext";
import { SPOT_GAME } from "../constants";
import { getCurrentCoords } from "../geo";
import type { GeoCoords } from "../types";
import { SpotMap } from "../components/SpotMap";
import { SpotList } from "../components/SpotList";
import { ViewToggle, type SpotView } from "../components/ViewToggle";

export function SpotGamePage({ onSelectSpot }: { onSelectSpot?: (spotId: string) => void }) {
  const { spots, isCollectedToday, collectedCount } = useSpots();
  const [view, setView] = useState<SpotView>("map");
  const [coords, setCoords] = useState<GeoCoords | null>(null);

  useEffect(() => {
    let cancelled = false;
    getCurrentCoords().then(({ coords: c }) => {
      if (!cancelled) setCoords(c);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelect = (spotId: string) => {
    if (onSelectSpot) onSelectSpot(spotId);
    else window.history.pushState({}, "", `/checkin/spot/${spotId}`);
  };

  return (
    <Stack gap={0} style={{ height: "100%" }}>
      <Box px="md" pt="sm" pb="xs" style={{ borderBottom: "1px solid var(--mantine-color-dark-4)" }}>
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <div>
            <Group gap={8} align="center">
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: "var(--mantine-color-blue-5)",
                  boxShadow: "0 0 8px var(--mantine-color-blue-5)",
                  display: "inline-block",
                }}
              />
              <Text fw={800} size="lg">
                Check In — {SPOT_GAME.editionName}
              </Text>
            </Group>
            <Text size="xs" c="dimmed" mt={2}>
              {SPOT_GAME.sponsorNote} · tap a spot&apos;s sticker to collect it
            </Text>
          </div>
          <ViewToggle view={view} onChange={setView} collected={collectedCount()} total={spots.length} />
        </Group>
      </Box>

      <Box style={{ flex: 1, minHeight: 360, position: "relative" }}>
        {view === "map" ? (
          <SpotMap
            spots={spots}
            isCollected={isCollectedToday}
            onSelect={handleSelect}
            userCoords={coords}
          />
        ) : (
          <Box style={{ position: "absolute", inset: 0, overflowY: "auto", paddingBottom: 16 }}>
            {spots.length === 0 ? (
              <Group justify="center" py="xl">
                <MapPin size={18} />
                <Text c="dimmed">No spots yet.</Text>
              </Group>
            ) : (
              <SpotList
                spots={spots}
                isCollected={isCollectedToday}
                onSelect={handleSelect}
                userCoords={coords}
              />
            )}
          </Box>
        )}
      </Box>
    </Stack>
  );
}

export default SpotGamePage;
