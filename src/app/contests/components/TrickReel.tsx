import { Badge, Card, Group, SimpleGrid, Text, Title } from "@mantine/core";
import { motion } from "framer-motion";
import type { FeaturedTrick } from "../types";
import { TRICK_ORDER } from "../types";

interface Props {
  tricks: FeaturedTrick[];
  skaterName: string;
}

/**
 * TrickReel — the hero row of 5 featured-skater videos (S K A T E).
 * Each card is a `<video>` element on hover-to-preview; tapping expands
 * to full-screen playback in a parent-owned modal (not included in v1 scaffold).
 */
export function TrickReel({ tricks, skaterName }: Props) {
  const orderedTricks = TRICK_ORDER.map((letter) => tricks.find((t) => t.letter === letter)).filter(
    (t): t is FeaturedTrick => Boolean(t),
  );

  return (
    <div>
      <Group justify="space-between" mb="sm">
        <Title order={3}>{skaterName}'s Five Tricks</Title>
        <Text size="sm" c="dimmed">
          Match all five to complete the challenge.
        </Text>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 5 }} spacing="md">
        {orderedTricks.map((trick, idx) => (
          <motion.div
            key={trick.letter}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08, duration: 0.35 }}
          >
            <Card withBorder radius="md" p={0} style={{ overflow: "hidden" }}>
              <div style={{ position: "relative", aspectRatio: "9 / 16", background: "#000" }}>
                {trick.videoUrl ? (
                  <video
                    src={trick.videoUrl}
                    muted
                    playsInline
                    loop
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLVideoElement).play()}
                    onMouseLeave={(e) => {
                      const v = e.currentTarget as HTMLVideoElement;
                      v.pause();
                      v.currentTime = 0;
                    }}
                  />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      height: "100%",
                      color: "#666",
                    }}
                  >
                    video TBD
                  </div>
                )}
                <Badge
                  size="xl"
                  color="gold"
                  variant="filled"
                  style={{ position: "absolute", top: 8, left: 8 }}
                >
                  {trick.letter}
                </Badge>
              </div>
              <Card.Section inheritPadding py="xs">
                <Text fw={600} size="sm" truncate>
                  {trick.trickName || "Trick TBD"}
                </Text>
                {trick.difficulty && (
                  <Text size="xs" c="dimmed">
                    {trick.difficulty}
                  </Text>
                )}
              </Card.Section>
            </Card>
          </motion.div>
        ))}
      </SimpleGrid>
    </div>
  );
}
