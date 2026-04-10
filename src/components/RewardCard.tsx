import { Stack, Text, Badge } from "@mantine/core";
import { motion } from "framer-motion";
import { bounce } from "../utils/animations";
import classes from "./RewardCard.module.css";

interface RewardCardProps {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    badge?: string;
    badgeColor?: string;
    onClick?: () => void;
}

export const RewardCard = ({ 
    title, 
    description, 
    icon, 
    badge,
    badgeColor = "blue",
    onClick 
}: RewardCardProps) => {
    return (
        <motion.div
            className={classes.card}
            initial="hidden"
            animate="visible"
            variants={bounce}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
        >
            {badge && (
                <Badge 
                    className={classes.badge} 
                    color={badgeColor}
                    variant="filled"
                >
                    {badge}
                </Badge>
            )}
            
            {icon && (
                <div className={classes.icon}>
                    {icon}
                </div>
            )}
            
            <Stack gap="xs" align="center">
                <Text size="lg" fw={700} ta="center">
                    {title}
                </Text>
                
                {description && (
                    <Text size="sm" c="dimmed" ta="center">
                        {description}
                    </Text>
                )}
            </Stack>
        </motion.div>
    );
};

