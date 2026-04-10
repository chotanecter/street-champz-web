import { ActionIcon, Badge, Button, Center, Group, Indicator, Loader, Modal, Stack, Text, TextInput, Title, Card, Divider } from "@mantine/core";
import classes from "./game.module.css";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../auth/context";
import { ChevronLeft, UserPlus, Dice5, Sparkles, Users, Wifi, UserPlus2, X } from "lucide-react";
import { useLocation } from "wouter";
import { notifications } from "@mantine/notifications";
import { useEconomy } from "../../economy/context";
import { useAchievements } from "../../achievements/context";
import { useMissions } from "../../missions/context";
import { celebrateVictory } from "../../../utils/confetti";
import { GameOverModal, GameCard, SkaterAnimation, SkateLettersDisplay, UserAvatar } from "../../../components";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, popIn } from "../../../utils/animations";
import { useTranslation } from "react-i18next";

// Local player interface
interface LocalPlayer {
    id: string;
    name: string;
    fails: number;
}

// Game mode type
type GameMode = 'selecting' | 'online' | 'local';
type SkillLevel = 'beginner' | 'advanced';

// ===== BEGINNER TRICKS (Flatground Only) =====
// Owner-approved beginner tricks for casual play
const BEGINNER_TRICKS = [
    // === OLLIES ===
    'Ollie',
    'Nollie',
    'Fakie Ollie',
    'Switch Ollie',
    
    // === 180s ===
    'Frontside 180',
    'Backside 180',
    'Fakie BS 180',
    'Fakie FS 180',
    'Nollie BS 180',
    'Nollie FS 180',
    'Switch BS 180',
    'Switch FS 180',
    
    // === SHUVITS ===
    'BS Shuvit',
    'FS Shuvit',
    'Nollie BS Shuvit',
    'Nollie FS Shuvit',
    'Fakie BS Shuvit',
    'Fakie FS Shuvit',
    
    // === FLIPS ===
    'Kickflip',
    'Heelflip',
    'Fakie Kickflip',
    'Fakie Heelflip',
];

// ===== ADVANCED TRICKS (Flatground Only) =====
// Owner-approved advanced trick list
const ADVANCED_TRICKS = [
    // All beginner tricks included
    ...BEGINNER_TRICKS,

    // === 360 FLIPS ===
    '360 Flip',
    'Fakie 360 Flip',
    'Nollie 360 Flip',
    'Switch 360 Flip',

    // === BIG SPINS ===
    'Backside Big Spin',
    'Frontside Big Spin',
    'Nollie Backside Big Spin',
    'Nollie Frontside Big Spin',
    'Switch Frontside Big Spin',
    'Switch Backside Big Spin',

    // === TECH FLIPS ===
    'Impossible',
    'Hardflip',
    'Inward Heelflip',
    'Varial Kickflip',

    // === NOLLIE / SWITCH FLIPS ===
    'Nollie Kickflip',
    'Nollie Heelflip',
    'Switch Kickflip',
    'Switch Heelflip',

    // === 360s ===
    'Backside 360',
    'Frontside 360',
    'Switch Frontside 360',
    'Switch Backside 360',
    'Nollie Backside 360',
    'Nollie Frontside 360',
    'Fakie Backside 360',
    'Fakie Frontside 360',

    // === FLIPS (BACKSIDE / FRONTSIDE) ===
    'Fakie Backside Flip',
    'Fakie Frontside Flip',
    'Backside Flip',
    'Switch Backside Flip',
    'Frontside Flip',
    'Switch Frontside Flip',

    // === DOUBLE FLIPS ===
    'Double Kickflip',
    'Fakie Double Kickflip',
];

interface GameState {
    phase: "LOBBY" | "SETTING" | "DEFENSE" | "OVER";
    players: {
        id: string;
        connected: boolean;
        fails: number;
    }[];
    order?: string[];
    defender?: string;
    challenger?: string;
    currentTrick?: string;
}

interface Game {
    leader: string;
    createdAt: Date;
}

interface GameProps {
    id: string;
}

