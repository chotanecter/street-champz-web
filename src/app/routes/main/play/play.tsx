import { Box, Button, Divider, Group, Badge, Stack, Text, Title, ActionIcon, Loader } from "@mantine/core";
import { useAuth } from "../../../auth/context";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import classes from "./play.module.css";
import { Gamepad2, Users, Clock, X, Swords, Sparkles } from "lucide-react";
import { useMyNotifications } from "../../../notifications/context";
import { GameCard, UserAvatar } from "../../../../components";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../../../utils/animations";
import { notifications } from "@mantine/notifications";

interface Game {
    id: string;
    leader: {
        id: string;
        username: string;
    };
}

interface OnlinePlayer {
    id: string;
    username: string;
    country?: string | null;
    countryCode?: string | null;
    city?: string | null;
    hasAvatar?: boolean;
    avatar?: string | null;
}

export function Play() {
    const auth = useAuth();
    const myNotifications = useMyNotifications();

    const [createLoading, setCreateLoading] = useState(false);
    const [_, navigate] = useLocation();
    const [games, setGames] = useState<Game[]>([]);
    const [onlinePlayers, setOnlinePlayers] = useState<OnlinePlayer[]>([]);
    const [challengingId, setChallengingId] = useState<string | null>(null);

    useEffect(() => {
        fetch(import.meta.env["VITE_API_BASE"] + "/games", {
            headers: {
                "Authorization": "Bearer " + auth.token
            }
        }).then(response => response.json().then(games => {
            setGames(games);
        }));

        fetch(import.meta.env["VITE_API_BASE"] + "/stats/online", {
            headers: { "Authorization": "Bearer " + auth.token }
        })
            .then(r => r.json())
            .then(data => setOnlinePlayers((data.players || []).filter((p: OnlinePlayer) => p.id !== auth.id)))
            .catch(() => {});

        const unsubscribeInvitations = myNotifications.subscribe("INVITATION", data => {
            const gameId = data.gameId;
            const inviterUsername = data.invitedBy.username;

            setGames(games => [
                ...games,
                {
                    id: gameId,
                    leader: {
                        id: data.invitedBy.id,
                        username: inviterUsername
                    }
                }
            ]);

            // Show a prominent clickable notification
            notifications.show({
                id: `invite-${gameId}`,
                title: "ð® Game Challenge!",
                message: `${inviterUsername} challenged you! Tap here to join.`,
                color: "orange",
                autoClose: 15000,
                onClick: () => navigate(`/game/${gameId}`),
                style: { cursor: "pointer" },
            });
        });

        return () => {
            unsubscribeInvitations();
        };
    }, []);

    const onCreate = async () => {
        setCreateLoading(true);

        const response = await fetch(import.meta.env["VITE_API_BASE"] + "/games", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + auth.token
            }
        });

        if (response.status !== 200) {
            alert("Error while creating game.");
            setCreateLoading(false);

            return;
        }

        const gameId = await response.text();

        setCreateLoading(false);
        navigate(`/game/${gameId}`);
    };

    const onChallenge = async (player: OnlinePlayer) => {
        setChallengingId(player.id);
        try {
            const createRes = await fetch(import.meta.env["VITE_API_BASE"] + "/games", {
                method: "POST",
                headers: { "Authorization": "Bearer " + auth.token }
            });
            if (!createRes.ok) {
                notifications.show({ title: "Error", message: "Could not create game", color: "red" });
                setChallengingId(null);
                return;
            }
            const gameId = await createRes.text();

            const inviteRes = await fetch(import.meta.env["VITE_API_BASE"] + "/games/" + gameId + "/invitations", {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + auth.token,
                    "Content-Type": "text/plain",
                },
                body: player.username,
            });
            if (!inviteRes.ok) {
                notifications.show({ title: "Error", message: "Could not send invite", color: "red" });
                setChallengingId(null);
                return;
            }
            notifications.show({
                title: "Challenge sent!",
                message: `Invitation sent to ${player.username}`,
                color: "green",
            });
            navigate("/game/" + gameId + "?mode=online");
        } catch {
            notifications.show({ title: "Error", message: "Something went wrong", color: "red" });
        }
        setChallengingId(null);
    };

    const onDeleteGame = async (gameId: string, isHost: boolean) => {
        const response = await fetch(import.meta.env["VITE_API_BASE"] + "/games/" + gameId, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + auth.token
            }
        });

        if (response.ok) {
            setGames(games => games.filter(g => g.id !== gameId));
            notifications.show({
                title: isHost ? "Game deleted" : "Left game",
                message: isHost ? "The game has been removed" : "You have left the game",
                color: "green"
            });
        } else {
            notifications.show({
                title: "Error",
                message: "Could not remove the game",
                color: "red"
            });
        }
    };

    return (
        <Stack gap="lg" p="sm">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
            >
                <Box ta="center" p="lg">
                    <Title order={2} fw={500}>
                        Welcome, {auth.username}!
                    </Title>

                    <Text c="dimmed">
                        Jump back into an active game or start your own game to play!
                    </Text>
                </Box>
            </motion.div>

            {/* Game Modes — shiny sponsored contest + classic game of SKATE */}
            <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
            >
                <Group justify="space-between" mb="md">
                    <Title order={3} fw={500}>
                        Game Modes
                    </Title>
                </Group>
                <Group grow align="stretch" wrap="nowrap">
                    <Box
                        onClick={() => navigate("/contests")}
                        style={{
                            cursor: "pointer",
                            borderRadius: 14,
                            padding: 20,
                            background:
                                "linear-gradient(135deg, #fff3a0 0%, #f4c430 25%, #b8860b 55%, #f4c430 85%, #fff3a0 100%)",
                            boxShadow:
                                "0 0 20px rgba(244, 196, 48, 0.55), inset 0 0 12px rgba(255, 255, 255, 0.35)",
                            border: "1px solid rgba(255, 255, 255, 0.4)",
                        }}
                    >
                        <Stack gap={6}>
                            <Group gap={6}>
                                <Sparkles size={16} color="#1a1a1a" />
                                <Badge color="dark" variant="filled" size="sm">
                                    Limited edition
                                </Badge>
                            </Group>
                            <Title order={4} c="dark.9" fw={800}>
                                S.K.A.T.E. Challenge
                            </Title>
                            <Text size="sm" c="dark.8">
                                Match the featured pro&apos;s 5 tricks. Judged, ranked, and sponsored — with a real prize.
                            </Text>
                            <Text size="xs" c="dark.7" fw={700}>
                                Sponsored · Judged · Leaderboard
                            </Text>
                        </Stack>
                    </Box>
                    <Box
                        onClick={onCreate}
                        style={{
                            cursor: createLoading ? "wait" : "pointer",
                            borderRadius: 14,
                            padding: 20,
                            background: "var(--mantine-color-dark-6)",
                            border: "1px solid var(--mantine-color-dark-4)",
                        }}
                    >
                        <Stack gap={6}>
                            <Group gap={6}>
                                <Gamepad2 size={16} />
                                <Badge color="blue" variant="light" size="sm">
                                    Classic
                                </Badge>
                            </Group>
                            <Title order={4} fw={700}>
                                Game of S.K.A.T.E.
                            </Title>
                            <Text size="sm" c="dimmed">
                                Challenge a friend head-to-head. First to spell S.K.A.T.E. loses.
                            </Text>
                            <Text size="xs" c="dimmed" fw={700}>
                                1v1 · Live · Instant match
                            </Text>
                        </Stack>
                    </Box>
                </Group>
            </motion.div>

            <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
            >
                <Group justify="space-between" mb="md">
                    <Title order={3} fw={500}>
                        Active games
                    </Title>
                    <Badge size="lg" variant="light" color="blue">
                        {games.length}
                    </Badge>
                </Group>

                {(games.length === 0) ? (
                    <GameCard>
                        <Stack align="center" gap="sm" py="xl">
                            <Gamepad2 size={48} opacity={0.3} />
                            <Text c="dimmed" ta="center">
                                No active games right now
                            </Text>
                            <Text size="sm" c="dimmed" ta="center">
                                Start a new game to play with friends!
                            </Text>
                        </Stack>
                    </GameCard>
                ) : (
                    <Stack gap="md">
                        {games.map((game, index) => (
                            <motion.div
                                key={`game-${game.id}`}
                                variants={fadeInUp}
                                custom={index}
                            >
                                <GameCard variant="gradient">
                                    <Group justify="space-between" wrap="nowrap">
                                        <Stack gap="xs">
                                            <Group gap="xs">
                                                <Text fw={600} size="lg">
                                                    {game.leader.id === auth.id ? "Your Game" : `${game.leader.username}'s Game`}
                                                </Text>
                                                {game.leader.id === auth.id && (
                                                    <Badge size="sm" color="blue" variant="light">
                                                        Host
                                                    </Badge>
                                                )}
                                            </Group>
                                            <Group gap="md">
                                                <Group gap={4}>
                                                    <Users size={16} opacity={0.6} />
                                                    <Text size="sm" c="dimmed">
                                                        Waiting for players
                                                    </Text>
                                                </Group>
                                                <Group gap={4}>
                                                    <Clock size={16} opacity={0.6} />
                                                    <Badge size="sm" color="green" variant="dot">
                                                        Active
                                                    </Badge>
                                                </Group>
                                            </Group>
                                        </Stack>

                                        <Group gap="xs">
                                            <Button
                                                leftSection={<Gamepad2 size="1.25em" />}
                                                onClick={() => navigate("/game/" + game.id)}
                                                variant={game.leader.id === auth.id ? "light" : "filled"}
                                            >
                                                {game.leader.id === auth.id ? "Continue" : "Join"}
                                            </Button>
                                            <ActionIcon
                                                variant="subtle"
                                                color="red"
                                                size="lg"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteGame(game.id, game.leader.id === auth.id);
                                                }}
                                                title={game.leader.id === auth.id ? "Delete game" : "Leave game"}
                                            >
                                                <X size={18} />
                                            </ActionIcon>
                                        </Group>
                                    </Group>
                                </GameCard>
                            </motion.div>
                        ))}
                    </Stack>
                )}
            </motion.div>

            <Divider />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
            >
                <Button
                    size="lg"
                    fullWidth
                    loading={createLoading}
                    onClick={onCreate}
                    leftSection={<Gamepad2 size="1.5em" />}
                >
                    Start a new game
                </Button>
            </motion.div>

            <Divider />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
            >
                <Group justify="space-between" mb="md">
                    <Title order={3} fw={500}>
                        Online Players
                    </Title>
                    <Badge size="lg" variant="light" color="green">
                        {onlinePlayers.length}
                    </Badge>
                </Group>

                {onlinePlayers.length === 0 ? (
                    <GameCard>
                        <Stack align="center" gap="sm" py="xl">
                            <Users size={48} opacity={0.3} />
                            <Text c="dimmed" ta="center">
                                No other players online right now
                            </Text>
                        </Stack>
                    </GameCard>
                ) : (
                    <Stack gap="sm">
                        {onlinePlayers.map(player => (
                            <GameCard key={player.id}>
                                <Group justify="space-between" wrap="nowrap">
                                    <Group gap="md">
                                        <UserAvatar userId={player.id} username={player.username} localAvatar={player.avatar} />
                                        <div>
                                            <Text fw={600}>{player.username}</Text>
                                            {player.country && (
                                                <Text size="xs" c="dimmed">{player.city ? player.city + ", " : ""}{player.country}</Text>
                                            )}
                                        </div>
                                    </Group>
                                    <Button
                                        leftSection={<Swords size="1.1em" />}
                                        variant="light"
                                        color="orange"
                                        loading={challengingId === player.id}
                                        onClick={() => onChallenge(player)}
                                    >
                                        Challenge
                                    </Button>
                                </Group>
                            </GameCard>
                        ))}
                    </Stack>
                )}
            </motion.div>
        </Stack>
    );
};