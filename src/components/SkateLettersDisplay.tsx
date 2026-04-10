import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import confetti from "canvas-confetti";
import { useTranslation } from "react-i18next";

interface SkateLettersDisplayProps {
    fails: number;
    playerName?: string;
    isCurrentPlayer?: boolean;
    size?: "sm" | "md" | "lg";
    onLetterAnimationComplete?: () => void;
}

const LETTERS = ["S", "K", "A", "T", "E"];

// Graffiti-style colors
const GRAFFITI_COLORS = {
    empty: "#2a2a3a",
    emptyStroke: "#4a4a5a",
    filled: "#ff2d2d",
    filledGlow: "#ff6b6b",
    accent: "#ff6b00",
    spray: "#ff4444",
};

export const SkateLettersDisplay = ({
    fails,
    playerName,
    isCurrentPlayer = false,
    size = "lg",
    onLetterAnimationComplete,
}: SkateLettersDisplayProps) => {
    const { t } = useTranslation();
    const [animatingIndex, setAnimatingIndex] = useState<number | null>(null);
    const [previousFails, setPreviousFails] = useState(fails);
    const containerRef = useRef<HTMLDivElement>(null);

    // Detect when a new letter is earned
    useEffect(() => {
        if (fails > previousFails && fails <= 5) {
            const newLetterIndex = fails - 1;
            setAnimatingIndex(newLetterIndex);
            
            // Trigger screen shake
            if (containerRef.current) {
                containerRef.current.classList.add("shake");
                setTimeout(() => {
                    containerRef.current?.classList.remove("shake");
                }, 500);
            }

            // Spray paint particle effect
            triggerSprayEffect(newLetterIndex);

            // Reset after animation
            setTimeout(() => {
                setAnimatingIndex(null);
                onLetterAnimationComplete?.();
            }, 800);
        }
        setPreviousFails(fails);
    }, [fails, previousFails, onLetterAnimationComplete]);

    const triggerSprayEffect = (letterIndex: number) => {
        // Calculate position based on letter index
        const baseX = 0.2 + (letterIndex * 0.15);
        
        // Spray paint burst
        confetti({
            particleCount: 30,
            spread: 50,
            origin: { x: baseX, y: 0.4 },
            colors: [GRAFFITI_COLORS.spray, GRAFFITI_COLORS.filled, "#ffffff"],
            gravity: 1.5,
            scalar: 0.8,
            shapes: ["circle"],
            ticks: 60,
            zIndex: 9999,
        });

        // If it's the final "E", big celebration
        if (letterIndex === 4) {
            setTimeout(() => {
                confetti({
                    particleCount: 100,
                    spread: 100,
                    origin: { x: 0.5, y: 0.5 },
                    colors: ["#ff2d2d", "#ff6b00", "#ffaa00", "#ffffff"],
                    gravity: 0.8,
                    zIndex: 9999,
                });
            }, 300);
        }
    };

    const sizeConfig = {
        sm: { fontSize: "1.5rem", gap: "0.3rem", height: "50px" },
        md: { fontSize: "2.5rem", gap: "0.5rem", height: "80px" },
        lg: { fontSize: "clamp(2.5rem, 8vw, 5rem)", gap: "clamp(0.5rem, 2vw, 1.2rem)", height: "120px" },
    };

    const config = sizeConfig[size];

    return (
        <div
            ref={containerRef}
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5rem",
            }}
        >
            {/* Player name tag */}
            {playerName && (
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    style={{
                        background: isCurrentPlayer
                            ? "linear-gradient(135deg, #ff6b00 0%, #ff2d2d 100%)"
                            : "rgba(0,0,0,0.7)",
                        padding: "0.5rem 1.5rem",
                        borderRadius: "4px",
                        border: `2px solid ${isCurrentPlayer ? "#fff" : "#444"}`,
                        marginBottom: "0.5rem",
                    }}
                >
                    <span
                        style={{
                            fontFamily: '"Permanent Marker", "Comic Sans MS", cursive',
                            fontSize: size === "lg" ? "1.2rem" : "1rem",
                            color: "#fff",
                            textTransform: "uppercase",
                            letterSpacing: "2px",
                            textShadow: "2px 2px 0 rgba(0,0,0,0.5)",
                        }}
                    >
                        {playerName}
                    </span>
                </motion.div>
            )}

            {/* Letters container */}
            <div
                style={{
                    display: "flex",
                    gap: config.gap,
                    padding: "0.75rem clamp(0.75rem, 3vw, 2rem)",
                    background: "linear-gradient(180deg, rgba(20,20,30,0.9) 0%, rgba(10,10,20,0.95) 100%)",
                    borderRadius: "12px",
                    border: "3px solid #333",
                    boxShadow: `
                        inset 0 0 30px rgba(0,0,0,0.5),
                        0 0 20px rgba(0,0,0,0.5),
                        0 10px 40px rgba(0,0,0,0.3)
                    `,
                    position: "relative",
                    overflow: "visible",
                    maxWidth: "95vw",
                }}
            >
                {/* Brick wall texture overlay */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        opacity: 0.1,
                        backgroundImage: `
                            repeating-linear-gradient(
                                0deg,
                                transparent,
                                transparent 20px,
                                rgba(255,255,255,0.1) 20px,
                                rgba(255,255,255,0.1) 22px
                            ),
                            repeating-linear-gradient(
                                90deg,
                                transparent,
                                transparent 40px,
                                rgba(255,255,255,0.05) 40px,
                                rgba(255,255,255,0.05) 42px
                            )
                        `,
                        borderRadius: "12px",
                        pointerEvents: "none",
                    }}
                />

                {LETTERS.map((letter, index) => (
                    <GraffitiLetter
                        key={letter}
                        letter={letter}
                        isFilled={index < fails}
                        isAnimating={animatingIndex === index}
                        size={config.fontSize}
                        index={index}
                    />
                ))}
            </div>

            {/* Status text */}
            {fails >= 5 && (
                <motion.div
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    style={{
                        marginTop: "1rem",
                        padding: "0.75rem 2rem",
                        background: "linear-gradient(135deg, #ff2d2d 0%, #cc0000 100%)",
                        borderRadius: "4px",
                        border: "3px solid #fff",
                        transform: "rotate(-3deg)",
                    }}
                >
                    <span
                        style={{
                            fontFamily: '"Permanent Marker", cursive',
                            fontSize: "1.5rem",
                            color: "#fff",
                            textTransform: "uppercase",
                            letterSpacing: "4px",
                            textShadow: "2px 2px 0 rgba(0,0,0,0.5)",
                        }}
                    >
                        {t("game.youLost")}
                    </span>
                </motion.div>
            )}

            {/* Shake animation styles */}
            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
                .shake {
                    animation: shake 0.5s ease-in-out;
                }
            `}</style>
        </div>
    );
};

// Individual graffiti letter component
const GraffitiLetter = ({
    letter,
    isFilled,
    isAnimating,
    size,
    index,
}: {
    letter: string;
    isFilled: boolean;
    isAnimating: boolean;
    size: string;
    index: number;
}) => {
    // Slight random rotation for graffiti effect
    const rotation = [-3, 2, -2, 3, -1][index];

    return (
        <div style={{ position: "relative" }}>
            {/* Main letter */}
            <AnimatePresence mode="wait">
                {isAnimating ? (
                    // Slamming animation
                    <motion.div
                        key="animating"
                        initial={{ 
                            scale: 3, 
                            y: -200, 
                            opacity: 0,
                            rotate: rotation + 20,
                        }}
                        animate={{ 
                            scale: [3, 1.2, 1], 
                            y: [-200, 10, 0], 
                            opacity: 1,
                            rotate: rotation,
                        }}
                        transition={{
                            duration: 0.5,
                            ease: [0.22, 1, 0.36, 1], // Custom bounce
                            times: [0, 0.6, 1],
                        }}
                        style={{
                            fontSize: size,
                            fontFamily: '"Permanent Marker", "Impact", sans-serif',
                            fontWeight: 900,
                            color: GRAFFITI_COLORS.filled,
                            textShadow: `
                                4px 4px 0 #000,
                                -2px -2px 0 #000,
                                2px -2px 0 #000,
                                -2px 2px 0 #000,
                                0 0 20px ${GRAFFITI_COLORS.filledGlow},
                                0 0 40px ${GRAFFITI_COLORS.spray}
                            `,
                            transform: `rotate(${rotation}deg)`,
                            filter: "drop-shadow(0 10px 20px rgba(255,45,45,0.5))",
                        }}
                    >
                        {letter}
                    </motion.div>
                ) : (
                    // Static letter
                    <motion.div
                        key="static"
                        initial={false}
                        animate={
                            isFilled
                                ? { scale: 1, opacity: 1 }
                                : { 
                                    scale: [1, 1.02, 1],
                                    opacity: [0.3, 0.4, 0.3],
                                  }
                        }
                        transition={
                            isFilled
                                ? { duration: 0.2 }
                                : { duration: 2, repeat: Infinity, ease: "easeInOut" }
                        }
                        style={{
                            fontSize: size,
                            fontFamily: '"Permanent Marker", "Impact", sans-serif',
                            fontWeight: 900,
                            color: isFilled ? GRAFFITI_COLORS.filled : GRAFFITI_COLORS.empty,
                            textShadow: isFilled
                                ? `
                                    4px 4px 0 #000,
                                    -2px -2px 0 #000,
                                    2px -2px 0 #000,
                                    -2px 2px 0 #000,
                                    0 0 10px ${GRAFFITI_COLORS.filledGlow}
                                  `
                                : `
                                    2px 2px 0 ${GRAFFITI_COLORS.emptyStroke},
                                    -1px -1px 0 ${GRAFFITI_COLORS.emptyStroke}
                                  `,
                            transform: `rotate(${rotation}deg)`,
                            WebkitTextStroke: isFilled ? "none" : `2px ${GRAFFITI_COLORS.emptyStroke}`,
                        }}
                    >
                        {letter}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Impact effect ring (during animation) */}
            {isAnimating && (
                <motion.div
                    initial={{ scale: 0.5, opacity: 1 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        width: "100%",
                        height: "100%",
                        border: `3px solid ${GRAFFITI_COLORS.spray}`,
                        borderRadius: "50%",
                        transform: "translate(-50%, -50%)",
                        pointerEvents: "none",
                    }}
                />
            )}
        </div>
    );
};

export default SkateLettersDisplay;

