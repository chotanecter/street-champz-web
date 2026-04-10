import { Group, Text } from "@mantine/core";
import { Coins, Gem } from "lucide-react";
import classes from "./CurrencyDisplay.module.css";

interface CurrencyDisplayProps {
    type: "coins" | "gems";
    amount: number;
    size?: "sm" | "md" | "lg";
    showLabel?: boolean;
}

export const CurrencyDisplay = ({ 
    type, 
    amount, 
    size = "md",
    showLabel = false 
}: CurrencyDisplayProps) => {
    const Icon = type === "coins" ? Coins : Gem;
    const color = type === "coins" ? "gold" : "premium";
    
    const iconSize = size === "sm" ? 16 : size === "md" ? 20 : 24;
    const fontSize = size === "sm" ? "sm" : size === "md" ? "md" : "lg";
    
    return (
        <Group gap="xs" className={classes.container}>
            <Icon size={iconSize} className={classes[type]} />
            <Text size={fontSize} fw={600} c={`var(--mantine-color-${color}-5)`}>
                {amount.toLocaleString()}
            </Text>
            {showLabel && (
                <Text size="xs" c="dimmed">
                    {type}
                </Text>
            )}
        </Group>
    );
};

