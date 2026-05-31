// src/app/checkin/spots/components/ViewToggle.tsx
// The map/list switch. Doubles as the collected-progress readout ("N/total").

import { Group, UnstyledButton } from "@mantine/core";
import { List, Map as MapIcon } from "lucide-react";

export type SpotView = "map" | "list";

interface ViewToggleProps {
  view: SpotView;
  onChange: (v: SpotView) => void;
  collected: number;
  total: number;
}

export function ViewToggle({ view, onChange, collected, total }: ViewToggleProps) {
  return (
    <Group
      gap={6}
      wrap="nowrap"
      style={{
        border: "1px solid var(--mantine-color-blue-6)",
        borderRadius: 20,
        padding: "4px 6px",
      }}
    >
      <UnstyledButton
        onClick={() => onChange("map")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontSize: 12,
          fontWeight: 700,
          padding: "2px 6px",
          borderRadius: 14,
          color: view === "map" ? "var(--mantine-color-blue-5)" : "var(--mantine-color-dark-2)",
        }}
      >
        <MapIcon size={14} /> Map
      </UnstyledButton>
      <span style={{ color: "var(--mantine-color-dark-3)" }}>·</span>
      <UnstyledButton
        onClick={() => onChange("list")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontSize: 12,
          fontWeight: 700,
          padding: "2px 6px",
          borderRadius: 14,
          color: view === "list" ? "var(--mantine-color-blue-5)" : "var(--mantine-color-dark-2)",
        }}
      >
        <List size={14} /> {collected}/{total}
      </UnstyledButton>
    </Group>
  );
}
