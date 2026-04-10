import { Modal, Stack, Title, Text, Button, Group, SimpleGrid, Badge, ScrollArea } from "@mantine/core";
import { Calendar, Star, Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { popIn, fadeInUp, staggerContainer } from "../utils/animations";
import classes from "./DailyRewardModal.module.css";

interface DailyReward {
    day: number;
    points: number;
    bonus?: boolean;
    claimed: boolean;
}

interface DailyRewardModalProps {
    opened: boolean;
    onClose: () => void;
    rewards: DailyReward[];
    currentStreak: number;
    canClaim: boolean;
    onClaim: () => void;
}

export const DailyRewardModal = ({
    opened,
    onClose,
    rewards,
    currentStreak,
    canClaim,
    onClaim
}: DailyRewardModalProps) => {
    const nextDayIndex = currentStreak % 7;
    const nextReward = rewards[nextDayIndex];

    const handleClaim = () => {
        onClaim();
        setTimeout(() => onClose(), 1500);
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            size="xl"
            centered
            scrollAreaComponent={ScrollArea.Autosize}
            styles={{ body: { padding: 'var(--mantine-spacing-sm)' } }}
            title={
                <Group gap="xs">
                    <Calendar size={24} />
                    <Title order={2}>Daily Check-in</Title>
                </Group>
            }
            overlayProps={{ blur: 3 }}
            classNames={{ content: classes.modalContent }}
        >
            <Stack gap="xl" p="md">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                >
                    <Stack align="center" gap="xs">
                        <Badge size="xl" variant="gradient" gradient={{ from: "gold", to: "orange", deg: 90 }}>
                            Day {(currentStreak % 7) + 1}
                        </Badge>
                        <Text size="sm" c="dimmed" ta="center">
                            {currentStreak > 0 
                                ? `🔥 ${currentStreak} day streak! Keep it going!`
                                : "Start your daily check-in streak!"}
                        </Text>
                    </Stack>
                </motion.div>

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                >
                    <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
                        {rewards.map((reward, index) => {
                            const isToday = index === nextDayIndex && canClaim;
                            const isClaimed = reward.claimed;

                            return (
                                <motion.div
                                    key={reward.day}
                                    variants={fadeInUp}
                                    custom={index}
                                >
                                    <div 
                                        className={`${classes.rewardCard} ${
                                            isToday ? classes.rewardCardToday : 
                                            isClaimed ? classes.rewardCardClaimed :
                                            classes.rewardCardFuture
                                        } ${reward.bonus ? classes.bonusCard : ""}`}
                                    >
                                        {isClaimed && (
                                            <div className={classes.claimedCheck}>
                                                <Check size={20} />
                                            </div>
                                        )}
                                        
                                        {reward.bonus && (
                                            <div className={classes.bonusBadge}>
                                                <Sparkles size={12} />
                                                <span>BONUS</span>
                                            </div>
                                        )}
                                        
                                        <Text size="xs" fw={600} c="dimmed" ta="center">
                                            Day {reward.day}
                                        </Text>
                                        
                                        <Stack gap={4} align="center" mt="xs">
                                            <Group gap={4}>
                                                <Star size={18} color="var(--mantine-color-gold-5)" fill="var(--mantine-color-gold-5)" />
                                                <Text size="md" fw={700} c="gold.4">
                                                    {reward.points.toLocaleString()}
                                                </Text>
                                            </Group>
                                            <Text size="xs" c="dimmed">points</Text>
                                        </Stack>

                                        {isToday && (
                                            <Badge 
                                                size="xs" 
                                                variant="filled" 
                                                color="blue"
                                                mt="xs"
                                                className={classes.todayBadge}
                                            >
                                                TODAY
                                            </Badge>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </SimpleGrid>
                </motion.div>

                {canClaim && nextReward && (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={popIn}
                    >
                        <div className={classes.claimSection}>
                            <Stack align="center" gap="sm">
                                <Text fw={600}>
                                    {nextReward.bonus ? "🎉 Bonus Day Reward!" : "Today's Reward"}
                                </Text>
                                <Group gap="xs">
                                    <Star size={28} color="var(--mantine-color-gold-5)" fill="var(--mantine-color-gold-5)" />
                                    <Text size="xl" fw={700} c="gold.4">
                                        +{nextReward.points.toLocaleString()}
                                    </Text>
                                    <Text c="dimmed">points</Text>
                                </Group>
                                <Button
                                    size="lg"
                                    variant="gradient"
                                    gradient={{ from: "gold", to: "orange", deg: 90 }}
                                    onClick={handleClaim}
                                    fullWidth
                                >
                                    Claim Points
                                </Button>
                            </Stack>
                        </div>
                    </motion.div>
                )}

                {!canClaim && (
                    <Text size="sm" c="dimmed" ta="center">
                        Come back tomorrow for your next reward! 🎁
                    </Text>
                )}
            </Stack>
        </Modal>
    );
};
