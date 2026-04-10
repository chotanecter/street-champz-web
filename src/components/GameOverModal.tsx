import { Modal, Stack, Title, Text, Button, Group, Divider } from "@mantine/core";
import { Trophy, Star, Home } from "lucide-react";
import { motion } from "framer-motion";
import { popIn, fadeInUp } from "../utils/animations";
import classes from "./GameOverModal.module.css";

interface GameOverModalProps {
    opened: boolean;
    onClose: () => void;
    isWinner: boolean;
    winnerName?: string;
    pointsEarned: number;
    onPlayAgain?: () => void;
    onGoHome: () => void;
}

export const GameOverModal = ({
    opened,
    onClose,
    isWinner,
    winnerName,
    pointsEarned,
    onPlayAgain,
    onGoHome
}: GameOverModalProps) => {
    return (
        <Modal
            opened={opened}
            onClose={onClose}
            size="md"
            centered
            withCloseButton={false}
            overlayProps={{ blur: 3 }}
            classNames={{ content: classes.modalContent }}
        >
            <Stack gap="xl" align="center" p="lg">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={popIn}
                >
                    <div className={isWinner ? classes.trophyWin : classes.trophyLose}>
                        <Trophy size={80} />
                    </div>
                </motion.div>

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    style={{ textAlign: "center" }}
                >
                    <Title order={1} className={isWinner ? classes.titleWin : classes.titleLose}>
                        {isWinner ? "🎉 Victory! 🎉" : "Game Over"}
                    </Title>
                    <Text size="lg" c="dimmed" mt="xs">
                        {isWinner 
                            ? "You are the champion!" 
                            : winnerName 
                                ? `${winnerName} wins!` 
                                : "Better luck next time!"}
                    </Text>
                </motion.div>

                <Divider w="100%" label="Points Earned" labelPosition="center" />

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    style={{ width: "100%" }}
                >
                    <div className={classes.rewardItem}>
                        <Group gap="sm">
                            <div className={classes.rewardIcon}>
                                <Star size={24} />
                            </div>
                            <div>
                                <Text fw={600}>Points Earned</Text>
                                <Text size="sm" c="dimmed">
                                    {isWinner ? "Victory bonus!" : "Participation reward"}
                                </Text>
                            </div>
                        </Group>
                        <Group gap="xs">
                            <Star size={20} color="var(--mantine-color-gold-5)" fill="var(--mantine-color-gold-5)" />
                            <Text size="xl" fw={700} c="gold.4">
                                +{pointsEarned.toLocaleString()}
                            </Text>
                        </Group>
                    </div>
                </motion.div>

                <Divider w="100%" />

                <Group gap="sm" w="100%">
                    <Button
                        variant="light"
                        leftSection={<Home size={20} />}
                        onClick={onGoHome}
                        flex={1}
                    >
                        Home
                    </Button>
                    {onPlayAgain && (
                        <Button
                            variant="gradient"
                            gradient={{ from: "gold", to: "orange", deg: 90 }}
                            onClick={onPlayAgain}
                            flex={1}
                        >
                            Play Again
                        </Button>
                    )}
                </Group>
            </Stack>
        </Modal>
    );
};