export function Game(props: GameProps) {
    const { t } = useTranslation();
    const auth = useAuth();
    const [_, navigate] = useLocation();
    const { addPoints } = useEconomy();
    const { trackAchievement } = useAchievements();
    const { updateMissionProgress } = useMissions();
    const socketRef = useRef<WebSocket | undefined>(undefined);
    const inviteInputRef = useRef<HTMLInputElement>(null);

    const [game, setGame] = useState<Game>();
    const [gameState, setGameState] = useState<GameState>();
    const [inviting, setInviting] = useState(false);
    const [usernames, setUsernames] = useState(new Map<string, string>());
    const [usernamesFetching, setUsernamesFetching] = useState(new Set<string>());
    const [rewardsClaimed, setRewardsClaimed] = useState(() => localStorage.getItem('rewards-claimed-' + props.id) === 'true');
    const [showGameOverModal, setShowGameOverModal] = useState(false);
    const [gameResults, setGameResults] = useState<{
        isWinner: boolean;
        winnerName?: string;
        pointsEarned: number;
    } | null>(null);

    // Simplified game state
    const [currentTrick, setCurrentTrick] = useState<string | null>(null);
    const [showSkaterAnimation, setShowSkaterAnimation] = useState(false);
    const [isRollingDice, setIsRollingDice] = useState(false);
    const [showResultButtons, setShowResultButtons] = useState(false);
    const [currentTrickWasDiceRoll, setCurrentTrickWasDiceRoll] = useState(false);
    const [successfulDiceRolls, setSuccessfulDiceRolls] = useState(0);

    // Local play state
    const [gameMode, setGameMode] = useState<GameMode>('selecting');
    const [skillLevel, setSkillLevel] = useState<SkillLevel | null>(null);
    const [localPlayers, setLocalPlayers] = useState<LocalPlayer[]>([]);
    const [newPlayerName, setNewPlayerName] = useState('');
    const [localGameState, setLocalGameState] = useState<{
        phase: 'LOBBY' | 'SETTING' | 'DEFENSE' | 'OVER';
        currentPlayerIndex: number;
        challengerIndex: number;
        defenderIndex: number;
        currentTrick: string | null;
        order: number[];
    } | null>(null);

    // Auto-set online mode if navigated from challenge
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('mode') === 'online') {
            setGameMode('online');
            setSkillLevel('advanced');
        }
    }, []);

    // Get tricks based on skill level
    const getTrickList = () => {
        if (skillLevel === 'beginner') return BEGINNER_TRICKS;
        return ADVANCED_TRICKS;
    };

    // Roll dice for random trick
    const handleRollDice = () => {
        setIsRollingDice(true);
        setCurrentTrickWasDiceRoll(true);
        
        const tricks = getTrickList();
        
        // Animate through random tricks (slot machine style)
        let count = 0;
        const maxCount = 20;
        const interval = setInterval(() => {
            const randomTrick = tricks[Math.floor(Math.random() * tricks.length)];
            setCurrentTrick(randomTrick);
            count++;
            
            if (count >= maxCount) {
                clearInterval(interval);
                setIsRollingDice(false);
                // Go directly to result buttons (no skater animation)
                setShowResultButtons(true);
            }
        }, 80);
    };

    // "Do your own trick" - just go straight to result buttons
    const handleOwnTrick = () => {
        setCurrentTrick("Your Trick");
        setCurrentTrickWasDiceRoll(false);
        // Go directly to result buttons (no skater animation)
        setShowResultButtons(true);
    };

    // When skater animation completes, show the result buttons
    const handleAnimationComplete = () => {
        setShowSkaterAnimation(false);
        setShowResultButtons(true);
    };

    // Handle landing or bailing
    const handleTrickResult = (success: boolean) => {
        // For online play, send to server
        if (gameMode === 'online' || gameMode === 'selecting') {
            const moveData = gameState?.phase === "SETTING" 
                ? { success, trickId: currentTrick }
                : success;
            
            socketRef.current?.send(JSON.stringify({
                type: "move",
                data: moveData
            }));
            
            // Track successful dice rolls for bonus points (online only)
            if (success && currentTrickWasDiceRoll) {
                setSuccessfulDiceRolls(prev => prev + 1);
            }
        } else {
            // Local play
            handleLocalTrickResult(success);
        }
        
        // Reset state
        setShowResultButtons(false);
        setCurrentTrick(null);
        setCurrentTrickWasDiceRoll(false);
    };

    // Handle local play trick result
    const handleLocalTrickResult = (success: boolean) => {
        if (!localGameState) return;
        
        if (localGameState.phase === 'SETTING') {
            if (success && currentTrick) {
                // Challenger landed - move to defense
                const nextDefenderIdx = localGameState.order[
                    (localGameState.order.indexOf(localGameState.challengerIndex) + 1) % localGameState.order.length
                ];
                
                setLocalGameState({
                    ...localGameState,
                    phase: 'DEFENSE',
                    defenderIndex: nextDefenderIdx,
                    currentTrick: currentTrick,
                    currentPlayerIndex: nextDefenderIdx
                });
            } else {
                // Challenger bailed - next challenger
                const nextChallengerIdx = localGameState.order[
                    (localGameState.order.indexOf(localGameState.challengerIndex) + 1) % localGameState.order.length
                ];
                
                setLocalGameState({
                    ...localGameState,
                    challengerIndex: nextChallengerIdx,
                    currentPlayerIndex: nextChallengerIdx,
                    currentTrick: null
                });
            }
        } else if (localGameState.phase === 'DEFENSE') {
            const updatedPlayers = [...localPlayers];
            let currentOrder = [...localGameState.order];
            const currentDefenderIndex = localGameState.defenderIndex;
            const currentChallengerIndex = localGameState.challengerIndex;

            if (!success) {
                // Defender bailed - add a letter
                updatedPlayers[currentDefenderIndex].fails++;
                setLocalPlayers(updatedPlayers);

                // Check if player is out (5 fails = S.K.A.T.E)
                if (updatedPlayers[currentDefenderIndex].fails >= 5) {
                    currentOrder = currentOrder.filter(i => i !== currentDefenderIndex);

                    // Check if game over
                    if (currentOrder.length <= 1) {
                        setLocalGameState({
                            ...localGameState,
                            phase: 'OVER',
                            order: currentOrder
                        });
                        return;
                    }
                }
            }

            // Find next defender AFTER potential elimination
            const defenderPosInOrder = currentOrder.indexOf(currentDefenderIndex);

            if (defenderPosInOrder === -1) {
                // Defender was eliminated — find next player after challenger
                const challengerPos = currentOrder.indexOf(currentChallengerIndex);
                const nextDefenderPos = (challengerPos + 1) % currentOrder.length;
                const nextDefenderIdx = currentOrder[nextDefenderPos];

                if (nextDefenderIdx === currentChallengerIndex) {
                    // Challenger sets again
                    setLocalGameState({
                        ...localGameState,
                        phase: 'SETTING',
                        order: currentOrder,
                        defenderIndex: -1,
                        currentPlayerIndex: currentChallengerIndex,
                        currentTrick: null
                    });
                } else {
                    setLocalGameState({
                        ...localGameState,
                        order: currentOrder,
                        defenderIndex: nextDefenderIdx,
                        currentPlayerIndex: nextDefenderIdx
                    });
                }
            } else {
                // Defender still in order — find who is next
                const nextDefenderPos = (defenderPosInOrder + 1) % currentOrder.length;
                const nextDefenderIdx = currentOrder[nextDefenderPos];

                if (nextDefenderIdx === currentChallengerIndex) {
                    // All defenders done — SAME challenger sets again (they landed the trick)
                    setLocalGameState({
                        ...localGameState,
                        phase: 'SETTING',
                        order: currentOrder,
                        defenderIndex: -1,
                        currentPlayerIndex: currentChallengerIndex,
                        currentTrick: null
                    });
                } else {
                    // Next defender's turn
                    setLocalGameState({
                        ...localGameState,
                        order: currentOrder,
                        defenderIndex: nextDefenderIdx,
                        currentPlayerIndex: nextDefenderIdx
                    });
                }
            }
        }
    };

    // For defense phase - start attempting the trick
    const handleMatchTrick = () => {
        const trick = gameMode === 'local' ? localGameState?.currentTrick : gameState?.currentTrick;
        if (trick) {
            setCurrentTrick(trick);
            setShowSkaterAnimation(true);
        }
    };

    // Local play functions
    const addLocalPlayer = () => {
        if (newPlayerName.trim() && localPlayers.length < 8) {
            setLocalPlayers([...localPlayers, {
                id: `local-${Date.now()}`,
                name: newPlayerName.trim(),
                fails: 0
            }]);
            setNewPlayerName('');
        }
    };

    const removeLocalPlayer = (id: string) => {
        setLocalPlayers(localPlayers.filter(p => p.id !== id));
    };

    const startLocalGame = () => {
        if (localPlayers.length < 2) {
            notifications.show({
                title: 'Need more players',
                message: 'Add at least 2 players to start a local game',
                color: 'red'
            });
            return;
        }
        
        const order = localPlayers.map((_, i) => i);
        // Shuffle order
        for (let i = order.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [order[i], order[j]] = [order[j], order[i]];
        }
        
        setLocalGameState({
            phase: 'SETTING',
            currentPlayerIndex: order[0],
            challengerIndex: order[0],
            defenderIndex: -1,
            currentTrick: null,
            order
        });
    };

    const getCurrentLocalPlayer = () => {
        if (!localGameState || localGameState.currentPlayerIndex < 0) return null;
        return localPlayers[localGameState.currentPlayerIndex];
    };

    const getLocalChallenger = () => {
        if (!localGameState || localGameState.challengerIndex < 0) return null;
        return localPlayers[localGameState.challengerIndex];
    };

    const getLocalDefender = () => {
        if (!localGameState || localGameState.defenderIndex < 0) return null;
        return localPlayers[localGameState.defenderIndex];
    };

    const getUsername = (userId: string) => {
        const cached = usernames.get(userId);

        if (cached !== undefined) return cached;

        if (!usernamesFetching.has(userId)) {
            setUsernamesFetching(usernamesFetching => {
                const newUsernamesFetching = new Set(usernamesFetching);
                newUsernamesFetching.add(userId);

                return newUsernamesFetching;
            });

            fetch(import.meta.env["VITE_API_BASE"] + "/users/" + userId, {
                headers: {
                    "Authorization": "Bearer " + auth.token
                }
            })
                .then(response => response.json().then(value => (
                    setUsernames(usernames => {
                        const newUsernames = new Map(usernames);
                        newUsernames.set(userId, value.username);

                        return newUsernames;
                    })
                )))
                .finally(() => setUsernamesFetching(usernamesFetching => {
                    const newUsernamesFetching = new Set(usernamesFetching);
                    newUsernamesFetching.delete(userId);

                    return newUsernamesFetching;
                }))
        }

        return undefined;
    };

    useEffect(() => {
        const socketUrl = new URL(import.meta.env["VITE_API_BASE"] + "/games/" + props.id + "/state/socket", location.href);
        socketUrl.protocol = location.protocol === "http:" ? "ws:" : "wss:";

        const socket = new WebSocket(socketUrl);

        socketRef.current = socket;

        socket.onmessage = e => {
            const payload = JSON.parse(e.data) as any;

            if (payload.type === "state") {
                setGameState(payload.data);
            }

            setGameState(payload.data);
        };

        socket.onopen = () => {

            // Fetch initial game data.
            fetch(import.meta.env["VITE_API_BASE"] + "/games/" + props.id, {
                headers: {
                    "Authorization": "Bearer " + auth.token
                }
            })
                .then(response => {
                    response.json().then(value => {
                        setGame({
                            leader: value.leader,
                            createdAt: new Date(value.createdAt)
                        });

                        setGameState(value.state);

                        // Non-leaders (invited players) skip mode selection — go straight to online mode
                        if (value.leader !== auth.id) {
                            setGameMode('online');
                            setSkillLevel('advanced');
                        }
                    });
                });

            // Authenticate to socket.
            socket.send(JSON.stringify({
                type: "authenticate",
                data: auth.token
            }));
        }

        return () => {
            socket.close();
        };
    }, []);

    // Award rewards when game ends - ONLY for online games (local play cannot earn points)
    useEffect(() => {
        if (!gameState || !game || rewardsClaimed) return;
        
        // Local play does NOT earn points to prevent cheating
        if (gameMode === 'local') return;

        if (gameState.phase === "OVER" && gameState.order && gameState.order.length === 1) {
            const winnerId = gameState.order[0];
            const isWinner = winnerId === auth.id;
            
            // Bonus points for landing dice roll tricks (25 pts each)
            const diceRollBonus = successfulDiceRolls * 25;

            if (isWinner && !rewardsClaimed) {
                // Winner gets points + dice roll bonus!
                const winnerPoints = 500 + diceRollBonus;

                addPoints(winnerPoints, "game_win", true);
                celebrateVictory();

                // Track game played achievements
                trackAchievement("first_game", 1);
                trackAchievement("games_10", 1);
                trackAchievement("games_50", 1);
                trackAchievement("games_100", 1);

                // Track win achievements
                trackAchievement("first_win", 1);
                trackAchievement("wins_5", 1);
                trackAchievement("wins_25", 1);
                trackAchievement("wins_50", 1);

                // Track missions — games played + wins
                updateMissionProgress("daily_play_1", 1);
                updateMissionProgress("daily_play_3", 1);
                updateMissionProgress("daily_win_1", 1);
                updateMissionProgress("weekly_games_10", 1);
                updateMissionProgress("weekly_wins_5", 1);
                updateMissionProgress("lifetime_games_50", 1);
                updateMissionProgress("lifetime_wins_25", 1);
                updateMissionProgress("lifetime_games_100", 1);

                // Track perfect game / comeback
                const winnerPlayer = gameState.players.find(p => p.id === winnerId);
                if (winnerPlayer && winnerPlayer.fails === 0) {
                    trackAchievement("perfect_game", 1);
                }
                if (winnerPlayer && winnerPlayer.fails === 4) {
                    trackAchievement("comeback_king", 1);
                }

                // Track points achievements
                trackAchievement("points_1000", winnerPoints);
                trackAchievement("points_10000", winnerPoints);
                trackAchievement("points_50000", winnerPoints);
                trackAchievement("points_100000", winnerPoints);

                setGameResults({
                    isWinner: true,
                    pointsEarned: winnerPoints
                });

                // Small delay before showing modal for confetti to start
                setTimeout(() => setShowGameOverModal(true), 500);

                localStorage.setItem('rewards-claimed-' + props.id, 'true');
                setRewardsClaimed(true);
            } else if (!isWinner && !rewardsClaimed) {
                // Participation reward + dice roll bonus
                const participationPoints = 100 + diceRollBonus;

                addPoints(participationPoints, "game_win", false);

                // Track game played achievements
                trackAchievement("first_game", 1);
                trackAchievement("games_10", 1);
                trackAchievement("games_50", 1);
                trackAchievement("games_100", 1);

                // Track missions — games played (no win missions for losers)
                updateMissionProgress("daily_play_1", 1);
                updateMissionProgress("daily_play_3", 1);
                updateMissionProgress("weekly_games_10", 1);
                updateMissionProgress("lifetime_games_50", 1);
                updateMissionProgress("lifetime_games_100", 1);

                // Track points achievements
                trackAchievement("points_1000", participationPoints);
                trackAchievement("points_10000", participationPoints);
                trackAchievement("points_50000", participationPoints);
                trackAchievement("points_100000", participationPoints);

                const winnerName = getUsername(winnerId);

                setGameResults({
                    isWinner: false,
                    winnerName: winnerName || "Unknown",
                    pointsEarned: participationPoints
                });

                setTimeout(() => setShowGameOverModal(true), 500);

                localStorage.setItem('rewards-claimed-' + props.id, 'true');
                setRewardsClaimed(true);
            }
        }
    }, [gameState, game, auth.id, rewardsClaimed, addPoints, getUsername, gameMode, successfulDiceRolls, trackAchievement, updateMissionProgress]);

    if (game === undefined || gameState === undefined) {
        return (
            <Center h="100%">
                <Loader />
            </Center>
        );
    }

    const isLeader = game.leader === auth.id;
    const isMyTurn = (gameState.phase === "SETTING" && gameState.challenger === auth.id) || 
                     (gameState.phase === "DEFENSE" && gameState.defender === auth.id);

    // Get current player's fails for the big letter display
    const getCurrentPlayerFails = () => {
        if (gameMode === 'local' && localGameState) {
            const currentPlayer = getCurrentLocalPlayer();
            return currentPlayer?.fails ?? 0;
        }
        // For online, get defender's fails during defense phase, or current user
        const player = gameState.players.find(p => 
            gameState.phase === "DEFENSE" ? p.id === gameState.defender : p.id === auth.id
        );
        return player?.fails ?? 0;
    };

    const getCurrentPlayerName = () => {
        if (gameMode === 'local' && localGameState) {
            return getCurrentLocalPlayer()?.name ?? "";
        }
        if (gameState.phase === "DEFENSE" && gameState.defender) {
            return getUsername(gameState.defender) ?? "Player";
        }
        return auth.username ?? "You";
    };

    return (
        <>
            <Modal
                title="Invite players"
                centered
                opened={inviting}
                keepMounted={false}
                onClose={() => setInviting(false)}
            >
                <form onSubmit={e => {
                    e.preventDefault();
                    e.stopPropagation();

                    const data = new FormData(e.target as HTMLFormElement);

                    fetch(import.meta.env["VITE_API_BASE"] + "/games/" + props.id + "/invitations", {
                        method: "POST",
                        body: String(data.get("username") || ""),
                        headers: {
                            "Authorization": "Bearer " + auth.token,
                            "Content-Type": "text/plain"
                        }
                    })
                        .then(response => {
                            if (!response.ok) {
                                notifications.show({
                                    title: "Error",
                                    message: "There was an error while inviting that user. Make sure you entered their username correctly.",
                                    position: "top-center",
                                    color: "red"
                                });
                                return;
                            }

                            notifications.show({
                                title: "User invited",
                                message: data.get("username") + " has been invited to the game. Invite sent — they will see it when they open the app.",
                                position: "top-center"
                            });

                            trackAchievement("invite_friend", 1);
                            inviteInputRef.current!.value = "";
                        })
                        .catch(() => {
                            notifications.show({
                                title: "Error",
                                message: "There was an error while inviting that user. Make sure you entered their username correctly.",
                                position: "top-center",
                                color: "red"
                            });
                        });
                }}>
                    <Stack>
                        <TextInput
                            placeholder="Username"
                            name="username"
                            autoFocus
                            ref={inviteInputRef}
                        />

                        <Group justify="end">
                            <Button type="submit">
                                Invite
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>

            {/* Game Mode Selection Modal */}
            <Modal
                title="How do you want to play?"
                centered
                opened={gameMode === 'selecting' && isLeader && gameState.phase === 'LOBBY'}
                keepMounted={false}
                onClose={() => navigate("/")}
                size="md"
            >
                <Stack gap="lg">
                    <motion.div 
                        whileHover={{ scale: 1.02 }} 
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setGameMode('online')}
                        style={{ cursor: 'pointer' }}
                    >
                        <Card
                            padding="lg"
                            radius="md"
                            withBorder
                            style={{ borderColor: 'var(--mantine-color-blue-5)' }}
                        >
                            <Group>
                                <Wifi size={32} color="var(--mantine-color-blue-5)" />
                                <Stack gap={4}>
                                    <Text fw={600} size="lg">Online</Text>
                                    <Text size="sm" c="dimmed">Play against friends online</Text>
                                </Stack>
                            </Group>
                        </Card>
                    </motion.div>

                    <motion.div 
                        whileHover={{ scale: 1.02 }} 
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            setGameMode('local');
                            setSkillLevel('advanced'); // Local play uses all tricks
                        }}
                        style={{ cursor: 'pointer' }}
                    >
                        <Card
                            padding="lg"
                            radius="md"
                            withBorder
                            style={{ borderColor: 'var(--mantine-color-green-5)' }}
                        >
                            <Group>
                                <Users size={32} color="var(--mantine-color-green-5)" />
                                <Stack gap={4}>
                                    <Text fw={600} size="lg">Local (Pass & Play)</Text>
                                    <Text size="sm" c="dimmed">Play with friends on this device</Text>
                                    <Badge size="xs" color="gray" variant="light">For fun only - no points</Badge>
                                </Stack>
                            </Group>
                        </Card>
                    </motion.div>

                    <Button 
                        variant="subtle" 
                        color="gray"
                        onClick={() => navigate("/")}
                        mt="xs"
                    >
                        ← Back to Home
                    </Button>
                </Stack>
            </Modal>

            {/* Skill Level Selection Modal (Online only) */}
            <Modal
                title="What's your skill level?"
                centered
                opened={gameMode === 'online' && skillLevel === null && isLeader && gameState.phase === 'LOBBY'}
                keepMounted={false}
                onClose={() => setGameMode('selecting')}
                size="md"
            >
                <Stack gap="lg">
                    <Text size="sm" c="dimmed" ta="center">
                        This affects which tricks appear when you roll the dice 🎲
                    </Text>

                    <motion.div 
                        whileHover={{ scale: 1.02 }} 
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSkillLevel('beginner')}
                        style={{ cursor: 'pointer' }}
                    >
                        <Card
                            padding="lg"
                            radius="md"
                            withBorder
                            style={{ borderColor: 'var(--mantine-color-teal-5)' }}
                        >
                            <Group>
                                <Text size="2rem">🛹</Text>
                                <Stack gap={4}>
                                    <Text fw={600} size="lg">Beginner</Text>
                                    <Text size="sm" c="dimmed">
                                        Kickflips, Heelflips, Pop Shuvits, 180s, basic grinds
                                    </Text>
                                    <Badge size="xs" color="teal" variant="light">
                                        {BEGINNER_TRICKS.length} tricks
                                    </Badge>
                                </Stack>
                            </Group>
                        </Card>
                    </motion.div>

                    <motion.div 
                        whileHover={{ scale: 1.02 }} 
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSkillLevel('advanced')}
                        style={{ cursor: 'pointer' }}
                    >
                        <Card
                            padding="lg"
                            radius="md"
                            withBorder
                            style={{ borderColor: 'var(--mantine-color-orange-5)' }}
                        >
                            <Group>
                                <Text size="2rem">🔥</Text>
                                <Stack gap={4}>
                                    <Text fw={600} size="lg">Advanced</Text>
                                    <Text size="sm" c="dimmed">
                                        Tre Flips, Hardflips, Laser Flips, Switch tricks, flip-in grinds
                                    </Text>
                                    <Badge size="xs" color="orange" variant="light">
                                        {ADVANCED_TRICKS.length} tricks
                                    </Badge>
                                </Stack>
                            </Group>
                        </Card>
                    </motion.div>

                    <Button 
                        variant="subtle" 
                        onClick={() => setGameMode('selecting')}
                        mt="xs"
                    >
                        ← Back
                    </Button>
                </Stack>
            </Modal>

            {/* Local Play Setup Modal */}
            <Modal
                title="🛹 Local Game Setup"
                centered
                opened={gameMode === 'local' && !localGameState}
                keepMounted={false}
                onClose={() => setGameMode('selecting')}
                size="md"
            >
                <Stack gap="md">
                    <Text size="sm" c="dimmed">Add players who will take turns on this device</Text>
                    
                    <form onSubmit={(e) => { e.preventDefault(); addLocalPlayer(); }}>
                        <Group>
                            <TextInput
                                placeholder="Player name"
                                value={newPlayerName}
                                onChange={(e) => setNewPlayerName(e.target.value)}
                                style={{ flex: 1 }}
                            />
                            <Button
                                type="submit"
                                leftSection={<UserPlus2 size={16} />}
                                disabled={!newPlayerName.trim() || localPlayers.length >= 8}
                            >
                                Add
                            </Button>
                        </Group>
                    </form>

                    <Divider />

                    <Stack gap="xs">
                        <Text size="sm" fw={500}>Players ({localPlayers.length}/8)</Text>
                        {localPlayers.length === 0 ? (
                            <Text size="sm" c="dimmed" ta="center" py="md">
                                No players added yet
                            </Text>
                        ) : (
                            localPlayers.map((player, index) => (
                                <Card key={player.id} padding="xs" withBorder>
                                    <Group justify="space-between">
                                        <Group gap="sm">
                                            <Badge variant="filled" color="blue" size="sm">
                                                P{index + 1}
                                            </Badge>
                                            <Text fw={500}>{player.name}</Text>
                                        </Group>
                                        <ActionIcon
                                            variant="subtle"
                                            color="red"
                                            onClick={() => removeLocalPlayer(player.id)}
                                        >
                                            <X size={16} />
                                        </ActionIcon>
                                    </Group>
                                </Card>
                            ))
                        )}
                    </Stack>

                    <Divider />

                    <Group justify="space-between">
                        <Button variant="subtle" onClick={() => setGameMode('selecting')}>
                            Back
                        </Button>
                        <Button
                            variant="gradient"
                            gradient={{ from: 'green', to: 'teal' }}
                            disabled={localPlayers.length < 2}
                            onClick={startLocalGame}
                        >
                            Start Game ({localPlayers.length} players)
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            <div className={classes.root}>
                <div className={classes.header}>
                    <ActionIcon
                        variant="subtle"
                        onClick={() => navigate("/")}
                    >
                        <ChevronLeft />
                    </ActionIcon>

                    <Stack justify="center" align="center" gap={4}>
                        <Text fw={500} ta="center">
                            {gameMode === 'local' ? (
                                "🛹 Local Game"
                            ) : game === undefined ? (
                                "Loading..."
                            ) : (
                                isLeader ? (
                                    "Your Game"
                                ) : (
                                    `${getUsername(game.leader) ?? "Loading"}'s Game`
                                )
                            )}
                        </Text>
                        {skillLevel && gameMode === 'online' && (
                            <Badge 
                                size="xs" 
                                color={skillLevel === 'beginner' ? 'teal' : 'orange'} 
                                variant="light"
                            >
                                {skillLevel === 'beginner' ? '🛹 Beginner' : '🔥 Advanced'}
                            </Badge>
                        )}
                    </Stack>

                    <div style={{ width: 28 }} /> {/* Spacer to balance header */}
                </div>

                <div className={classes.main}>
                    <div className={classes.game}>
                        {/* Main game area - Letters are the star! */}
                        <div className={classes.gameContent}>
                            <AnimatePresence mode="wait">
                                {/* ===== SKATER ANIMATION (Background, smaller) ===== */}
                                {showSkaterAnimation && (
                                    <motion.div
                                        key="skater"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className={classes.skaterContainer}
                                    >
                                        <SkaterAnimation
                                            trick={currentTrick || 'kickflip'}
                                            onComplete={handleAnimationComplete}
                                        />
                                    </motion.div>
                                )}

                                {/* ===== MAIN GAME UI ===== */}
                                {!showSkaterAnimation && (
                                    <motion.div
                                        key="gameUI"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className={classes.mainGameArea}
                                    >
                                        {/* ===== BIG SKATE LETTERS - THE STAR! ===== */}
                                        <div className={classes.lettersSection}>
                                            <SkateLettersDisplay
                                                fails={getCurrentPlayerFails()}
                                                playerName={getCurrentPlayerName()}
                                                isCurrentPlayer={true}
                                                size="lg"
                                            />
                                        </div>

                                        {/* ===== GAME PHASE UI ===== */}
                                        <div className={classes.actionSection}>
                                            {/* LOBBY */}
                                            {(gameMode !== 'local' && gameState.phase === "LOBBY") && (
                                                <GameCard>
                                                    <Stack align="center" gap="md" p="lg">
                                                        <Badge size="lg" variant="dot" color="blue">
                                                            Lobby
                                                        </Badge>
                                                        <Text size="lg" ta="center">
                                                            {(gameState.players.length < 2) ? (
                                                                "Waiting for more players..."
                                                            ) : (
                                                                "Waiting for the leader to start the game..."
                                                            )}
                                                        </Text>
                                                        {isLeader && gameMode === 'online' && (
                                                            <Button
                                                                disabled={gameState.players.length < 2}
                                                                onClick={() => {
                                                                    socketRef.current!.send(JSON.stringify({
                                                                        type: "start"
                                                                    }));
                                                                }}
                                                            >
                                                                {t("game.startGame")}
                                                            </Button>
                                                        )}
                                                    </Stack>
                                                </GameCard>
                                            )}

                                            {/* RESULT BUTTONS - Main focus after animation */}
                                            {showResultButtons && (
                                                <motion.div
                                                    initial={{ y: 50, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    transition={{ type: "spring", stiffness: 300 }}
                                                >
                                                    <Stack align="center" gap="lg">
                                                        {currentTrick && currentTrick !== "Your Trick" && (
                                                            <Badge size="xl" variant="filled" color="orange" style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}>
                                                                {currentTrick}
                                                            </Badge>
                                                        )}
                                                        <Text size="xl" fw={700} ta="center" c="white">
                                                            {t("game.didYouLandIt")}
                                                        </Text>
                                                        <Group gap="md" wrap="wrap" justify="center">
                                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                                <Button
                                                                    size="lg"
                                                                    color="red"
                                                                    variant="filled"
                                                                    onClick={() => handleTrickResult(false)}
                                                                    className={classes.resultButton}
                                                                    leftSection={<Text size="lg">💥</Text>}
                                                                >
                                                                    {t("game.bailed")}
                                                                </Button>
                                                            </motion.div>
                                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                                <Button
                                                                    size="lg"
                                                                    color="yellow"
                                                                    variant="filled"
                                                                    onClick={() => {
                                                                        // Rebate - redo the trick
                                                                        setShowResultButtons(false);
                                                                        setCurrentTrick(null);
                                                                        setCurrentTrickWasDiceRoll(false);
                                                                    }}
                                                                    className={classes.resultButton}
                                                                    leftSection={<Text size="lg">🔄</Text>}
                                                                >
                                                                    {t("game.rebate")}
                                                                </Button>
                                                            </motion.div>
                                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                                <Button
                                                                    size="lg"
                                                                    color="green"
                                                                    variant="filled"
                                                                    onClick={() => handleTrickResult(true)}
                                                                    className={classes.resultButton}
                                                                    leftSection={<Text size="lg">🎉</Text>}
                                                                >
                                                                    {t("game.landed")}
                                                                </Button>
                                                            </motion.div>
                                                        </Group>
                                                    </Stack>
                                                </motion.div>
                                            )}

                                            {/* SETTING PHASE - Dice Roll or Own Trick */}
                                            {!showResultButtons && (
                                                <>
                                                    {/* LOCAL SETTING */}
                                                    {gameMode === 'local' && localGameState?.phase === 'SETTING' && (
                                                        <Stack align="center" gap="lg">
                                                            <Badge size="xl" color="blue" variant="filled">
                                                                {getLocalChallenger()?.name}'s Turn to Set!
                                                            </Badge>
                                                            
                                                            {isRollingDice && currentTrick && (
                                                                <motion.div
                                                                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                                                                    transition={{ duration: 0.2, repeat: Infinity }}
                                                                >
                                                                    <Badge size="xl" variant="light" color="orange" style={{ fontSize: '1.5rem', padding: '1rem 2rem' }}>
                                                                        {currentTrick}
                                                                    </Badge>
                                                                </motion.div>
                                                            )}

                                                            <Group gap="lg">
                                                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                                    <Button
                                                                        size="md"
                                                                        variant="gradient"
                                                                        gradient={{ from: 'orange', to: 'red' }}
                                                                        leftSection={<Dice5 size={20} />}
                                                                        onClick={handleRollDice}
                                                                        disabled={isRollingDice}
                                                                        className={classes.actionButton}
                                                                    >
                                                                        🎲 {t("game.rollDice")}
                                                                    </Button>
                                                                </motion.div>
                                                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                                    <Button
                                                                        size="md"
                                                                        variant="gradient"
                                                                        gradient={{ from: 'violet', to: 'grape' }}
                                                                        leftSection={<Sparkles size={20} />}
                                                                        onClick={handleOwnTrick}
                                                                        disabled={isRollingDice}
                                                                        className={classes.actionButton}
                                                                    >
                                                                        ✨ {t("game.doYourOwn")}
                                                                    </Button>
                                                                </motion.div>
                                                            </Group>
                                                        </Stack>
                                                    )}

                                                    {/* LOCAL DEFENSE */}
                                                    {gameMode === 'local' && localGameState?.phase === 'DEFENSE' && (
                                                        <Stack align="center" gap="lg">
                                                            <Badge size="xl" color="yellow" variant="filled">
                                                                {getLocalDefender()?.name}'s Turn to Match!
                                                            </Badge>
                                                            
                                                            <motion.div
                                                                animate={{ scale: [1, 1.05, 1] }}
                                                                transition={{ duration: 1.5, repeat: Infinity }}
                                                            >
                                                                <Text 
                                                                    size="2.5rem" 
                                                                    fw={900} 
                                                                    ta="center"
                                                                    style={{
                                                                        fontFamily: '"Permanent Marker", cursive',
                                                                        color: '#ff6b00',
                                                                        textShadow: '3px 3px 0 #000, 0 0 20px rgba(255,107,0,0.5)',
                                                                    }}
                                                                >
                                                                    {localGameState.currentTrick}
                                                                </Text>
                                                            </motion.div>
                                                            
                                                            <Text size="sm" c="dimmed">
                                                                Set by {getLocalChallenger()?.name}
                                                            </Text>

                                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                                <Button
                                                                    size="xl"
                                                                    variant="gradient"
                                                                    gradient={{ from: 'yellow', to: 'orange' }}
                                                                    onClick={handleMatchTrick}
                                                                    className={classes.actionButton}
                                                                >
                                                                    🛹 Attempt Trick!
                                                                </Button>
                                                            </motion.div>
                                                        </Stack>
                                                    )}

                                                    {/* LOCAL GAME OVER */}
                                                    {gameMode === 'local' && localGameState?.phase === 'OVER' && (
                                                        <Stack align="center" gap="lg">
                                                            <motion.div
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                transition={{ type: "spring", stiffness: 200 }}
                                                            >
                                                                <Text size="3rem" fw={900} ta="center">
                                                                    🏆 {t("game.gameOver")} 🏆
                                                                </Text>
                                                            </motion.div>
                                                            
                                                            {localGameState.order.length === 1 && (
                                                                <Text 
                                                                    size="2rem" 
                                                                    fw={700} 
                                                                    c="var(--mantine-color-green-5)"
                                                                    style={{ fontFamily: '"Permanent Marker", cursive' }}
                                                                >
                                                                    {localPlayers[localGameState.order[0]]?.name} {t("game.wins")}
                                                                </Text>
                                                            )}

                                                            <Group gap="md">
                                                                <Button
                                                                    size="lg"
                                                                    variant="gradient"
                                                                    gradient={{ from: 'orange', to: 'red' }}
                                                                    onClick={() => {
                                                                        // Reset all players' fails and restart with same players
                                                                        setLocalPlayers(localPlayers.map(p => ({ ...p, fails: 0 })));
                                                                        startLocalGame();
                                                                    }}
                                                                >
                                                                    🔄 {t("game.runItBack")}
                                                                </Button>
                                                                <Button
                                                                    size="lg"
                                                                    variant="subtle"
                                                                    onClick={() => {
                                                                        setGameMode('selecting');
                                                                        setLocalGameState(null);
                                                                        setLocalPlayers([]);
                                                                    }}
                                                                >
                                                                    {t("common.newGame")}
                                                                </Button>
                                                            </Group>
                                                        </Stack>
                                                    )}

                                                    {/* ONLINE SETTING */}
                                                    {gameMode !== 'local' && gameState.phase === "SETTING" && (
                                                        <>
                                                            {gameState.challenger === auth.id ? (
                                                                <Stack align="center" gap="lg">
                                                                    <Badge size="xl" color="blue" variant="filled">
                                                                        {t("game.yourTurnToSet")}
                                                                    </Badge>
                                                                    
                                                                    {isRollingDice && currentTrick && (
                                                                        <motion.div
                                                                            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                                                                            transition={{ duration: 0.2, repeat: Infinity }}
                                                                        >
                                                                            <Badge size="xl" variant="light" color="orange" style={{ fontSize: '1.5rem', padding: '1rem 2rem' }}>
                                                                                {currentTrick}
                                                                            </Badge>
                                                                        </motion.div>
                                                                    )}

                                                                    <Group gap="lg">
                                                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                                            <Button
                                                                                size="md"
                                                                                variant="gradient"
                                                                                gradient={{ from: 'orange', to: 'red' }}
                                                                                leftSection={<Dice5 size={20} />}
                                                                                onClick={handleRollDice}
                                                                                disabled={isRollingDice}
                                                                                className={classes.actionButton}
                                                                            >
                                                                                🎲 {t("game.rollDice")}
                                                                            </Button>
                                                                        </motion.div>
                                                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                                            <Button
                                                                                size="md"
                                                                                variant="gradient"
                                                                                gradient={{ from: 'violet', to: 'grape' }}
                                                                                leftSection={<Sparkles size={20} />}
                                                                                onClick={handleOwnTrick}
                                                                                disabled={isRollingDice}
                                                                                className={classes.actionButton}
                                                                            >
                                                                                ✨ {t("game.doYourOwn")}
                                                                            </Button>
                                                                        </motion.div>
                                                                    </Group>
                                                                </Stack>
                                                            ) : (
                                                                <Stack align="center" gap="md">
                                                                    <Badge size="xl" color="blue" variant="filled">
                                                                        {t("game.waiting")}
                                                                    </Badge>
                                                                    <Text size="xl" fw={600} ta="center">
                                                                        {getUsername(gameState.challenger!)} {t("game.isSettingTrick")}
                                                                    </Text>
                                                                </Stack>
                                                            )}
                                                        </>
                                                    )}

                                                    {/* ONLINE DEFENSE */}
                                                    {gameMode !== 'local' && gameState.phase === "DEFENSE" && (
                                                        <>
                                                            {gameState.defender === auth.id ? (
                                                                <Stack align="center" gap="lg">
                                                                    <Badge size="xl" color="yellow" variant="filled">
                                                                        Your Turn to Match!
                                                                    </Badge>
                                                                    
                                                                    <motion.div
                                                                        animate={{ scale: [1, 1.05, 1] }}
                                                                        transition={{ duration: 1.5, repeat: Infinity }}
                                                                    >
                                                                        <Text 
                                                                            size="2.5rem" 
                                                                            fw={900} 
                                                                            ta="center"
                                                                            style={{
                                                                                fontFamily: '"Permanent Marker", cursive',
                                                                                color: '#ff6b00',
                                                                                textShadow: '3px 3px 0 #000, 0 0 20px rgba(255,107,0,0.5)',
                                                                            }}
                                                                        >
                                                                            {gameState.currentTrick}
                                                                        </Text>
                                                                    </motion.div>

                                                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                                        <Button
                                                                            size="xl"
                                                                            variant="gradient"
                                                                            gradient={{ from: 'yellow', to: 'orange' }}
                                                                            onClick={handleMatchTrick}
                                                                            className={classes.actionButton}
                                                                        >
                                                                            🛹 Attempt Trick!
                                                                        </Button>
                                                                    </motion.div>
                                                                </Stack>
                                                            ) : (
                                                                <Stack align="center" gap="md">
                                                                    <Badge size="xl" color="yellow" variant="filled">
                                                                        Defense Phase
                                                                    </Badge>
                                                                    <Text size="xl" fw={600} ta="center">
                                                                        {getUsername(gameState.defender!)} is matching:
                                                                    </Text>
                                                                    <Text 
                                                                        size="2rem" 
                                                                        fw={900}
                                                                        style={{
                                                                            fontFamily: '"Permanent Marker", cursive',
                                                                            color: '#ff6b00',
                                                                        }}
                                                                    >
                                                                        {gameState.currentTrick}
                                                                    </Text>
                                                                </Stack>
                                                            )}
                                                        </>
                                                    )}

                                                    {/* ONLINE GAME OVER */}
                                                    {gameMode !== 'local' && gameState.phase === "OVER" && (
                                                        <Stack align="center" gap="lg">
                                                            <motion.div
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                transition={{ type: "spring", stiffness: 200 }}
                                                            >
                                                                <Text size="3rem" fw={900} ta="center">
                                                                    🏆 {t("game.gameOver")} 🏆
                                                                </Text>
                                                            </motion.div>
                                                            
                                                            {gameState.order && gameState.order.length === 1 && (
                                                                <Text 
                                                                    size="2rem" 
                                                                    fw={700} 
                                                                    c="var(--mantine-color-green-5)"
                                                                    style={{ fontFamily: '"Permanent Marker", cursive' }}
                                                                >
                                                                    {gameState.order[0] === auth.id ? t("game.youWin") : `${getUsername(gameState.order[0])} ${t("game.wins")}`}
                                                                </Text>
                                                            )}

                                                            <Group gap="md" mt="md">
                                                                {isLeader && (
                                                                    <Button
                                                                        size="lg"
                                                                        variant="gradient"
                                                                        gradient={{ from: 'orange', to: 'red' }}
                                                                        onClick={() => {
                                                                            socketRef.current?.send(JSON.stringify({
                                                                                type: "rematch"
                                                                            }));
                                                                        }}
                                                                    >
                                                                        🔄 {t("game.runItBack")}
                                                                    </Button>
                                                                )}
                                                                <Button
                                                                    size="lg"
                                                                    variant="subtle"
                                                                    onClick={() => navigate("/")}
                                                                >
                                                                    {t("common.backToHome")}
                                                                </Button>
                                                            </Group>
                                                        </Stack>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Players list */}
                    <div className={classes.players}>
                        {/* LOCAL PLAYERS LIST */}
                        {gameMode === 'local' && (
                            <>
                                <Group
                                    justify="space-between"
                                    align="center"
                                    p="sm"
                                >
                                    <Title order={4} fw={500}>
                                        <Badge color="violet" variant="light" mr="xs">LOCAL</Badge>
                                        Players ({localPlayers.length})
                                    </Title>
                                </Group>

                                <div className={classes.playersList}>
                                    {localPlayers.map((player, index) => {
                                        const isChallenger = localGameState?.challengerIndex === index;
                                        const isDefender = localGameState?.defenderIndex === index;
                                        const isCurrentTurn = localGameState?.phase === 'DEFENSE' 
                                            ? isDefender 
                                            : isChallenger;
                                        const isOut = player.fails >= 5;
                                        const isInOrder = localGameState?.order.includes(index) ?? true;
                                        
                                        return (
                                            <motion.div
                                                key={`local-player-${player.id}`}
                                                className={classes.player}
                                                initial="hidden"
                                                animate="visible"
                                                variants={fadeInUp}
                                                custom={index}
                                                style={{
                                                    opacity: isOut ? 0.5 : 1,
                                                    backgroundColor: isCurrentTurn ? "var(--mantine-color-violet-9)" : "transparent",
                                                    borderLeft: isCurrentTurn ? "4px solid var(--mantine-color-violet-5)" : "4px solid transparent",
                                                    transition: "all 0.3s ease",
                                                    display: isInOrder || !localGameState ? 'flex' : 'none'
                                                }}
                                            >
                                                <Group gap="sm">
                                                    <Badge size="sm" variant="filled" color="violet">
                                                        P{index + 1}
                                                    </Badge>
                                                    <Text fw={isCurrentTurn ? 600 : 400}>
                                                        {player.name}
                                                    </Text>

                                                    {isOut && (
                                                        <Badge size="xs" color="red" variant="filled">
                                                            OUT
                                                        </Badge>
                                                    )}
                                                </Group>

                                                <Text pl={25}>
                                                    {Array(5)
                                                        .fill(null)
                                                        .map((_, i) => (
                                                            <Text
                                                                key={i}
                                                                component="span"
                                                                fw="bold"
                                                                size="lg"
                                                                pl={6}
                                                                c={player.fails > i ? "red" : "dimmed"}
                                                            >
                                                                {"SKATE"[i]}
                                                            </Text>
                                                        ))}
                                                </Text>

                                                <div style={{ flex: 1 }} />

                                                {isChallenger && (
                                                    <Badge color="blue" variant="filled">
                                                        Setter
                                                    </Badge>
                                                )}

                                                {isDefender && (
                                                    <Badge color="yellow" variant="filled">
                                                        Defender
                                                    </Badge>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </>
                        )}

                        {/* ONLINE PLAYERS LIST */}
                        {gameMode !== 'local' && (
                            <>
                                <Group
                                    justify="space-between"
                                    align="center"
                                    p="sm"
                                >
                                    <Title order={4} fw={500}>
                                        {gameMode === 'online' && <Badge color="blue" variant="light" mr="xs">ONLINE</Badge>}
                                        Players ({gameState.players.length ?? 0})
                                    </Title>

                                    {isLeader && gameMode === 'online' && (
                                        <Button
                                            size="compact-sm"
                                            leftSection={<UserPlus size="1.25em" />}
                                            onClick={() => setInviting(true)}
                                        >
                                            Invite
                                        </Button>
                                    )}
                                </Group>

                                <div className={classes.playersList}>
                                    {gameState.players
                                        .toSorted((a, b) => {
                                            const order = gameState.order ?? [];
                                            const ia = order.indexOf(a.id);
                                            const ib = order.indexOf(b.id);
                                            const aNotInOrder = ia === -1;
                                            const bNotInOrder = ib === -1;

                                            if (!aNotInOrder && !bNotInOrder) {
                                                return ia - ib;
                                            }

                                            if (!aNotInOrder) return -1;
                                            if (!bNotInOrder) return 1;

                                            return 0;
                                        })
                                        .map((player, index) => {
                                            const isActive = player.id === gameState.challenger || player.id === gameState.defender;
                                            const isOut = player.fails >= 5;
                                            
                                            return (
                                                <motion.div
                                                    key={`player-${player.id}`}
                                                    className={classes.player}
                                                    initial="hidden"
                                                    animate="visible"
                                                    variants={fadeInUp}
                                                    custom={index}
                                                    style={{
                                                        opacity: isOut ? 0.5 : 1,
                                                        backgroundColor: isActive ? "var(--mantine-color-blue-9)" : "transparent",
                                                        borderLeft: isActive ? "4px solid var(--mantine-color-blue-5)" : "4px solid transparent",
                                                        transition: "all 0.3s ease"
                                                    }}
                                                >
                                                    <Group gap="sm">
                                                        <UserAvatar userId={player.id} username={getUsername(player.id) || "?"} size="sm" />
                                                        <Indicator
                                                            color={player.connected ? "green" : "red"}
                                                            processing={player.connected}
                                                            position="middle-end"
                                                            offset={-12}
                                                            size={10}
                                                        >
                                                            <Text fw={player.id === auth.id ? 600 : 400}>
                                                                {getUsername(player.id)}
                                                                {player.id === auth.id && " (You)"}
                                                            </Text>
                                                        </Indicator>

                                                        {isOut && (
                                                            <Badge size="xs" color="red" variant="filled">
                                                                OUT
                                                            </Badge>
                                                        )}
                                                    </Group>

                                                    <Text pl={25}>
                                                        {Array(5)
                                                            .fill(null)
                                                            .map((_, i) => (
                                                                <Text
                                                                    key={i}
                                                                    component="span"
                                                                    fw="bold"
                                                                    size="lg"
                                                                    pl={6}
                                                                    c={player.fails > i ? "red" : "dimmed"}
                                                                >
                                                                    {"SKATE"[i]}
                                                                </Text>
                                                            ))}
                                                    </Text>

                                                    <div style={{ flex: 1 }} />

                                                    {(player.id === gameState.challenger) && (
                                                        <Badge color="blue" variant="filled">
                                                            Setter
                                                        </Badge>
                                                    )}

                                                    {(player.id === gameState.defender) && (
                                                        <Badge color="yellow" variant="filled">
                                                            Defender
                                                        </Badge>
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {gameResults && (
                <GameOverModal
                    opened={showGameOverModal}
                    onClose={() => setShowGameOverModal(false)}
                    isWinner={gameResults.isWinner}
                    winnerName={gameResults.winnerName}
                    pointsEarned={gameResults.pointsEarned}
                    onGoHome={() => navigate("/")}
                />
            )}
        </>
    );
};
