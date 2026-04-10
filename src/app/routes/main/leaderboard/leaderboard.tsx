import { Center, Group, Loader, Stack, Text, Title, Tabs, Badge } from "@mantine/core";
import { useEffect, useState } from "react";
import { Trophy, Medal, Award, Star, Calendar, Crown, TrendingUp } from "lucide-react";
import { GameCard, UserAvatar } from "../../../../components";
import { useEconomy } from "../../../economy/context";
import { useAuth } from "../../../auth/context";
import classes from "./leaderboard.module.css";

type Player = { id: string; username: string; points: number; rank?: number; wins?: number; hasAvatar?: boolean; avatar?: string | null };
type Team = { id: string; name: string; points: number; members: number; wins: number };

export function Leaderboard() {
    const auth = useAuth();
    const { points, getDaysRemaining } = useEconomy();
    const [leaderboard, setLeaderboard] = useState<Player[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [activeTab, setActiveTab] = useState<string>("season");
    const [userRank, setUserRank] = useState<number>(0);
    const [pointsToFirst, setPointsToFirst] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const daysRemaining = getDaysRemaining();

    useEffect(() => {
        fetch(import.meta.env["VITE_API_BASE"] + "/leaderboard", {
            headers: { "Authorization": "Bearer " + auth.token }
        })
            .then(response => response.json())
            .then(data => {
                setLeaderboard(data);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
        setTeams([]);
        
    }, [auth.token]);

    // Calculate user's rank when leaderboard loads
    useEffect(() => {
        if (leaderboard.length > 0) {
            // Find the current user in the leaderboard by their id
            const myEntry = leaderboard.find(p => p.id === auth.id);
            if (myEntry && myEntry.rank) {
                setUserRank(myEntry.rank);
            } else {
                // User not on leaderboard — they're ranked after everyone
                setUserRank(leaderboard.length + 1);
            }

            const firstPlace = leaderboard[0];
            if (firstPlace.id === auth.id) {
                setPointsToFirst(0);
            } else {
                setPointsToFirst(Math.max(0, firstPlace.points - points + 1));
            }
        } else {
            setUserRank(1);
            setPointsToFirst(0);
        }
    }, [leaderboard, auth.id, points]);

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Trophy size={24} color="var(--mantine-color-gold-5)" />;
        if (rank === 2) return <Medal size={24} color="var(--mantine-color-gray-4)" />;
        if (rank === 3) return <Award size={24} color="var(--mantine-color-orange-6)" />;
        return null;
    };

    const getRankColor = (rank: number) => {
        if (rank === 1) return "gold";
        if (rank === 2) return "gray";
        if (rank === 3) return "orange";
        return undefined;
    };

    const renderPlayerList = (players: Player[]) => (
        <Stack gap="sm">
            {players.map((listing, i) => {
                const rank = listing.rank || (i + 1);
                return (
                    <GameCard 
                        key={listing.username}
                        variant={rank <= 3 ? "gradient" : "default"}
                    >
                        <Group justify="space-between" align="center">
                            <Group gap="md">
                                <div className={classes.rankBadge}>
                                    {getRankIcon(rank) || `#${rank}`}
                                </div>
                                <UserAvatar userId={listing.id} username={listing.username} localAvatar={listing.avatar} />
                                <div>
                                    <Text fw={600}>{listing.username}</Text>
                                </div>
                            </Group>
                            <Group gap="xs">
                                <Star size={16} className={classes.pointsIcon} />
                                <Badge 
                                    size="lg" 
                                    color={getRankColor(rank) || "blue"}
                                    variant="filled"
                                >
                                    {listing.points.toLocaleString()} pts
                                </Badge>
                            </Group>
                        </Group>
                    </GameCard>
                );
            })}
        </Stack>
    );

    return (
        <div className={classes.root}>
            {/* Season Competition Card */}
            <div className={classes.seasonCard}>
                <Group justify="space-between" align="flex-start" mb="md">
                    <div>
                        <Group gap="xs" mb={4}>
                            <Crown size={24} className={classes.trophyIcon} />
                            <Title order={3}>Season Competition</Title>
                        </Group>
                        <Text size="sm" c="dimmed">
                            Most points at season end wins a special prize!
                        </Text>
                    </div>
                    <Badge 
                        size="lg" 
                        variant="light" 
                        color="blue"
                        leftSection={<Calendar size={14} />}
                    >
                        {daysRemaining} days left
                    </Badge>
                </Group>

                <Group align="center" gap="xl">
                    {/* User Rank Display */}
                    <div className={classes.rankDisplay}>
                        <Text size="xs" c="dimmed" ta="center" mb={4}>YOUR RANK</Text>
                        <Text 
                            size="3rem" 
                            fw={900} 
                            ta="center"
                            style={{ 
                                color: userRank === 1 ? 'var(--mantine-color-gold-5)' : 
                                       userRank <= 3 ? 'var(--mantine-color-orange-5)' : 
                                       'var(--mantine-color-blue-5)',
                                lineHeight: 1
                            }}
                        >
                            #{userRank}
                        </Text>
                        {userRank === 1 && (
                            <Badge color="gold" variant="filled" size="sm" mt={4}>
                                👑 Leader!
                            </Badge>
                        )}
                    </div>

                    <Stack gap="xs" style={{ flex: 1 }}>
                        <Group gap="xs">
                            <Star size={20} className={classes.pointsIcon} />
                            <Text size="xl" fw={700} className={classes.pointsText}>
                                {points.toLocaleString()}
                            </Text>
                            <Text size="sm" c="dimmed">
                                points
                            </Text>
                        </Group>

                        {userRank === 1 ? (
                            <Badge size="lg" color="gold" variant="filled">
                                🏆 You're in 1st place!
                            </Badge>
                        ) : (
                            <Group gap={4}>
                                <TrendingUp size={14} color="var(--mantine-color-orange-5)" />
                                <Text size="sm" c="dimmed">
                                    <Text span fw={600} c="orange">{pointsToFirst.toLocaleString()}</Text> points to reach #1
                                </Text>
                            </Group>
                        )}

                        <Text size="xs" c="dimmed">
                            Compete to be #1 when the season ends!
                        </Text>
                    </Stack>
                </Group>
            </div>

            {/* Leaderboard */}
            <Title order={2} mb="lg" ta="center" mt="xl">
                <Trophy size={28} style={{ verticalAlign: "middle", marginRight: 8 }} />
                Leaderboard
            </Title>

            <Tabs value={activeTab} onChange={(value) => setActiveTab(value || "season")}>
                <Tabs.List grow mb="md">
                    <Tabs.Tab value="season">This Season</Tabs.Tab>
                    <Tabs.Tab value="alltime">All-Time</Tabs.Tab>
                    <Tabs.Tab value="teams">Teams</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="season">
                    {isLoading ? (
                        <Center py="xl">
                            <Loader />
                        </Center>
                    ) : leaderboard.length === 0 ? (
                        <Center py="xl">
                            <Stack align="center" gap="sm">
                                <Trophy size={48} color="var(--mantine-color-dimmed)" />
                                <Text c="dimmed" ta="center">No players on the leaderboard yet.</Text>
                                <Text size="sm" c="dimmed" ta="center">Be the first to compete!</Text>
                            </Stack>
                        </Center>
                    ) : (
                        renderPlayerList(leaderboard)
                    )}
                </Tabs.Panel>

                <Tabs.Panel value="alltime">
                    {isLoading ? (
                        <Center py="xl">
                            <Loader />
                        </Center>
                    ) : leaderboard.length === 0 ? (
                        <Center py="xl">
                            <Stack align="center" gap="sm">
                                <Trophy size={48} color="var(--mantine-color-dimmed)" />
                                <Text c="dimmed" ta="center">No all-time rankings yet.</Text>
                                <Text size="sm" c="dimmed" ta="center">Start playing to get ranked!</Text>
                            </Stack>
                        </Center>
                    ) : (
                        renderPlayerList(leaderboard)
                    )}
                </Tabs.Panel>

                <Tabs.Panel value="teams">
                    {isLoading ? (
                        <Center py="xl">
                            <Loader />
                        </Center>
                    ) : teams.length === 0 ? (
                        <Center py="xl">
                            <Stack align="center" gap="sm">
                                <Trophy size={48} color="var(--mantine-color-dimmed)" />
                                <Text c="dimmed" ta="center">No team rankings yet.</Text>
                                <Text size="sm" c="dimmed" ta="center">Create or join a team to compete!</Text>
                            </Stack>
                        </Center>
                    ) : (
                        <Stack gap="sm">
                            {teams.map((team, i) => (
                                <GameCard 
                                    key={team.name}
                                    variant={i < 3 ? "premium" : "default"}
                                >
                                    <Group justify="space-between" align="center">
                                        <Group gap="md">
                                            <div className={classes.rankBadge}>
                                                {getRankIcon(i + 1) || `#${i + 1}`}
                                            </div>
                                            <div>
                                                <Text fw={600} size="lg">{team.name}</Text>
                                                <Group gap="xs">
                                                    <Text size="xs" c="dimmed">
                                                        {team.members} members
                                                    </Text>
                                                    <Text size="xs" c="dimmed">•</Text>
                                                    <Text size="xs" c="dimmed">
                                                        {team.wins} wins
                                                    </Text>
                                                </Group>
                                            </div>
                                        </Group>
                                        <Group gap="xs">
                                            <Star size={16} className={classes.pointsIcon} />
                                            <Badge 
                                                size="lg" 
                                                color={getRankColor(i + 1) || "blue"}
                                                variant="filled"
                                            >
                                                {team.points.toLocaleString()} pts
                                            </Badge>
                                        </Group>
                                    </Group>
                                </GameCard>
                            ))}
                        </Stack>
                    )}
                </Tabs.Panel>
            </Tabs>
        </div>
    );
}
