import confetti from "canvas-confetti";

/**
 * Celebration effect utilities using canvas-confetti
 */

// Victory confetti - big celebration
export const celebrateVictory = () => {
    const count = 200;
    const defaults = {
        origin: { y: 0.7 },
        zIndex: 9999
    };

    function fire(particleRatio: number, opts: confetti.Options) {
        confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio)
        });
    }

    fire(0.25, {
        spread: 26,
        startVelocity: 55
    });

    fire(0.2, {
        spread: 60
    });

    fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8
    });

    fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2
    });

    fire(0.1, {
        spread: 120,
        startVelocity: 45
    });
};

// Points reward - gold/green confetti
export const celebratePoints = () => {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#FFD700", "#FFA500", "#10B981", "#34D399"],
        zIndex: 9999
    });
};

// Legacy alias for backwards compatibility
export const celebrateCoins = celebratePoints;

// Level up - colorful burst
export const celebrateLevelUp = () => {
    const colors = ["#e8732c", "#10B981", "#ffffff", "#dc3545"];
    
    confetti({
        particleCount: 150,
        spread: 120,
        origin: { y: 0.6 },
        colors,
        shapes: ["circle", "square"],
        zIndex: 9999
    });
};

// Achievement unlock - stars
export const celebrateAchievement = () => {
    confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#A855F7", "#C084FC", "#E9D5FF"],
        shapes: ["star"],
        scalar: 1.5,
        zIndex: 9999
    });
};

// Small celebration - subtle effect
export const celebrateSmall = () => {
    confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.65 },
        zIndex: 9999
    });
};

