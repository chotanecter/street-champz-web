import { Box, Button, Group, Badge, Stack, Text, Title, ActionIcon } from "@mantine/core";
import { useAuth } from "../../../auth/context";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Gamepad2, Users, Clock, X, Sparkles, MapPin, Lock } from "lucide-react";
import { useMyNotifications } from "../../../notifications/context";
import { GameCard } from "../../../../components";
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

export function Play() {
    const auth = useAuth();
    const myNotifications = useMyNotifications();

    const [createLoading, setCreateLoading] = useState(false);
    const [_, navigate] = useLocation();
    const [games, setGames] = useState<Game[]>([]);

    useEffect(() => {
        fetch(import.meta.env["VITE_API_BASE"] + "/games", {
            headers: {
                "Authorization": "Bearer " + auth.token
            }
        }).then(response => response.json().then(games => {
            setGames(games);
        }));

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

    const goCheckInGame = () => {
        navigate("/checkin");
        setTimeout(() => {
            document.getElementById("spot-game")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 500);
    };

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
                    <Title
                        order={2}
                        c="white"
                        style={{
                            fontFamily: "'Permanent Marker', cursive",
                            fontWeight: 400,
                            letterSpacing: "0.5px",
                            transform: "rotate(-1.5deg)",
                            textShadow: "2px 2px 0 rgba(232,115,44,0.45)",
                        }}
                    >
                        Welcome, {auth.username}!
                    </Title>

                    <Text c="white" style={{ fontFamily: "'Permanent Marker', cursive", opacity: 0.92 }}>
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
                                    Coming Soon
                                </Badge>
                            </Group>
                            <Title order={4} c="dark.9" fw={800}>
                                S.K.A.T.E. Challenge
                            </Title>
                            <Text size="sm" c="dark.8">
                                Match the featured pro&apos;s 5 tricks. Judged, ranked, and sponsored — with a real prize.
                            </Text>
                            <Text size="xs" c="dark.7" fw={700}>
                                Coming Soon · Sponsored · Judged
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

                <Group grow align="stretch" wrap="nowrap" mt="md">
                    <Box
                        onClick={goCheckInGame}
                        style={{
                            cursor: "pointer",
                            borderRadius: 14,
                            padding: 20,
                            background: "linear-gradient(135deg, #ff9555 0%, #e8732c 55%, #b3551d 100%)",
                            boxShadow: "0 0 20px rgba(232, 115, 44, 0.45)",
                            border: "1px solid rgba(255, 255, 255, 0.25)",
                        }}
                    >
                        <Stack gap={6}>
                            <Group gap={6}>
                                <MapPin size={16} color="#1a1a1a" />
                                <Badge color="dark" variant="filled" size="sm">
                                    Live
                                </Badge>
                            </Group>
                            <Title order={4} c="dark.9" fw={800}>
                                LA Check-In Game
                            </Title>
                            <Text size="sm" c="dark.8">
                                Tap in at real LA skate spots, earn points, and climb the leaderboard.
                            </Text>
                            <Text size="xs" c="dark.7" fw={700}>
                                Sponsored by Stevie Williams
                            </Text>
                        </Stack>
                    </Box>
                    <Box
                        style={{
                            cursor: "not-allowed",
                            borderRadius: 14,
                            padding: 20,
                            background: "var(--mantine-color-dark-6)",
                            border: "1px solid var(--mantine-color-dark-4)",
                        }}
                    >
                        <Stack gap={6}>
                            <Group gap={6}>
                                <Lock size={16} />
                                <Badge color="gray" variant="light" size="sm">
                                    Coming Soon
                                </Badge>
                            </Group>
                            <Title order={4} fw={700}>
                                NY Check-In Challenge
                            </Title>
                            <Text size="sm" c="dimmed">
                                The check-in game rolls into New York. Drops soon.
                            </Text>
                            <Text size="xs" c="dimmed" fw={700}>
                                Coming Soon · NY Edition
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
        </Stack>
    );
};