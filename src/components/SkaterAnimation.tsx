import { motion } from "framer-motion";
import { useEffect, useState, useCallback, useRef } from "react";

interface SkaterAnimationProps {
    trick: string;
    onComplete?: () => void;
}

type TrickStyle = 'treflip';

interface TrickConfig {
    name: string;
    style: TrickStyle;
    flipCount: number;      // How many kickflip rotations (1 = 360°)
    shuvitCount: number;    // How many shuvit rotations (1 = 180°)
    bodyLean: number;
    jumpHeight: number;
    difficulty: number;
}

// Always use tre flip - most visually impressive
const TRE_FLIP_CONFIG: TrickConfig = { 
    name: 'TRE FLIP', 
    style: 'treflip', 
    flipCount: 1, 
    shuvitCount: 2, 
    bodyLean: 12, 
    jumpHeight: 100, 
    difficulty: 3 
};

export const SkaterAnimation = ({ trick, onComplete }: SkaterAnimationProps) => {
    const [phase, setPhase] = useState<'rolling' | 'setup' | 'crouch' | 'jumping' | 'airborne' | 'landing' | 'rollaway'>('rolling');
    const [skaterX, setSkaterX] = useState(-80);
    const [animationProgress, setAnimationProgress] = useState(0);
    const onCompleteRef = useRef(onComplete);
    const hasCompletedRef = useRef(false);
    
    // Keep ref updated
    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);
    
    // Always use tre flip - it's the most visually impressive
    const config = TRE_FLIP_CONFIG;

    const runAnimation = useCallback(async () => {
        setPhase('rolling');
        setSkaterX(-80);
        setAnimationProgress(0);

        // Quick roll in
        for (let x = -80; x <= -10; x += 5) {
            setSkaterX(x);
            await new Promise(r => setTimeout(r, 15));
        }

        setPhase('setup');
        await new Promise(r => setTimeout(r, 250));

        setPhase('crouch');
        await new Promise(r => setTimeout(r, 200));

        setPhase('jumping');
        await new Promise(r => setTimeout(r, 100));

        setPhase('airborne');
        
        // Animate the tre flip - nice and visible
        const flipDuration = 1200; // 1.2 seconds of airtime
        const startTime = Date.now();
        
        const animateTrick = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / flipDuration, 1);
            const eased = 1 - Math.pow(1 - progress, 2);
            setAnimationProgress(eased);
            
            if (progress < 1) {
                requestAnimationFrame(animateTrick);
            }
        };
        animateTrick();

        await new Promise(r => setTimeout(r, flipDuration));

        setAnimationProgress(1);
        setPhase('landing');
        await new Promise(r => setTimeout(r, 200));

        setPhase('rollaway');
        for (let x = -10; x <= 100; x += 6) {
            setSkaterX(x);
            await new Promise(r => setTimeout(r, 12));
        }

        await new Promise(r => setTimeout(r, 150));
        if (!hasCompletedRef.current) {
            hasCompletedRef.current = true;
            onCompleteRef.current?.();
        }
    }, []);

    useEffect(() => {
        hasCompletedRef.current = false;
        runAnimation();
        
        // Guaranteed fallback - if animation doesn't complete in 4 seconds, force complete
        const fallbackTimer = setTimeout(() => {
            if (!hasCompletedRef.current) {
                hasCompletedRef.current = true;
                onCompleteRef.current?.();
            }
        }, 4000);
        
        return () => clearTimeout(fallbackTimer);
    }, [runAnimation]);

    const getSkaterY = (): number => {
        switch (phase) {
            case 'rolling':
            case 'setup': return 0;
            case 'crouch': return 8;
            case 'jumping': return -config.jumpHeight * 0.5;
            case 'airborne': return -config.jumpHeight;
            case 'landing': return -5;
            case 'rollaway': return 0;
            default: return 0;
        }
    };

    const isInAir = phase === 'jumping' || phase === 'airborne';
    const isCrouching = phase === 'crouch';
    const isLanding = phase === 'landing';

    return (
        <div
            style={{
                width: '100%',
                height: '300px',
                background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                borderRadius: '12px',
                border: '3px solid #2a2a4a',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* City skyline */}
            <div style={{
                position: 'absolute',
                bottom: '80px',
                left: 0,
                right: 0,
                height: '100px',
                opacity: 0.3,
            }}>
                <svg width="100%" height="100%" viewBox="0 0 400 100" preserveAspectRatio="none">
                    <rect x="20" y="40" width="30" height="60" fill="#0a0a15" />
                    <rect x="60" y="20" width="25" height="80" fill="#0a0a15" />
                    <rect x="100" y="50" width="35" height="50" fill="#0a0a15" />
                    <rect x="150" y="10" width="40" height="90" fill="#0a0a15" />
                    <rect x="200" y="35" width="30" height="65" fill="#0a0a15" />
                    <rect x="250" y="25" width="35" height="75" fill="#0a0a15" />
                    <rect x="300" y="45" width="25" height="55" fill="#0a0a15" />
                    <rect x="340" y="30" width="40" height="70" fill="#0a0a15" />
                </svg>
            </div>

            {/* Ground */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '80px',
                background: 'linear-gradient(180deg, #3d3d4d 0%, #2d2d3d 50%, #1d1d2d 100%)',
                borderTop: '4px solid #4a4a5a',
            }}>
                <div style={{
                    position: 'absolute',
                    top: '35px',
                    left: 0,
                    right: 0,
                    height: '6px',
                    background: 'repeating-linear-gradient(90deg, #5a5a6a 0px, #5a5a6a 40px, transparent 40px, transparent 60px)',
                }} />
            </div>

            {/* Trick name */}
            <motion.div
                initial={{ x: -150, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
                style={{
                    position: 'absolute',
                    top: '15px',
                    left: '15px',
                    padding: '10px 18px',
                    background: 'rgba(0, 0, 0, 0.85)',
                    border: '3px solid #ff6b00',
                    borderRadius: '6px',
                    zIndex: 20,
                }}
            >
                <div style={{
                    fontSize: '1.6rem',
                    fontWeight: 900,
                    fontFamily: '"Impact", "Arial Black", sans-serif',
                    color: '#fff',
                    textTransform: 'uppercase',
                    letterSpacing: '3px',
                    textShadow: '2px 2px 0 #ff6b00',
                }}>
                    {trick.toUpperCase()}
                </div>
            </motion.div>

            {/* Skater + Board */}
            <motion.div
                animate={{ x: skaterX, y: getSkaterY() }}
                transition={{
                    y: { type: 'spring', stiffness: isLanding ? 400 : 200, damping: isLanding ? 20 : 15 },
                    x: { duration: 0 },
                }}
                style={{
                    position: 'absolute',
                    bottom: '80px',
                    left: '50%',
                    zIndex: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                {/* Shadow */}
                <div style={{
                    position: 'absolute',
                    bottom: '-3px',
                    width: isInAir ? '30px' : '50px',
                    height: '8px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    borderRadius: '50%',
                    transition: 'all 0.3s ease',
                    opacity: isInAir ? 0.3 : 0.7,
                }} />

                {/* Skater */}
                <motion.div
                    animate={{ 
                        rotate: isInAir ? config.bodyLean : 0,
                        scaleY: isCrouching ? 0.8 : isLanding ? 0.9 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                    style={{ transformOrigin: 'bottom center' }}
                >
                    <SkaterSprite isCrouching={isCrouching} isInAir={isInAir} />
                </motion.div>

                {/* Board with trick-specific animation */}
                <BoardWithTrick 
                    config={config}
                    progress={animationProgress}
                    isInAir={isInAir}
                    isCrouching={isCrouching}
                />
            </motion.div>

            {/* Speed lines */}
            {isInAir && (
                <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ x: '100%', opacity: 0 }}
                            animate={{ x: '-100%', opacity: [0, 0.5, 0] }}
                            transition={{ duration: 0.4, delay: i * 0.05, repeat: Infinity }}
                            style={{
                                position: 'absolute',
                                top: `${30 + i * 10}%`,
                                width: '20%',
                                height: '2px',
                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Vignette */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)',
                pointerEvents: 'none',
            }} />
        </div>
    );
};

// Board component with tre flip animation
const BoardWithTrick = ({ 
    config, 
    progress, 
    isInAir, 
    isCrouching 
}: { 
    config: TrickConfig;
    progress: number;
    isInAir: boolean;
    isCrouching: boolean;
}) => {
    // Tre flip: kickflip + 360 shuvit
    const rotateX = isInAir ? config.flipCount * 360 * progress : 0;
    const rotateY = isInAir ? config.shuvitCount * 180 * progress : 0;

    return (
        <motion.div
            style={{ 
                marginTop: isCrouching ? '2px' : '-2px',
                transformStyle: 'preserve-3d',
                perspective: '200px',
            }}
        >
            <div style={{
                transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                transformStyle: 'preserve-3d',
                transition: 'none',
            }}>
                <BoardSprite isSpinning={isInAir} />
            </div>
        </motion.div>
    );
};

const SkaterSprite = ({ isCrouching, isInAir }: { isCrouching: boolean; isInAir: boolean }) => {
    const height = isCrouching ? 40 : 50;
    
    return (
        <svg width="40" height={height} viewBox={`0 0 40 ${height}`}
            style={{ filter: 'drop-shadow(2px 3px 4px rgba(0,0,0,0.5))' }}>
            {/* Head with beanie */}
            <circle cx="20" cy="8" r="7" fill="#2d5a27" />
            <rect x="13" y="8" width="14" height="3" fill="#2d5a27" />
            <rect x="15" y="10" width="10" height="9" fill="#e8c39e" rx="2" />
            <circle cx="17" cy="13" r="1" fill="#333" />
            <circle cx="23" cy="13" r="1" fill="#333" />
            
            {/* Body */}
            <rect x="12" y="19" width="16" height={isCrouching ? 10 : 16} fill="#2d5a27" rx="2" />
            
            {/* Arms */}
            <rect x="4" y={isCrouching ? 20 : 22} width="8" height="4" fill="#2d5a27" rx="2" 
                  transform={isInAir ? 'rotate(-20 8 24)' : ''} />
            <rect x="28" y={isCrouching ? 20 : 22} width="8" height="4" fill="#2d5a27" rx="2"
                  transform={isInAir ? 'rotate(20 32 24)' : ''} />
            
            {/* Legs */}
            <rect x="13" y={isCrouching ? 28 : 34} width="6" height={isCrouching ? 8 : 12} fill="#1a1a2e" />
            <rect x="21" y={isCrouching ? 28 : 34} width="6" height={isCrouching ? 8 : 12} fill="#1a1a2e" />
            
            {/* Shoes */}
            <rect x="11" y={isCrouching ? 35 : 45} width="8" height="4" fill="#8b4513" rx="1" />
            <rect x="21" y={isCrouching ? 35 : 45} width="8" height="4" fill="#8b4513" rx="1" />
        </svg>
    );
};

const BoardSprite = ({ isSpinning }: { isSpinning: boolean }) => {
    return (
        <svg width="50" height="12" viewBox="0 0 50 12"
            style={{ 
                filter: isSpinning ? 'drop-shadow(0 0 8px #ff6b00)' : 'drop-shadow(1px 2px 2px rgba(0,0,0,0.4))',
            }}>
            {/* Deck */}
            <rect x="3" y="2" width="44" height="5" rx="2.5" fill="#8b4513" />
            {/* Grip tape */}
            <rect x="5" y="2" width="40" height="3" fill="#222" />
            {/* Nose and tail */}
            <ellipse cx="5" cy="4.5" rx="3" ry="2.5" fill="#8b4513" />
            <ellipse cx="45" cy="4.5" rx="3" ry="2.5" fill="#8b4513" />
            {/* Trucks */}
            <rect x="10" y="7" width="8" height="2" fill="#777" />
            <rect x="32" y="7" width="8" height="2" fill="#777" />
            {/* Wheels */}
            <circle cx="11" cy="10" r="2" fill="#f0f0e0" />
            <circle cx="17" cy="10" r="2" fill="#f0f0e0" />
            <circle cx="33" cy="10" r="2" fill="#f0f0e0" />
            <circle cx="39" cy="10" r="2" fill="#f0f0e0" />
        </svg>
    );
};
