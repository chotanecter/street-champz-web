import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { MantineProvider, Center, Loader } from "@mantine/core";
import classes from "./app.module.css";
import { Route, Switch } from "wouter";
import { lazy, Suspense, useSyncExternalStore, type ReactNode } from "react";
import { AuthProvider } from "./auth/context";
import { Notifications } from "@mantine/notifications";
import { NotificationsProvider } from "./notifications/context";
import { EconomyProvider } from "./economy/context";
import { RewardsProvider } from "./rewards/context";
import { MissionsProvider } from "./missions/context";
import { AchievementsProvider } from "./achievements/context";
import { TeamsProvider } from "./teams/context";
import { SocialProvider } from "./social/context";
import { ProfileProvider } from "./profile/context";

// Code-split heavy routes
const Main = lazy(() => import("./routes/main/main").then(m => ({ default: m.Main })));
const Game = lazy(() => import("./routes/game/game").then(m => ({ default: m.Game })));
const AdminPortal = lazy(() => import("./routes/admin/admin").then(m => ({ default: m.AdminPortal })));
const ResetPasswordPage = lazy(() => import("./routes/reset-password/reset-password").then(m => ({ default: m.ResetPasswordPage })));
const ThemeTest = lazy(() => import("./routes/main/theme-test").then(m => ({ default: m.ThemeTest })));
const LandingPage = lazy(() => import("./routes/landing/landing").then(m => ({ default: m.LandingPage })));

const PageLoader = () => <Center h="100dvh"><Loader color="blue" /></Center>;

/**
 * Subscribe to browser URL changes (pushState / popstate) so components
 * that depend on the query-string can re-render when it changes.
 * Patches history methods once and dispatches a custom event that listeners pick up.
 */
const URL_CHANGE = "urlchange";
const _origPush = history.pushState;
const _origReplace = history.replaceState;
history.pushState = function (...args) {
    _origPush.apply(this, args);
    window.dispatchEvent(new Event(URL_CHANGE));
};
history.replaceState = function (...args) {
    _origReplace.apply(this, args);
    window.dispatchEvent(new Event(URL_CHANGE));
};

const subscribeToUrl = (cb: () => void) => {
    window.addEventListener(URL_CHANGE, cb);
    window.addEventListener("popstate", cb);
    return () => {
        window.removeEventListener(URL_CHANGE, cb);
        window.removeEventListener("popstate", cb);
    };
};
const getUrl = () => window.location.href;

/** Show landing page when no token (unless user explicitly navigated to sign in) */
function HomeGate({ children }: { children: ReactNode }) {
    // Re-render whenever the URL changes (path OR query string)
    const url = useSyncExternalStore(subscribeToUrl, getUrl);
    const hasToken = localStorage.getItem("token") !== null;
    const wantsAuth = new URL(url).searchParams.has("auth");
    if (!hasToken && !wantsAuth) return <LandingPage />;
    return <>{children}</>;
}

export function App() {
    return (
        <MantineProvider
            theme={{
                colors: {
                    // Enhanced primary blue - more vibrant
                    "blue": [
                        "#E6F4FF",
                        "#CCE9FF",
                        "#99D3FF",
                        "#66BDFF",
                        "#33A7FF",
                        "#0091FF",
                        "#0076CC",
                        "#005C99",
                        "#004166",
                        "#002733"
                    ],

                    // Gold/Yellow for currency and rewards
                    "gold": [
                        "#FFFBEB",
                        "#FEF3C7",
                        "#FDE68A",
                        "#FCD34D",
                        "#FBBF24",
                        "#F59E0B",
                        "#D97706",
                        "#B45309",
                        "#92400E",
                        "#78350F"
                    ],

                    // Green for success, wins, and positive actions
                    "success": [
                        "#ECFDF5",
                        "#D1FAE5",
                        "#A7F3D0",
                        "#6EE7B7",
                        "#34D399",
                        "#10B981",
                        "#059669",
                        "#047857",
                        "#065F46",
                        "#064E3B"
                    ],

                    // Purple/Pink for premium and special features
                    "premium": [
                        "#FAF5FF",
                        "#F3E8FF",
                        "#E9D5FF",
                        "#D8B4FE",
                        "#C084FC",
                        "#A855F7",
                        "#9333EA",
                        "#7E22CE",
                        "#6B21A8",
                        "#581C87"
                    ],

                    // Slate for surfaces (kept from original)
                    "slate": [
                        "#f8fafc",
                        "#f1f5f9",
                        "#e2e8f0",
                        "#cad5e2",
                        "#90a1b9",
                        "#62748e",
                        "#45556c",
                        "#1d293d",
                        "#0f172b",
                        "#020618"
                    ],

                    // Dark for backgrounds (kept from original)
                    "dark": [
                        "#f8fafc",
                        "#90a1b9",
                        "#62748e",
                        "#45556c",
                        "#1d293d",
                        "#0f172b",
                        "#020618",
                        "#020513",
                        "#020514",
                        "#020512"
                    ]
                },

                defaultRadius: "md",
                primaryShade: {
                    dark: 6,
                    light: 6
                },
                primaryColor: "blue"
            }}
            defaultColorScheme="dark"
        >
            <Notifications />

            <Suspense fallback={<PageLoader />}>
                <Switch>
                    {/* Public routes (no auth) */}
                    <Route path="/reset-password">
                        <ResetPasswordPage />
                    </Route>

                    <Route path="/theme-test">
                        <ThemeTest />
                    </Route>

                    <Route path="/landing">
                        <LandingPage />
                    </Route>

                    {/* Everything else stays behind auth (landing shown at / if no token) */}
                    <Route>
                        <HomeGate>
                        <AuthProvider>
                            <NotificationsProvider>
                                <ProfileProvider>
                                    <EconomyProvider>
                                        <RewardsProvider>
                                            <MissionsProvider>
                                                <AchievementsProvider>
                                                    <TeamsProvider>
                                                        <SocialProvider>
                                                            <Switch>
                                                                <Route path="/admin">
                                                                    <AdminPortal />
                                                                </Route>

                                                                <Route path="/game/:id">
                                                                    {params => <div className={classes.root}><Game id={params.id} /></div>}
                                                                </Route>

                                                                <Route path="/" nest>
                                                                    <div className={classes.root}>
                                                                        <Main />
                                                                    </div>
                                                                </Route>
                                                            </Switch>
                                                        </SocialProvider>
                                                    </TeamsProvider>
                                                </AchievementsProvider>
                                            </MissionsProvider>
                                        </RewardsProvider>
                                    </EconomyProvider>
                                </ProfileProvider>
                            </NotificationsProvider>
                        </AuthProvider>
                        </HomeGate>
                    </Route>
                </Switch>
            </Suspense>
        </MantineProvider>
    );
};
