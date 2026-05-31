// src/app/checkin/components/SkaterCard.tsx
import { Avatar, Badge, Card, Group, Stack, Text } from '@mantine/core';
import { MapPin } from 'lucide-react';

import { formatDistance, timeAgo } from '../geo';
import type { NearbySkater } from '../types';

export function SkaterCard({ skater }: { skater: NearbySkater }) {
  return (
    <Card withBorder radius="md" padding="sm">
      <Group justify="space-between" wrap="nowrap">
        <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
          <Avatar radius="xl" color="orange">
            {skater.username.slice(0, 1).toUpperCase()}
          </Avatar>
          <Stack gap={2} style={{ minWidth: 0 }}>
            <Text fw={700} size="sm" truncate>
              {skater.username}
            </Text>
            {skater.spotLabel ? (
              <Group gap={4} wrap="nowrap">
                <MapPin size={12} color="var(--mantine-color-orange-6)" />
                <Text size="xs" c="dimmed" truncate>
                  {skater.spotLabel}
                </Text>
              </Group>
            ) : (
              <Text size="xs" c="dimmed">
                checked in {timeAgo(skater.checkedInAt)}
              </Text>
            )}
          </Stack>
        </Group>

        <Stack gap={2} align="flex-end">
          <Badge color="orange" variant="light">
            {formatDistance(skater.distanceMeters)}
          </Badge>
          {skater.spotLabel && (
            <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
              {timeAgo(skater.checkedInAt)}
            </Text>
          )}
        </Stack>
      </Group>
    </Card>
  );
}
