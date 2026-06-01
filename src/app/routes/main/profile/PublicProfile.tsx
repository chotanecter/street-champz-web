import { useEffect, useState } from "react";
import { Stack, Group, Text, Title, Badge, Button, Center, Loader } from "@mantine/core";
import { ArrowLeft, MapPin, Star } from "lucide-react";
import { useLocation } from "wouter";
import { GameCard, UserAvatar } from "../../../../components";
import { ENV } from "../../../../config/env";
import { useAuth } from "../../../auth/context";
import classes from "./publicProfile.module.css";

function countryCodeToFlag(code: string | null | undefined): string {
    if (!code || code.length !== 2) return "";
    return String.fromCodePoint(
        ...code.toUpperCase().split("").map(c => 0x1F1E0 + c.charCodeAt(0) - 65)
    );
}

interface PlayerData {
    username: string;
    points: number | null;
    rank: number | null;
    country?: string | null;
    countryCode?: string | null;
    city?: string | null;
}

export function PublicProfile({ userId }: { userId: string }) {
    const [, navigate] = useLocation();
    const auth = useAuth();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<PlayerData>({ username: "", points: null, rank: null });

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const base = ENV.apiBaseUrl;
            const headers = { "Authorization": "Bearer " + auth.token };
            const result: PlayerData = { username: "", points: null, rank: null };

            try {
                const u = await (await fetch(base + "/users/" + userId, { headers })).json();
                result.username = u.username || "";
                result.country = u.country ?? null;
                result.countryCode = u.country_code ?? null;
                result.city = u.city ?? null;
                if (typeof u.points === "number") result.points = u.points;
            } catch { /* ignore */ }

            try {
                const lb = await (await fetch(base + "/leaderboard", { headers })).json();
                const arr = Array.isArray(lb) ? lb : [];
                const me = arr.find((x: any) => x.id === userId);
                if (me) {
                    result.rank = me.rank ?? null;
                    if (result.points == null) result.points = me.points ?? null;
                    if (!result.username) result.username = me.username || "";
                }
            } catch { /* ignore */ }

            if (!cancelled) {
                setData(result);
                setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [userId, auth.token]);

    if (loading) {
        return <Center py="xl"><Loader /></Center>;
    }

    const name = data.username || "Player";
    const flag = countryCodeToFlag(data.countryCode);
    const hasLocation = !!(data.city || data.country);
    const rankColor = data.rank === 1 ? "var(--mantine-color-gold-5)"
        : data.rank && data.rank <= 3 ? "var(--mantine-color-orange-5)"
        : "var(--mantine-color-blue-5)";

    return (
        <div className={classes.root}>
            <Button
                variant="subtle"
                leftSection={<ArrowLeft size={16} />}
                onClick={() => navigate("/leaderboard")}
                mb="md"
            >
                Back to Leaderboard
            </Button>

            <GameCard variant="gradient">
                <Stack align="center" gap="sm">
                    <UserAvatar userId={userId} username={name} size={120} />
                    <Title order={2} ta="center" className={classes.name}>{name}</Title>

                    {hasLocation && (
                        <Group gap={6} justify="center">
                            <MapPin size={14} />
                            <Text size="sm">
                                {flag ? flag + " " : ""}{data.city ? data.city + ", " : ""}{data.country || ""}
                            </Text>
                        </Group>
                    )}

                    <Group gap={48} mt="sm" justify="center">
                        <Stack gap={2} align="center">
                            <Group gap={6}>
                                <Star size={18} className={classes.starIcon} />
                                <Text size="1.6rem" fw={900} className={classes.statValue}>
                                    {data.points != null ? data.points.toLocaleString() : "—"}
                                </Text>
                            </Group>
                            <Text size="xs" c="dimmed">Points</Text>
                        </Stack>

                        <Stack gap={2} align="center">
                            <Text size="1.6rem" fw={900} style={{ color: rankColor, lineHeight: 1 }}>
                                {data.rank ? `#${data.rank}` : "—"}
                            </Text>
                            <Text size="xs" c="dimmed">Rank</Text>
                        </Stack>
                    </Group>

                    {data.rank === 1 && (
                        <Badge color="gold" variant="filled" mt="xs">Season Leader</Badge>
                    )}
                </Stack>
            </GameCard>
        </div>
    );
}
