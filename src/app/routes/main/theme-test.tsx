import { Button, Stack, Title, Group, Badge, Card, Text, SimpleGrid } from "@mantine/core";
import { motion } from "framer-motion";
import { fadeInUp, popIn, bounce } from "../../../utils/animations";
import { celebrateVictory, celebrateCoins, celebrateLevelUp, celebrateAchievement } from "../../../utils/confetti";
import { GameCard, CurrencyDisplay, RewardCard, GameOverModal } from "../../../components";
import { Trophy, Star, Target } from "lucide-react";
import { useState } from "react";

export function ThemeTest() {
    const [showVictoryModal, setShowVictoryModal] = useState(false);
    const [showDefeatModal, setShowDefeatModal] = useState(false);

    return (
        <Stack gap="lg" p="md">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
            >
                <Title order={2}>Theme & Animation Test</Title>
            </motion.div>

            <Card>
                <Text fw={600} mb="sm">Primary Blue Buttons</Text>
                <Group>
                    <Button color="blue" variant="filled">Primary Action</Button>
                    <Button color="blue" variant="light">Secondary</Button>
                    <Button color="blue" variant="outline">Outline</Button>
                </Group>
            </Card>

            <Card>
                <Text fw={600} mb="sm">Gold/Currency Buttons</Text>
                <Group>
                    <Button color="gold" variant="filled">Buy Coins</Button>
                    <Button color="gold" variant="light">Shop</Button>
                    <Badge color="gold" size="lg">1,250 coins</Badge>
                </Group>
            </Card>

            <Card>
                <Text fw={600} mb="sm">Success/Win Buttons</Text>
                <Group>
                    <Button color="success" variant="filled">You Won!</Button>
                    <Button color="success" variant="light">Claim Reward</Button>
                    <Badge color="success" size="lg">Victory</Badge>
                </Group>
            </Card>

            <Card>
                <Text fw={600} mb="sm">Premium Buttons</Text>
                <Group>
                    <Button color="premium" variant="filled">Upgrade</Button>
                    <Button color="premium" variant="light">VIP</Button>
                    <Badge color="premium" size="lg">Premium</Badge>
                </Group>
            </Card>

            <motion.div
                initial="hidden"
                animate="visible"
                variants={popIn}
                transition={{ delay: 0.2 }}
            >
                <Card>
                    <Text fw={600} mb="sm">All Badge Colors</Text>
                    <Group>
                        <Badge color="blue">Blue</Badge>
                        <Badge color="gold">Gold</Badge>
                        <Badge color="success">Success</Badge>
                        <Badge color="premium">Premium</Badge>
                        <Badge color="slate">Slate</Badge>
                    </Group>
                </Card>
            </motion.div>

            <motion.div
                initial="hidden"
                animate="visible"
                variants={bounce}
                transition={{ delay: 0.4 }}
            >
                <Card>
                    <Text fw={600} mb="sm">Celebration Effects</Text>
                    <Text size="sm" c="dimmed" mb="md">Click these to test confetti animations!</Text>
                    <Group>
                        <Button onClick={celebrateVictory} color="success" variant="filled">
                            🏆 Victory!
                        </Button>
                        <Button onClick={celebrateCoins} color="gold" variant="filled">
                            💰 Coins!
                        </Button>
                        <Button onClick={celebrateLevelUp} color="blue" variant="filled">
                            ⭐ Level Up!
                        </Button>
                        <Button onClick={celebrateAchievement} color="premium" variant="filled">
                            🎖️ Achievement!
                        </Button>
                    </Group>
                </Card>
            </motion.div>

            <Title order={3} mt="xl">Custom Components</Title>

            <GameCard variant="default">
                <Text fw={600} mb="sm">Default GameCard</Text>
                <Text size="sm" c="dimmed">A standard card with hover effects</Text>
            </GameCard>

            <GameCard variant="gradient">
                <Text fw={600} mb="sm">Gradient GameCard</Text>
                <Text size="sm" c="dimmed">Enhanced with gradient background and blue border</Text>
            </GameCard>

            <GameCard variant="premium">
                <Text fw={600} mb="sm">Premium GameCard</Text>
                <Text size="sm" c="dimmed">Special premium styling with glow effect</Text>
            </GameCard>

            <Card>
                <Text fw={600} mb="sm">Currency Displays</Text>
                <Stack gap="md">
                    <Group>
                        <CurrencyDisplay type="coins" amount={1250} size="sm" />
                        <CurrencyDisplay type="coins" amount={1250} size="md" />
                        <CurrencyDisplay type="coins" amount={1250} size="lg" />
                    </Group>
                    <Group>
                        <CurrencyDisplay type="gems" amount={450} size="sm" />
                        <CurrencyDisplay type="gems" amount={450} size="md" />
                        <CurrencyDisplay type="gems" amount={450} size="lg" showLabel />
                    </Group>
                </Stack>
            </Card>

            <Text fw={600} mb="sm">Reward Cards</Text>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
                <RewardCard
                    title="Daily Bonus"
                    description="Claim your daily reward!"
                    icon={<Trophy size={48} />}
                    badge="NEW"
                    badgeColor="success"
                    onClick={() => celebrateCoins()}
                />
                <RewardCard
                    title="Level Up!"
                    description="You reached level 10"
                    icon={<Star size={48} />}
                    badge="ACHIEVED"
                    badgeColor="gold"
                    onClick={() => celebrateLevelUp()}
                />
                <RewardCard
                    title="Mission Complete"
                    description="Win 5 games in a row"
                    icon={<Target size={48} />}
                    badge="3/5"
                    badgeColor="blue"
                />
            </SimpleGrid>

            <Title order={3}>Game Over Modals</Title>
            <Group>
                <Button
                    onClick={() => {
                        celebrateVictory();
                        setShowVictoryModal(true);
                    }}
                    color="success"
                >
                    Test Victory Modal
                </Button>
                <Button
                    onClick={() => setShowDefeatModal(true)}
                    color="red"
                    variant="light"
                >
                    Test Defeat Modal
                </Button>
            </Group>

            <GameOverModal
                opened={showVictoryModal}
                onClose={() => setShowVictoryModal(false)}
                isWinner={true}
                coinsEarned={100}
                xpEarned={50}
                onGoHome={() => setShowVictoryModal(false)}
                onPlayAgain={() => {
                    setShowVictoryModal(false);
                    celebrateVictory();
                }}
            />

            <GameOverModal
                opened={showDefeatModal}
                onClose={() => setShowDefeatModal(false)}
                isWinner={false}
                winnerName="TestPlayer"
                coinsEarned={25}
                xpEarned={10}
                onGoHome={() => setShowDefeatModal(false)}
            />
        </Stack>
    );
}

