// src/app/checkin/spots/components/SpotPreview.tsx
// Location-profile preview with a Photos / Map toggle:
//  • Photos = a small left-to-right scrollable carousel of the spot's photos
//            (where the sticker is). Falls back to placeholder tiles until real
//            photos are added (spot.photos in Phase 2).
//  • Map    = a small Leaflet map preview centered on the spot.

import { useEffect, useRef, useState } from "react";
import { Box, SegmentedControl } from "@mantine/core";
import { Camera } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import type { Spot } from "../types";
import { spotGlyph } from "./spotVisuals";

const PREVIEW_H = 150;

function PhotoCarousel({ spot }: { spot: Spot }) {
  const photos = spot.photos && spot.photos.length > 0 ? spot.photos : [];
  const tiles = photos.length > 0 ? photos : [null, null, null];

  return (
    <Box
      style={{
        display: "flex",
        gap: 8,
        overflowX: "auto",
        height: PREVIEW_H,
        scrollSnapType: "x mandatory",
        paddingBottom: 4,
      }}
    >
      {tiles.map((src, i) => (
        <Box
          key={i}
          style={{
            flex: "0 0 auto",
            width: 220,
            height: PREVIEW_H - 6,
            borderRadius: 12,
            overflow: "hidden",
            scrollSnapAlign: "start",
            background: "var(--mantine-color-dark-6)",
            border: "1px solid var(--mantine-color-dark-4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 6,
            color: "var(--mantine-color-dark-2)",
          }}
        >
          {src ? (
            <img src={src} alt={`${spot.name} ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <>
              <span style={{ fontSize: 26, opacity: 0.5 }}>{spotGlyph(spot)}</span>
              <Camera size={16} />
              <span style={{ fontSize: 11 }}>Photo coming soon</span>
            </>
          )}
        </Box>
      ))}
    </Box>
  );
}

function MapPreview({ spot }: { spot: Spot }) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!elRef.current || mapRef.current) return;
    const map = L.map(elRef.current, {
      center: [spot.lat, spot.lng],
      zoom: 15,
      zoomControl: false,
      attributionControl: true,
      dragging: true,
      scrollWheelZoom: false,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);
    L.marker([spot.lat, spot.lng]).addTo(map);
    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 0);
    setTimeout(() => map.invalidateSize(), 250);
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [spot.lat, spot.lng]);

  return (
    <Box
      ref={elRef}
      style={{
        height: PREVIEW_H,
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid var(--mantine-color-dark-4)",
        background: "#15151a",
      }}
    />
  );
}

export function SpotPreview({ spot }: { spot: Spot }) {
  const [mode, setMode] = useState<"photos" | "map">("photos");

  return (
    <Box>
      <SegmentedControl
        size="xs"
        fullWidth
        value={mode}
        onChange={(v) => setMode(v as "photos" | "map")}
        data={[
          { label: "Photos", value: "photos" },
          { label: "Map", value: "map" },
        ]}
        mb={8}
      />
      {mode === "photos" ? <PhotoCarousel spot={spot} /> : <MapPreview spot={spot} />}
    </Box>
  );
}
