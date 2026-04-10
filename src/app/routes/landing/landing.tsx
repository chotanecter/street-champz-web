import { Button, Center, Loader, Text } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import {
    Swords, Gift, Trophy, Users, Target, Flame,
    Zap, Crown, ChevronRight
} from "lucide-react";
import classes from "./landing.module.css";

type LeaderboardPlayer = {
    username: string;
    points: number;
};

function useInView() {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
            { threshold: 0.15 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    return { ref, visible };
}

function AnimatedSection({ children, className }: { children: React.ReactNode; className?: string }) {
    const { ref, visible } = useInView();
    return (
        <div
            ref={ref}
            className={`${classes.fadeInUp} ${visible ? classes.fadeInUpVisible : ""} ${className ?? ""}`}
        >
            {children}
        </div>
    );
}

const STEPS = [
    { icon: <Swords size={32} />, title: "Challenge", desc: "Pick a trick and challenge any player to a SKATE-style battle" },
    { icon: <Flame size={32} />, title: "Battle", desc: "Take turns landing tricks. Miss one and you earn a letter" },
    { icon: <Trophy size={32} />, title: "Win", desc: "Spell out S-K-A-T-E and you're out. Last one standing wins!" },
];

const FEATURES = [
    { icon: <Zap size={22} />, title: "Real-Time Battles", desc: "Challenge players worldwide in live trick battles" },
    { icon: <Gift size={22} />, title: "Daily Rewards", desc: "Log in daily to earn coins, XP, and exclusive items" },
    { icon: <Target size={22} />, title: "Achievements", desc: "Unlock badges and titles as you master the game" },
    { icon: <Users size={22} />, title: "Teams", desc: "Join or create a crew and compete in team events" },
    { icon: <Crown size={22} />, title: "Leaderboard", desc: "Climb the seasonal rankings and prove you're the best" },
    { icon: <Flame size={22} />, title: "Missions", desc: "Complete daily and weekly challenges for bonus rewards" },
];

export function LandingPage() {
    const [, navigate] = useLocation();
    const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(import.meta.env["VITE_API_BASE"] + "/leaderboard")
            .then(r => r.json())
            .then((data: LeaderboardPlayer[]) => { setLeaderboard(data.slice(0, 10)); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <div className={classes.page}>
            {/* Hero */}
            <section className={classes.hero}>
                <h1 className={classes.heroTitle}>STREET CHAMPZ</h1>
                <p className={classes.heroTagline}>
                    The Ultimate SKATE-Style Trick Battle Game
                </p>
                <div className={classes.heroCta}>
                    <Button
                        size="lg"
                        radius="xl"
                        rightSection={<ChevronRight size={18} />}
                        onClick={() => navigate("/?auth=1")}
                        styles={{ root: { fontWeight: 700, fontSize: "1rem" } }}
                    >
                        Play Now
                    </Button>
                    <Button
                        size="lg"
                        radius="xl"
                        variant="outline"
                        onClick={() => scrollTo("leaderboard-preview")}
                        styles={{ root: { fontWeight: 600 } }}
                    >
                        View Leaderboard
                    </Button>
                </div>
            </section>

            {/* How It Works */}
            <section className={classes.section}>
                <AnimatedSection>
                    <h2 className={classes.sectionTitle}>
                        How It <span className={classes.sectionTitleAccent}>Works</span>
                    </h2>
                </AnimatedSection>
                <div className={classes.stepsGrid}>
                    {STEPS.map((step, i) => (
                        <AnimatedSection key={i}>
                            <div className={classes.stepCard}>
                                <div className={classes.stepNumber}>{i + 1}</div>
                                <div className={classes.stepIcon}>{step.icon}</div>
                                <div className={classes.stepTitle}>{step.title}</div>
                                <div className={classes.stepDesc}>{step.desc}</div>
                            </div>
                        </AnimatedSection>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section className={classes.section}>
                <AnimatedSection>
                    <h2 className={classes.sectionTitle}>
                        Packed With <span className={classes.sectionTitleAccent}>Features</span>
                    </h2>
                </AnimatedSection>
                <div className={classes.featuresGrid}>
                    {FEATURES.map((feat, i) => (
                        <AnimatedSection key={i}>
                            <div className={classes.featureCard}>
                                <div className={classes.featureIcon}>{feat.icon}</div>
                                <div>
                                    <div className={classes.featureTitle}>{feat.title}</div>
                                    <div className={classes.featureDesc}>{feat.desc}</div>
                                </div>
                            </div>
                        </AnimatedSection>
                    ))}
                </div>
            </section>

            {/* Leaderboard Preview */}
            <section className={classes.section} id="leaderboard-preview">
                <AnimatedSection>
                    <h2 className={classes.sectionTitle}>
                        Top <span className={classes.sectionTitleAccent}>Players</span>
                    </h2>
                </AnimatedSection>
                <AnimatedSection>
                    <div className={classes.leaderboardSection}>
                        {loading ? (
                            <Center p="xl"><Loader color="blue" /></Center>
                        ) : leaderboard.length === 0 ? (
                            <Text ta="center" c="dimmed">No leaderboard data yet</Text>
                        ) : (
                            leaderboard.map((player, i) => (
                                <div key={i} className={classes.leaderboardRow}>
                                    <div className={`${classes.leaderboardRank} ${
                                        i === 0 ? classes.rankGold :
                                        i === 1 ? classes.rankSilver :
                                        i === 2 ? classes.rankBronze : ""
                                    }`}>
                                        {i + 1}
                                    </div>
                                    <div className={classes.leaderboardName}>{player.username}</div>
                                    <div className={classes.leaderboardPoints}>
                                        {player.points.toLocaleString()} pts
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </AnimatedSection>
            </section>

            {/* Stats */}
            <AnimatedSection>
                <div className={classes.statsBar}>
                    <div>
                        <div className={classes.statValue}>
                            {leaderboard.length > 0 ? `${leaderboard.length}+` : "28+"}
                        </div>
                        <div className={classes.statLabel}>Active Players</div>
                    </div>
                    <div>
                        <div className={classes.statValue}>24/7</div>
                        <div className={classes.statLabel}>Live Battles</div>
                    </div>
                    <div>
                        <div className={classes.statValue}>Free</div>
                        <div className={classes.statLabel}>To Play</div>
                    </div>
                </div>
            </AnimatedSection>

            {/* CTA */}
            <section className={classes.ctaSection} id="signup-section">
                <AnimatedSection>
                    <h2 className={classes.ctaTitle}>Ready to Play?</h2>
                    <p className={classes.ctaSubtitle}>
                        Sign up in seconds and start battling today.
                    </p>
                    <Button
                        size="lg"
                        radius="xl"
                        rightSection={<ChevronRight size={18} />}
                        onClick={() => navigate("/?auth=1")}
                        styles={{ root: { fontWeight: 700, fontSize: "1rem" } }}
                    >
                        Sign Up Now
                    </Button>
                </AnimatedSection>
            </section>

            {/* Footer */}
            <footer className={classes.footer}>
                <div className={classes.footerLinks}>
                    <a href="#" className={classes.footerLink}>Terms</a>
                    <a href="#" className={classes.footerLink}>Privacy</a>
                    <a href="#" className={classes.footerLink}>Contact</a>
                </div>
                <div>&copy; 2026 Street Champz. All rights reserved.</div>
            </footer>
        </div>
    );
}
