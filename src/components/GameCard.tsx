import { Card, type CardProps } from "@mantine/core";
import { motion } from "framer-motion";
import { fadeInUp } from "../utils/animations";
import classes from "./GameCard.module.css";

interface GameCardProps extends CardProps {
    variant?: "default" | "gradient" | "premium";
    animated?: boolean;
}

export const GameCard = ({ 
    variant = "default", 
    animated = true,
    children, 
    className,
    ...props 
}: GameCardProps) => {
    const cardClassName = `${classes.card} ${classes[variant]} ${className || ""}`;
    
    const CardComponent = animated ? motion.div : "div";
    
    return (
        <CardComponent
            {...(animated ? { initial: "hidden", animate: "visible", variants: fadeInUp } : {})}
        >
            <Card className={cardClassName} {...props}>
                {children}
            </Card>
        </CardComponent>
    );
};

