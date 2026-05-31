// src/app/checkin/pages/CheckInPage.tsx
// /checkin — tap to check in with GPS, then see who's skating within a mile.
import { useState } from 'react';
import {
  ActionIcon,
  Alert,
  Box,
  Button,
  Card,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { LogOut, MapPin, RefreshCw, Users } from 'lucide-react';
import { motion } from 'framer-motion';

import { useCheckIn } from '../CheckInContext';
import { timeAgo } from '../geo';
import { SkaterCard } from '../components/SkaterCard';
import { RecentCheckInsFeed } from '../spots/components/RecentCheckInsFeed';

const MotionDiv = motion.div;

export function CheckInPage() {
  const {
    status,
    myCheckIn,
    nearby,
    error,
    lastUpdated,
    locationDenied,
    doCheckIn,
    doCheckOut,
    refresh,
  } = useCheckIn();

  const [spotLabel, setSpotLabel] = useState('');
  const busy = status === 'locating' || status === 'checking-in';
  const checkedIn = status === 'checked-in' && myCheckIn;

  return (
    <Box p="md" pb="lg">
      <Group justify="space-between" align="flex-start" mb="md">
        <div>
          <Title order={2}>Check In</Title>
          <Text size="sm" c="white" style={{ fontFamily: "'Permanent Marker', cursive" }}>
            Tap in at your spot and see who&apos;s skating nearby.
          </Text>
        </div>
        <MapPin size={28} color="var(--mantine-color-orange-6)" />
      </Group>

      {error && (
        <Alert color="red" variant="light" mb="md">
          {error}
          {locationDenied && (
            <Text size="xs" mt={4} c="dimmed">
              Check your browser/site location permission, then tap Check In again.
            </Text>
          )}
        </Alert>
      )}

      {!checkedIn ? (
        // ---- Not checked in: the check-in form ----
        <Card withBorder radius="md" padding="lg">
          <Stack>
            <TextInput
              label="Spot name (optional)"
              placeholder="e.g. Embarcadero Stairs"
              value={spotLabel}
              onChange={(e) => setSpotLabel(e.currentTarget.value)}
              leftSection={<MapPin size={16} />}
            />
            <Button
              size="lg"
              color="orange"
              radius="md"
              loading={busy}
              onClick={() => doCheckIn(spotLabel)}
              leftSection={<MapPin size={20} />}
            >
              {status === 'locating' ? 'Getting location…' : 'Check In'}
            </Button>
            <Text size="xs" c="dimmed" ta="center">
              We grab your location once to find skaters within a mile. You stay
              checked in for 2 hours or until you check out.
            </Text>
          </Stack>
        </Card>
      ) : (
        // ---- Checked in: status + nearby list ----
        <Stack gap="md">
          <Card withBorder radius="md" padding="md" bg="dark.6">
            <Group justify="space-between" wrap="nowrap">
              <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                <MotionDiv
                  animate={{ scale: [1, 1.25, 1], opacity: [1, 0.6, 1] }}
                  transition={{ repeat: Infinity, duration: 1.8 }}
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: 'var(--mantine-color-orange-5)',
                    flexShrink: 0,
                  }}
                />
                <Stack gap={2} style={{ minWidth: 0 }}>
                  <Text fw={700} truncate>
                    {myCheckIn?.spotLabel || 'Checked in'}
                  </Text>
                  <Text size="xs" c="dimmed">
                    since {timeAgo(myCheckIn!.checkedInAt)}
                  </Text>
                </Stack>
              </Group>
              <Button
                size="compact-sm"
                color="gray"
                variant="light"
                leftSection={<LogOut size={14} />}
                onClick={doCheckOut}
              >
                Check out
              </Button>
            </Group>
          </Card>

          <Group justify="space-between">
            <Group gap={6}>
              <Users size={16} color="var(--mantine-color-orange-6)" />
              <Text fw={700}>
                {nearby.length} skater{nearby.length === 1 ? '' : 's'} nearby
              </Text>
            </Group>
            <Group gap={6}>
              {lastUpdated && (
                <Text size="xs" c="dimmed">
                  updated {timeAgo(new Date(lastUpdated).toISOString())}
                </Text>
              )}
              <ActionIcon variant="light" color="orange" onClick={refresh} aria-label="Refresh">
                <RefreshCw size={16} />
              </ActionIcon>
            </Group>
          </Group>

          {nearby.length === 0 ? (
            <Card withBorder radius="md" padding="xl">
              <Text ta="center" c="dimmed">
                No one else skating within a mile right now. Be the magnet —
                others will see you for the next 2 hours.
              </Text>
            </Card>
          ) : (
            <Stack gap="sm">
              {nearby.map((s) => (
                <SkaterCard key={s.userId} skater={s} />
              ))}
            </Stack>
          )}
        </Stack>
      )}

      <RecentCheckInsFeed />
    </Box>
  );
}

export default CheckInPage;
