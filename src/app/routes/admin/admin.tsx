import { ContestsProvider } from "../../contests";
import { AdminContestsPanel } from "../../contests/components/AdminContestsPanel";
import { useState, useEffect, useCallback, useRef } from "react";
import {
    Paper,
    Title,
    Text,
    Button,
    TextInput,
    Stack,
    Group,
    Table,
    Badge,
    Modal,
    NumberInput,
    Select,
    Grid,
    Loader,
    Alert,
    Center,
    NavLink,
    Textarea,
} from "@mantine/core";
import { useAuth } from "../../auth/context";
import { useLocation } from "wouter";
import classes from "./admin.module.css";

const API = import.meta.env["VITE_API_BASE"] as string;

function useAdminFetch() {
    const auth = useAuth();
    return useCallback((path: string, options?: RequestInit) =>
        fetch(API + path, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + auth.token,
                ...(options?.headers ?? {}),
            },
        }), [auth.token]);
}

// ââ Types ââââââââââââââââââââââââââââââââââââââââââââââââââââââ

interface Stats {
    total_users: number;
    active_games: number;
    total_games_played: number;
    banned_users: number;
    new_users_today: number;
    online_count: number;
}

interface AdminUser {
    id: string;
    username: string;
    email: string;
    role: string;
    points: number;
    coins: number;
    level: number;
    xp: number;
    total_wins: number;
    total_games: number;
    banned: boolean;
    created_at: string;
    country: string | null;
    city: string | null;
}

interface AdminGame {
    id: string;
    leader_id: string | null;
    players: number | null;
    phase: string;
    created_at: string;
    ended_at: string | null;
    source: string;
}

interface ActionEntry {
    admin_username: string | null;
    action: string;
    target: string | null;
    detail: string | null;
    created_at: string;
}

// ââ Stat Card ââââââââââââââââââââââââââââââââââââââââââââââââââ

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <Paper className={classes.statCard} radius="md">
            <div className={classes.statValue} style={{ color }}>{value.toLocaleString()}</div>
            <div className={classes.statLabel}>{label}</div>
        </Paper>
    );
}

// ââ Dashboard ââââââââââââââââââââââââââââââââââââââââââââââââââ

function DashboardPage() {
    const adminFetch = useAdminFetch();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        adminFetch("/admin/stats")
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(data => { setStats(data); setLoading(false); })
            .catch(() => { setError("Failed to load stats"); setLoading(false); });
    }, [adminFetch]);

    if (loading) return <Center mt="xl"><Loader /></Center>;
    if (error) return <Alert color="red">{error}</Alert>;
    if (!stats) return null;

    return (
        <Stack gap="lg">
            <Title order={3}>Dashboard</Title>
            <Grid>
                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                    <StatCard value={stats.total_users} label="Total Users" color="#0091FF" />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                    <StatCard value={stats.active_games} label="Active Games" color="#10B981" />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                    <StatCard value={stats.total_games_played} label="Games Played" color="#34D399" />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                    <StatCard value={stats.banned_users} label="Banned Users" color="#EF4444" />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                    <StatCard value={stats.new_users_today} label="New Today" color="#F59E0B" />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                    <StatCard value={stats.online_count} label="Online Now" color="#A855F7" />
                </Grid.Col>
            </Grid>
        </Stack>
    );
}

// ââ Users Page âââââââââââââââââââââââââââââââââââââââââââââââââ

