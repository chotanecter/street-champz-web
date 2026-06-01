// src/app/checkin/spots/components/JkwonMerch.tsx
// JKwon "Season 1" merch lookbook — shows the attached lineup as a gallery.
// Used both as a tab in the JKwon Plaza spot profile and via a banner on the
// Check In page (opened in a modal).

import { Badge, Box, Button, Group, Image, Modal, Stack, Text } from "@mantine/core";
import { ShoppingBag } from "lucide-react";

// Season 1 lookbook pages (static assets in /public/jkwon-merch).
export const JKWON_MERCH_IMAGES = [
  "/jkwon-merch/season1-1.png",
];

/** Optional external shop link — point this at the real store when ready. */
const SHOP_URL = "";

export function JkwonMerchGallery() {
  return (
    <Stack gap="sm">
      <Group gap={8}>
        <ShoppingBag size={18} color="var(--mantine-color-orange-5)" />
        <div>
          <Text fw={800}>JKwon — Season 1</Text>
          <Text size="xs" c="dimmed">The Season 1 merch lineup</Text>
        </div>
        <Badge color="orange" variant="light" ml="auto">Lookbook</Badge>
      </Group>

      <Stack gap={10}>
        {JKWON_MERCH_IMAGES.map((src, i) => (
          <Box
            key={src}
            style={{
              borderRadius: 12,
              overflow: "hidden",
              border: "1px solid var(--mantine-color-dark-4)",
              background: "var(--mantine-color-dark-6)",
            }}
          >
            <Image src={src} alt={`JKwon Season 1 — look ${i + 1}`} loading="lazy" />
          </Box>
        ))}
      </Stack>

      {SHOP_URL ? (
        <Button
          component="a"
          href={SHOP_URL}
          target="_blank"
          rel="noopener noreferrer"
          color="orange"
          radius="md"
          leftSection={<ShoppingBag size={16} />}
        >
          Shop the collection
        </Button>
      ) : (
        <Text size="xs" c="dimmed" ta="center">More drops coming soon.</Text>
      )}
    </Stack>
  );
}

/** Modal wrapper for the Check In page banner entry point. */
export function JkwonMerchModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap={8}>
          <ShoppingBag size={18} color="var(--mantine-color-orange-5)" />
          <Text fw={800}>JKwon — Season 1 Merch</Text>
        </Group>
      }
      size="lg"
      scrollAreaComponent={undefined}
    >
      <JkwonMerchGallery />
    </Modal>
  );
}

/** Banner card for the Check In page that opens the merch modal. */
export function JkwonMerchBanner({ onOpen }: { onOpen: () => void }) {
  return (
    <Box
      onClick={onOpen}
      style={{
        cursor: "pointer",
        borderRadius: 14,
        padding: 16,
        marginTop: 12,
        background: "linear-gradient(135deg, #ff9555 0%, #e8732c 55%, #b3551d 100%)",
        boxShadow: "0 0 18px rgba(232,115,44,0.40)",
        border: "1px solid rgba(255,255,255,0.25)",
      }}
    >
      <Group justify="space-between" wrap="nowrap">
        <Group gap={10} wrap="nowrap">
          <ShoppingBag size={22} color="#1a1a1a" />
          <div>
            <Text fw={800} c="dark.9">JKwon — Season 1 Merch</Text>
            <Text size="xs" c="dark.8">Tap to view the lineup</Text>
          </div>
        </Group>
        <Badge color="dark" variant="filled">New</Badge>
      </Group>
    </Box>
  );
}
