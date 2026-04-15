import { Group, ActionIcon, Indicator, Badge, Drawer, Stack, Text, ScrollArea, Button } from "@mantine/core";
import { Bell, Users, Swords, UserPlus } from "lucide-react";
import { notifications } from "@mantine/notifications";
import { useLocation } from "wouter";
import classes from "./header.module.css";
import { useSocial } from "../../../social/context";
import { useState, useEffect } from "react";
import { ENV } from "../../../../config/env";
import { UserAvatar } from "../../../../components";

interface OnlinePlayer {
    id: string;
    username: string;
    country: string | null;
    countryCode: string | null;
    city: string | null;
    avatar?: string | null;
}

function countryCodeToFlag(code: string | null): string {
    if (!code || code.length !== 2) return "🌍";
    return String.fromCodePoint(
        ...code.toUpperCase().split("").map(c => 0x1F1E0 + c.charCodeAt(0) - 65)
    );
}

export function Header() {
    const { unreadCount, sendFriendRequest } = useSocial();
    const [_, navigate] = useLocation();
    const [onlineCount, setOnlineCount] = useState<number>(0);
    const [onlinePlayers, setOnlinePlayers] = useState<OnlinePlayer[]>([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchOnline = async () => {
        try {
            const res = await fetch(ENV.apiBaseUrl + "/stats/online");
            if (!res.ok) return;
            const data = await res.json();
            setOnlineCount(data.count);
            setOnlinePlayers(data.players);
        } catch {}
    };

    useEffect(() => {
        fetchOnline();
        const interval = setInterval(fetchOnline, 30000); // refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const handleOpenDrawer = async () => {
        setDrawerOpen(true);
        setLoading(true);
        await fetchOnline();
        setLoading(false);
    };

    return (
        <div className={classes.root}>
            {/* Left: Online Count */}
            <Group gap="xs">
                <Badge
                    size="lg"
                    variant="filled"
                    color="green"
                    leftSection={<Users size={12} />}
                    style={{ cursor: "pointer" }}
                    onClick={handleOpenDrawer}
                >
                    {onlineCount} Online
                </Badge>
            </Group>

            {/* Right: Notifications */}
            <Group justify="end" gap="xs">
                <Indicator
                    disabled={unreadCount === 0}
                    label={unreadCount}
                    size={16}
                    color="red"
                >
                    <ActionIcon
                        variant="subtle"
                        size="lg"
                        onClick={() => navigate("/social")}
                        aria-label="Notifications"
                    >
                        <Bell size={20} />
                    </ActionIcon>
                </Indicator>
            </Group>

            {/* Online Players Drawer */}
            <Drawer
                opened={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                title={
                    <Group gap="xs">
                        <Users size={20} />
                        <Text fw={700}>{onlineCount} Players Online</Text>
                    </Group>
                }
                position="bottom"
                size="60%"
            >
                <ScrollArea h={300}>
                    {loading ? (
                        <Text c="dimmed" ta="center" py="xl">Loading...</Text>
                    ) : onlinePlayers.length === 0 ? (
                        <Text c="dimmed" ta="center" py="xl">No players online right now</Text>
                    ) : (
                        <Stack gap="xs">
                            {onlinePlayers.map(player => (
                                <Group key={player.id} gap="md" p="xs" style={{ borderRadius: 8, background: 'rgba(255,255,255,0.04)' }} wrap="nowrap">
                                    <UserAvatar userId={player.id} username={player.username} size="sm" localAvatar={player.avatar} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <Text size="sm" fw={600} truncate>{player.username}</Text>
                                        {player.country && (
                                            <Text size="xs" c="dimmed">
                                                {countryCodeToFlag(player.countryCode)} {player.city ? `${player.city}, ` : ''}{player.country}
                                            </Text>
                                        )}
                                    </div>
                                    <Group gap="xs" wrap="nowrap">
                                        <Button
                                            size="compact-xs"
                                            variant="light"
                                            color="blue"
                                            leftSection={<Swords size={12} />}
                                            onClick={() => {
                                                navigate("/");
                                                setDrawerOpen(false);
                                                notifications.show({
                                                    title: "Challenge Sent! ⚔️",
                                                    message: `Challenge sent to ${player.username}`,
                                                    color: "blue",
                                                });
                                            }}
                                        >
                                            Challenge
                                        </Button>
                                        <Button
                                            size="compact-xs"
                                            variant="light"
                                            color="green"
                                            leftSection={<UserPlus size={12} />}
                                            onClick={() => sendFriendRequest(player.username)}
                                        >
                                            Add
                                        </Button>
                                    </Group>
                                </Group>
                            ))}
                        </Stack>
                    )}
                </ScrollArea>
            </Drawer>
        </div>
    );
}