function UsersPage({ onSelectUser }: { onSelectUser: (id: string) => void }) {
    const adminFetch = useAdminFetch();
    const auth = useAuth();
    const isAdmin = auth.role === "admin";

    const [users, setUsers] = useState<AdminUser[]>([]);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);

    // Points modal
    const [pointsModal, setPointsModal] = useState(false);
    const [pointsUser, setPointsUser] = useState<AdminUser | null>(null);
    const [pointsAmount, setPointsAmount] = useState<number | string>(0);
    const [pointsType, setPointsType] = useState<string>("coins");
    const [pointsReason, setPointsReason] = useState("");
    const [pointsLoading, setPointsLoading] = useState(false);

    // Ban modal
    const [banModal, setBanModal] = useState(false);
    const [banUser, setBanUser] = useState<AdminUser | null>(null);
    const [banReason, setBanReason] = useState("");

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchUsers = useCallback((q: string) => {
        setLoading(true);
        const p = new URLSearchParams({ limit: "50", offset: "0" });
        if (q) p.set("search", q);
        adminFetch(`/admin/users?${p}`)
            .then(r => r.json())
            .then(data => { setUsers(data.users || []); setTotal(data.total || 0); setLoading(false); })
            .catch(() => setLoading(false));
    }, [adminFetch]);

    useEffect(() => { fetchUsers(""); }, [fetchUsers]);

    const handleSearchChange = (val: string) => {
        setSearch(val);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchUsers(val), 300);
    };

    const submitPoints = async () => {
        if (!pointsUser) return;
        setPointsLoading(true);
        await adminFetch(`/admin/users/${pointsUser.id}/points`, {
            method: "POST",
            body: JSON.stringify({ amount: Number(pointsAmount), type: pointsType, reason: pointsReason }),
        });
        setPointsLoading(false);
        setPointsModal(false);
        fetchUsers(search);
    };

    const handleBan = async () => {
        if (!banUser) return;
        await adminFetch(`/admin/users/${banUser.id}/ban`, {
            method: "POST",
            body: JSON.stringify({ reason: banReason || "Admin action" }),
        });
        setBanModal(false);
        fetchUsers(search);
    };

    const handleUnban = async (user: AdminUser) => {
        await adminFetch(`/admin/users/${user.id}/unban`, { method: "POST" });
        fetchUsers(search);
    };

    const handleRoleChange = async (user: AdminUser, role: string) => {
        await adminFetch(`/admin/users/${user.id}/role`, {
            method: "POST",
            body: JSON.stringify({ role }),
        });
        fetchUsers(search);
    };

    return (
        <Stack gap="md">
            <Title order={3}>Users</Title>
            <Group justify="space-between">
                <TextInput
                    placeholder="Search by username..."
                    value={search}
                    onChange={e => handleSearchChange(e.currentTarget.value)}
                    style={{ flex: 1, maxWidth: 360 }}
                />
                <Text size="sm" c="dimmed">{total} users total</Text>
            </Group>

            {loading ? (
                <Center><Loader /></Center>
            ) : (
                <div className={classes.tableWrapper}>
                    <Table striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Username</Table.Th>
                                <Table.Th>Role</Table.Th>
                                <Table.Th>Level</Table.Th>
                                <Table.Th>Coins</Table.Th>
                                <Table.Th>W/G</Table.Th>
                                <Table.Th>Status</Table.Th>
                                <Table.Th>Actions</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {users.map(user => (
                                <Table.Tr key={user.id}>
                                    <Table.Td>
                                        <Button variant="subtle" size="xs" p={0} onClick={() => onSelectUser(user.id)}>
                                            {user.username}
                                        </Button>
                                    </Table.Td>
                                    <Table.Td>
                                        {isAdmin ? (
                                            <Select
                                                size="xs"
                                                value={user.role || "user"}
                                                data={["user", "moderator", "admin"]}
                                                onChange={val => val && handleRoleChange(user, val)}
                                                style={{ width: 120 }}
                                            />
                                        ) : (
                                            <Badge color={user.role === "admin" ? "red" : user.role === "moderator" ? "blue" : "gray"}>
                                                {user.role || "user"}
                                            </Badge>
                                        )}
                                    </Table.Td>
                                    <Table.Td>{user.level ?? 1}</Table.Td>
                                    <Table.Td>{(user.coins ?? user.points ?? 0).toLocaleString()}</Table.Td>
                                    <Table.Td>{user.total_wins ?? 0}/{user.total_games ?? 0}</Table.Td>
                                    <Table.Td>
                                        <Badge color={user.banned ? "red" : "green"}>
                                            {user.banned ? "Banned" : "Active"}
                                        </Badge>
                                    </Table.Td>
                                    <Table.Td>
                                        <Group gap="xs">
                                            {isAdmin && (
                                                <Button size="xs" variant="light" color="blue" onClick={() => {
                                                    setPointsUser(user);
                                                    setPointsAmount(0);
                                                    setPointsType("coins");
                                                    setPointsReason("");
                                                    setPointsModal(true);
                                                }}>
                                                    Points Â±
                                                </Button>
                                            )}
                                            {user.banned ? (
                                                <Button size="xs" variant="light" color="green" onClick={() => handleUnban(user)}>
                                                    Unban
                                                </Button>
                                            ) : (
                                                <Button size="xs" variant="light" color="red" onClick={() => {
                                                    setBanUser(user);
                                                    setBanReason("");
                                                    setBanModal(true);
                                                }}>
                                                    Ban
                                                </Button>
                                            )}
                                        </Group>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </div>
            )}

            <Modal opened={pointsModal} onClose={() => setPointsModal(false)} title={`Add / Deduct Points â ${pointsUser?.username}`}>
                <Stack>
                    <NumberInput label="Amount" value={pointsAmount} onChange={setPointsAmount} allowNegative />
                    <Text size="xs" c="dimmed">Tip: use a negative number to deduct</Text>
                    <Select label="Type" value={pointsType} onChange={val => setPointsType(val || "coins")} data={["coins", "gems"]} />
                    <TextInput label="Reason" value={pointsReason} onChange={e => setPointsReason(e.currentTarget.value)} placeholder="e.g. Bug compensation..." />
                    <Button onClick={submitPoints} loading={pointsLoading} disabled={!pointsReason}>Apply</Button>
                </Stack>
            </Modal>

            <Modal opened={banModal} onClose={() => setBanModal(false)} title={`Ban ${banUser?.username}`}>
                <Stack>
                    <Textarea label="Reason" value={banReason} onChange={e => setBanReason(e.currentTarget.value)} placeholder="Reason for ban..." />
                    <Button color="red" onClick={handleBan} disabled={!banReason}>Confirm Ban</Button>
                </Stack>
            </Modal>
        </Stack>
    );
}

// ââ User Detail Page âââââââââââââââââââââââââââââââââââââââââââ

function UserDetailPage({ userId, onBack }: { userId: string; onBack: () => void }) {
    const adminFetch = useAdminFetch();
    const [user, setUser] = useState<any>(null);
    const [actions, setActions] = useState<any[]>([]);
    const [recentWins, setRecentWins] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminFetch(`/admin/users/${userId}`)
            .then(r => r.json())
            .then(data => {
                setUser(data.user);
                setActions(data.actions || []);
                setRecentWins(data.recentWins || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [adminFetch, userId]);

    if (loading) return <Center mt="xl"><Loader /></Center>;
    if (!user) return <Alert color="red">User not found</Alert>;

    return (
        <Stack gap="md">
            <Button variant="subtle" size="xs" onClick={onBack} style={{ alignSelf: "flex-start" }}>Back to Users</Button>
            <Title order={3}>{user.username}</Title>

            <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Paper className={classes.statCard} radius="md" p="md">
                        <Stack gap="xs">
                            <Text size="sm"><b>ID:</b> {user.id}</Text>
                            <Text size="sm"><b>Email:</b> {user.email}</Text>
                            <Text size="sm"><b>Role:</b> {user.role || "user"}</Text>
                            <Text size="sm"><b>Level:</b> {user.level} (XP: {user.xp})</Text>
                            <Text size="sm"><b>Coins:</b> {(user.coins ?? user.points ?? 0).toLocaleString()}</Text>
                            <Text size="sm"><b>Games:</b> {user.total_games ?? 0} ({user.total_wins ?? 0} wins)</Text>
                            <Text size="sm"><b>Location:</b> {[user.city, user.country].filter(Boolean).join(", ") || "Unknown"}</Text>
                            <Text size="sm"><b>Status:</b> <Badge color={user.banned ? "red" : "green"} size="sm">{user.banned ? "Banned" : "Active"}</Badge></Text>
                            <Text size="sm"><b>Joined:</b> {user.created_at ? new Date(user.created_at).toLocaleString() : "Unknown"}</Text>
                        </Stack>
                    </Paper>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Paper className={classes.statCard} radius="md" p="md">
                        <Text fw={600} mb="xs">Recent Wins</Text>
                        {recentWins.length === 0 ? (
                            <Text size="xs" c="dimmed">No wins yet</Text>
                        ) : (
                            <Stack gap={4}>
                                {recentWins.map((w: any, i: number) => (
                                    <Text key={i} size="xs" c="dimmed">
                                        {w.internal_id?.slice(0, 16)}... - {w.started_at ? new Date(w.started_at).toLocaleString() : "N/A"}
                                    </Text>
                                ))}
                            </Stack>
                        )}
                    </Paper>
                </Grid.Col>
            </Grid>

            {actions.length > 0 && (
                <Paper className={classes.statCard} radius="md" p="md">
                    <Text fw={600} mb="xs">Admin Action History</Text>
                    <Table striped>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Admin</Table.Th>
                                <Table.Th>Action</Table.Th>
                                <Table.Th>Detail</Table.Th>
                                <Table.Th>Time</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {actions.map((a: any, i: number) => (
                                <Table.Tr key={i}>
                                    <Table.Td>{a.admin_username || "System"}</Table.Td>
                                    <Table.Td><Badge size="sm">{a.action}</Badge></Table.Td>
                                    <Table.Td>{a.detail || "-"}</Table.Td>
                                    <Table.Td><Text size="xs" c="dimmed">{a.created_at ? new Date(a.created_at).toLocaleString() : "-"}</Text></Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </Paper>
            )}
        </Stack>
    );
}

// ââ Games Page âââââââââââââââââââââââââââââââââââââââââââââââââ

function GamesPage() {
    const adminFetch = useAdminFetch();
    const [games, setGames] = useState<AdminGame[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Void modal
    const [voidModal, setVoidModal] = useState(false);
    const [voidGameId, setVoidGameId] = useState("");
    const [voidReason, setVoidReason] = useState("");

    useEffect(() => {
        adminFetch("/admin/games?limit=50&offset=0")
            .then(r => r.json())
            .then(data => { setGames(data.games || []); setTotal(data.total || 0); setLoading(false); })
            .catch(() => setLoading(false));
    }, [adminFetch]);

    const handleVoid = async () => {
        await adminFetch(`/admin/games/${voidGameId}/void`, {
            method: "POST",
            body: JSON.stringify({ reason: voidReason }),
        });
        setVoidModal(false);
        // Refresh
        const r = await adminFetch("/admin/games?limit=50&offset=0");
        const data = await r.json();
        setGames(data.games || []);
    };

    const filtered = search
        ? games.filter(g => g.id?.toLowerCase().includes(search.toLowerCase()) || g.phase?.toLowerCase().includes(search.toLowerCase()))
        : games;

    return (
        <Stack gap="md">
            <Title order={3}>Games</Title>
            <Group justify="space-between">
                <TextInput
                    placeholder="Filter by ID or phase..."
                    value={search}
                    onChange={e => setSearch(e.currentTarget.value)}
                    style={{ flex: 1, maxWidth: 360 }}
                />
                <Text size="sm" c="dimmed">{total} total</Text>
            </Group>

            {loading ? (
                <Center><Loader /></Center>
            ) : (
                <div className={classes.tableWrapper}>
                    <Table striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>ID</Table.Th>
                                <Table.Th>Leader</Table.Th>
                                <Table.Th>Players</Table.Th>
                                <Table.Th>Phase</Table.Th>
                                <Table.Th>Date</Table.Th>
                                <Table.Th>Actions</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {filtered.map((game, i) => (
                                <Table.Tr key={i}>
                                    <Table.Td>
                                        <Text size="xs" ff="monospace">{game.id ? game.id.slice(0, 16) + (game.id.length > 16 ? "..." : "") : "-"}</Text>
                                    </Table.Td>
                                    <Table.Td>{game.leader_id?.slice(0, 12) || "-"}</Table.Td>
                                    <Table.Td>{game.players ?? "-"}</Table.Td>
                                    <Table.Td>
                                        <Badge color={game.phase === "OVER" ? "gray" : game.phase === "VOIDED" ? "red" : "green"} size="sm">
                                            {game.phase}
                                        </Badge>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text size="xs" c="dimmed">{game.created_at ? new Date(game.created_at).toLocaleString() : "-"}</Text>
                                    </Table.Td>
                                    <Table.Td>
                                        {game.phase !== "VOIDED" && (
                                            <Button size="xs" variant="light" color="red" onClick={() => {
                                                setVoidGameId(game.id);
                                                setVoidReason("");
                                                setVoidModal(true);
                                            }}>
                                                Void
                                            </Button>
                                        )}
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </div>
            )}

            <Modal opened={voidModal} onClose={() => setVoidModal(false)} title="Void Game">
                <Stack>
                    <Text size="sm">Game: <b>{voidGameId?.slice(0, 20)}...</b></Text>
                    <Textarea label="Reason" value={voidReason} onChange={e => setVoidReason(e.currentTarget.value)} placeholder="Reason for voiding..." />
                    <Button color="red" onClick={handleVoid} disabled={!voidReason}>Confirm Void</Button>
                </Stack>
            </Modal>
        </Stack>
    );
}

// ââ Actions Page âââââââââââââââââââââââââââââââââââââââââââââââ

function ActionsPage() {
    const adminFetch = useAdminFetch();
    const [actions, setActions] = useState<ActionEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminFetch("/admin/actions")
            .then(r => r.json())
            .then(data => { setActions(data.actions || []); setLoading(false); })
            .catch(() => setLoading(false));
    }, [adminFetch]);

    const actionColor = (action: string) => {
        if (action === "ban") return "red";
        if (action === "unban") return "green";
        if (action === "points_adjustment") return "blue";
        if (action === "change_role") return "grape";
        if (action === "void_game") return "orange";
        return "gray";
    };

    return (
        <Stack gap="md">
            <Title order={3}>Action Log</Title>
            {loading ? (
                <Center><Loader /></Center>
            ) : actions.length === 0 ? (
                <Text c="dimmed" ta="center" mt="xl">No actions recorded yet</Text>
            ) : (
                <div className={classes.tableWrapper}>
                    <Table striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Admin</Table.Th>
                                <Table.Th>Action</Table.Th>
                                <Table.Th>Target</Table.Th>
                                <Table.Th>Detail</Table.Th>
                                <Table.Th>Time</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {actions.map((entry, i) => (
                                <Table.Tr key={i}>
                                    <Table.Td>{entry.admin_username || "System"}</Table.Td>
                                    <Table.Td><Badge color={actionColor(entry.action)}>{entry.action}</Badge></Table.Td>
                                    <Table.Td><Text size="xs" ff="monospace">{entry.target || "-"}</Text></Table.Td>
                                    <Table.Td>{entry.detail || "-"}</Table.Td>
                                    <Table.Td>
                                        <Text size="xs" c="dimmed">{entry.created_at ? new Date(entry.created_at).toLocaleString() : "-"}</Text>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </div>
            )}
        </Stack>
    );
}

// ââ Main Admin Portal âââââââââââââââââââââââââââââââââââââââââ

type AdminView = "dashboard" | "users" | "user-detail" | "games" | "actions" | "contests";

export function AdminPortal() {
    const auth = useAuth();
    const [, navigate] = useLocation();
    const [view, setView] = useState<AdminView>("dashboard");
    const [selectedUserId, setSelectedUserId] = useState<string>("");

    useEffect(() => {
        if (auth.role !== undefined && auth.role !== "admin") {
            navigate("/");
        }
    }, [auth.role, navigate]);

    if (auth.role === undefined || auth.role === null) {
        return <Center mt="xl"><Loader /></Center>;
    }

    if (auth.role !== "admin") {
        return null;
    }

    return (
        <div className={classes.root}>
            <div className={classes.sidebar}>
                <Stack gap={0}>
                    <div className={classes.sidebarHeader}>
                        <Text size="lg" fw={700}>Admin</Text>
                        <Text size="xs" c="dimmed">{auth.username} ({auth.role})</Text>
                    </div>
                    <NavLink label="Dashboard" active={view === "dashboard"} onClick={() => setView("dashboard")} />
                    <NavLink label="Users" active={view === "users" || view === "user-detail"} onClick={() => setView("users")} />
                    <NavLink label="Games" active={view === "games"} onClick={() => setView("games")} />
                    <NavLink label="Contests" active={view === "contests"} onClick={() => setView("contests")} />
                        <NavLink label="Action Log" active={view === "actions"} onClick={() => setView("actions")} />
                    <NavLink label="Back to App" onClick={() => navigate("/")} c="dimmed" mt="auto" />
                </Stack>
            </div>
            <div className={classes.mainContent}>
                {view === "dashboard" && <DashboardPage />}
                {view === "users" && <UsersPage onSelectUser={id => { setSelectedUserId(id); setView("user-detail"); }} />}
                {view === "user-detail" && <UserDetailPage userId={selectedUserId} onBack={() => setView("users")} />}
                {view === "games" && <GamesPage />}
                {view === "contests" && (<ContestsProvider><AdminContestsPanel /></ContestsProvider>)}
                {view === "actions" && <ActionsPage />}
            </div>
        </div>
    );
}
