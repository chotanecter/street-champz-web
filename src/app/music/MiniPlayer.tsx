// src/app/music/MiniPlayer.tsx
// Compact header player: small note icon + scrolling (marquee) track title + a
// mute/unmute toggle. Muted by default.

import { ActionIcon, Box, Group } from "@mantine/core";
import { Music2, Volume2, VolumeX } from "lucide-react";

import { useMusic } from "./MusicContext";

export function MiniPlayer() {
  const { current, muted, toggleMuted, next } = useMusic();
  if (!current) return null;

  const label = current.artist ? `${current.artist} — ${current.title}` : current.title;
  // duplicate the text so the marquee loops seamlessly
  const marquee = `${label}     ★     `;

  return (
    <Group gap={6} wrap="nowrap" style={{ maxWidth: 180, minWidth: 0 }}>
      <ActionIcon
        size="sm"
        variant="subtle"
        color="orange"
        onClick={next}
        aria-label="Next track"
        title="Next track"
      >
        <Music2 size={15} />
      </ActionIcon>

      <Box
        onClick={toggleMuted}
        style={{
          flex: 1,
          minWidth: 0,
          overflow: "hidden",
          whiteSpace: "nowrap",
          cursor: "pointer",
          maskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
          WebkitMaskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
        }}
        title={muted ? "Tap to unmute" : "Tap to mute"}
      >
        <Box
          component="span"
          style={{
            display: "inline-block",
            paddingLeft: "100%",
            fontSize: 11,
            fontWeight: 700,
            color: muted ? "var(--mantine-color-dark-1)" : "var(--mantine-color-orange-4)",
            animation: "sc-marquee 12s linear infinite",
          }}
        >
          {marquee}
          {marquee}
        </Box>
      </Box>

      <ActionIcon
        size="sm"
        variant={muted ? "subtle" : "light"}
        color="orange"
        onClick={toggleMuted}
        aria-label={muted ? "Unmute music" : "Mute music"}
        title={muted ? "Unmute music" : "Mute music"}
      >
        {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
      </ActionIcon>

      <style>{`@keyframes sc-marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
    </Group>
  );
}
