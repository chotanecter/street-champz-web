import type { Variants } from "framer-motion";

/**
 * Reusable animation variants for consistent motion throughout the app
 */

// Fade in from bottom (great for cards, modals)
export const fadeInUp: Variants = {
    hidden: {
        opacity: 0,
        y: 20
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
            ease: "easeOut"
        }
    }
};

// Pop/scale animation (great for buttons, badges)
export const popIn: Variants = {
    hidden: {
        opacity: 0,
        scale: 0.8
    },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.3,
            ease: "backOut"
        }
    }
};

// Slide in from right (great for notifications, side panels)
export const slideInRight: Variants = {
    hidden: {
        opacity: 0,
        x: 50
    },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.3,
            ease: "easeOut"
        }
    }
};

// Bounce animation (great for currency gains, rewards)
export const bounce: Variants = {
    hidden: {
        opacity: 0,
        y: -20,
        scale: 0.8
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: "easeOut",
            type: "spring",
            bounce: 0.5
        }
    }
};

// Staggered children animation (great for lists)
export const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
};

// Pulse animation (for notifications, attention-grabbing)
export const pulse = {
    scale: [1, 1.05, 1],
    transition: {
        duration: 0.5,
        repeat: Infinity,
        repeatDelay: 2
    }
};

// Shake animation (for errors, invalid actions)
export const shake: Variants = {
    hidden: {
        opacity: 0,
        x: 0
    },
    visible: {
        opacity: 1,
        x: [0, -10, 10, -10, 10, 0],
        transition: {
            duration: 0.5
        }
    }
};

// Trick success animation (spinning celebration)
export const trickSuccess: Variants = {
    hidden: {
        opacity: 0,
        scale: 0.5,
        rotate: 0
    },
    visible: {
        opacity: 1,
        scale: 1,
        rotate: 360,
        transition: {
            duration: 0.8,
            ease: "easeOut",
            type: "spring",
            bounce: 0.4
        }
    }
};

// Trick fail animation (wobble and fade)
export const trickFail: Variants = {
    hidden: {
        opacity: 0,
        scale: 1,
        rotate: 0
    },
    visible: {
        opacity: 1,
        scale: [1, 0.9, 1.1, 0.95, 1],
        rotate: [0, -15, 15, -10, 10, 0],
        transition: {
            duration: 0.6,
            ease: "easeInOut"
        }
    }
};

// Skater animation (for trick display)
export const skaterTrick: Variants = {
    hidden: {
        opacity: 0,
        y: 50,
        rotate: 0
    },
    visible: {
        opacity: 1,
        y: 0,
        rotate: [0, 360],
        transition: {
            duration: 1.5,
            ease: "easeInOut",
            rotate: {
                duration: 1,
                ease: "easeInOut"
            }
        }
    }
};

