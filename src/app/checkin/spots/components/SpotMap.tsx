// src/app/checkin/spots/components/SpotMap.tsx
// Leaflet + OpenStreetMap map of LA spots. No API key. Imperative Leaflet (no
// react-leaflet dependency) — markers are HTML divIcons we restyle per state.

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import type { GeoCoords, Spot } from "../types";
import { pinColor, spotGlyph } from "./spotVisuals";

interface SpotMapProps {
  spots: Spot[];
  isCollected: (spotId: string) => boolean;
  onSelect: (spotId: string) => void;
  userCoords: GeoCoords | null;
}

const LA_CENTER: [number, number] = [34.05, -118.3];

function pinHtml(spot: Spot, collected: boolean): string {
  const bg = pinColor(spot, collected);
  return (
    `<div style="transform:translate(-50%,-100%);text-align:center">` +
    `<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:${bg};` +
    `transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;` +
    `border:2px solid rgba(255,255,255,.35);box-shadow:0 2px 6px rgba(0,0,0,.5)">` +
    `<span style="transform:rotate(45deg);font-size:13px">${spotGlyph(spot)}</span></div></div>`
  );
}

export function SpotMap({ spots, isCollected, onSelect, userCoords }: SpotMapProps) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const meRef = useRef<L.CircleMarker | null>(null);

  // init once
  useEffect(() => {
    if (!elRef.current || mapRef.current) return;
    const map = L.map(elRef.current, {
      center: LA_CENTER,
      zoom: 11,
      zoomControl: true,
      attributionControl: true,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);
    mapRef.current = map;
    // container often sizes after mount (flex/tab layout) — nudge Leaflet to recompute
    setTimeout(() => map.invalidateSize(), 0);
    setTimeout(() => map.invalidateSize(), 250);
    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = {};
      meRef.current = null;
    };
  }, []);

  // (re)draw spot markers when data/collected-state changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};
    spots.forEach((spot) => {
      const collected = isCollected(spot.id);
      const icon = L.divIcon({
        className: "sc-spot-pin",
        html: pinHtml(spot, collected),
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      });
      const marker = L.marker([spot.lat, spot.lng], { icon, title: spot.name }).addTo(map);
      marker.on("click", () => onSelect(spot.id));
      markersRef.current[spot.id] = marker;
    });
  }, [spots, isCollected, onSelect]);

  // user location dot
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (meRef.current) {
      meRef.current.remove();
      meRef.current = null;
    }
    if (userCoords) {
      meRef.current = L.circleMarker([userCoords.lat, userCoords.lng], {
        radius: 7,
        color: "#fff",
        weight: 3,
        fillColor: "#339af0",
        fillOpacity: 1,
      }).addTo(map);
    }
  }, [userCoords]);

  return <div ref={elRef} style={{ height: "100%", width: "100%", background: "#15151a" }} />;
}
