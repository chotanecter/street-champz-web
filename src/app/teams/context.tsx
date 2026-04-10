import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useAuth } from "../auth/context";
import { notifications } from "@mantine/notifications";

// TODO: Migrate to backend for production.
// For demo purposes, teams are managed client-side using localStorage.
// In a real production environment, this state would be managed on the server.

export interface Team {
  id: string;
  name: string;
  logo: string; // emoji
  description: string;
  leaderId: string;
  memberIds: string[];
  createdAt: string;
  stats: {
    totalGames: number;
    totalWins: number;
    totalCoins: number;
  };
}

export interface TeamMember {
  id: string;
  username: string;
  level: number;
  role: "leader" | "member";
  joinedAt: string;
}

interface TeamsContextValue {
  currentTeam: Team | null;
  teams: Team[];
  createTeam: (name: string, logo: string, description: string) => void;
  joinTeam: (teamId: string) => void;
  leaveTeam: () => void;
  getTeamMembers: (teamId: string) => TeamMember[];
  isInTeam: boolean;
}

const TeamsContext = createContext<TeamsContextValue | undefined>(undefined);

const STORAGE_KEY = "street-champz-teams";
const USER_TEAM_KEY = "street-champz-user-team";

// Sample teams for demo
const INITIAL_TEAMS: Team[] = [
  {
    id: "team-1",
    name: "Skate Kings",
    logo: "👑",
    description: "The best skaters in the game",
    leaderId: "demo-user-1",
    memberIds: ["demo-user-1", "demo-user-2", "demo-user-3"],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    stats: {
      totalGames: 150,
      totalWins: 89,
      totalCoins: 15000,
    },
  },
  {
    id: "team-2",
    name: "Street Legends",
    logo: "⚡",
    description: "Lightning fast tricks and wins",
    leaderId: "demo-user-4",
    memberIds: ["demo-user-4", "demo-user-5"],
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    stats: {
      totalGames: 87,
      totalWins: 52,
      totalCoins: 8900,
    },
  },
  {
    id: "team-3",
    name: "Trick Masters",
    logo: "🔥",
    description: "Masters of style and technique",
    leaderId: "demo-user-6",
    memberIds: ["demo-user-6"],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    stats: {
      totalGames: 45,
      totalWins: 30,
      totalCoins: 5200,
    },
  },
];

export function TeamsProvider({ children }: { children: ReactNode }) {
  const { id: userId, username } = useAuth();
  
  const [teams, setTeams] = useState<Team[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return INITIAL_TEAMS;
      }
    }
    return INITIAL_TEAMS;
  });

  const [userTeamId, setUserTeamId] = useState<string | null>(() => {
    return localStorage.getItem(USER_TEAM_KEY);
  });

  // Persist teams to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
  }, [teams]);

  // Persist user team to localStorage
  useEffect(() => {
    if (userTeamId) {
      localStorage.setItem(USER_TEAM_KEY, userTeamId);
    } else {
      localStorage.removeItem(USER_TEAM_KEY);
    }
  }, [userTeamId]);

  const currentTeam = teams.find((t) => t.id === userTeamId) || null;
  const isInTeam = currentTeam !== null;

  const createTeam = (name: string, logo: string, description: string) => {
    if (isInTeam) {
      notifications.show({
        title: "Already in a team",
        message: "You must leave your current team first",
        color: "red",
      });
      return;
    }

    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name,
      logo,
      description,
      leaderId: userId!,
      memberIds: [userId!],
      createdAt: new Date().toISOString(),
      stats: {
        totalGames: 0,
        totalWins: 0,
        totalCoins: 0,
      },
    };

    setTeams((prev) => [...prev, newTeam]);
    setUserTeamId(newTeam.id);

    notifications.show({
      title: "Team Created! 🎉",
      message: `${name} is ready to dominate!`,
      color: "success",
    });
  };

  const joinTeam = (teamId: string) => {
    if (isInTeam) {
      notifications.show({
        title: "Already in a team",
        message: "You must leave your current team first",
        color: "red",
      });
      return;
    }

    const team = teams.find((t) => t.id === teamId);
    if (!team) {
      notifications.show({
        title: "Team not found",
        message: "This team doesn't exist",
        color: "red",
      });
      return;
    }

    // Add user to team
    setTeams((prev) =>
      prev.map((t) =>
        t.id === teamId
          ? { ...t, memberIds: [...t.memberIds, userId!] }
          : t
      )
    );
    setUserTeamId(teamId);

    notifications.show({
      title: "Joined Team! 🎉",
      message: `Welcome to ${team.name}!`,
      color: "success",
    });
  };

  const leaveTeam = () => {
    if (!currentTeam) return;

    // Remove user from team
    setTeams((prev) =>
      prev.map((t) =>
        t.id === currentTeam.id
          ? { ...t, memberIds: t.memberIds.filter((id) => id !== userId) }
          : t
      )
    );
    setUserTeamId(null);

    notifications.show({
      title: "Left Team",
      message: `You left ${currentTeam.name}`,
      color: "gray",
    });
  };

  const getTeamMembers = (teamId: string): TeamMember[] => {
    const team = teams.find((t) => t.id === teamId);
    if (!team) return [];

    // For demo, generate mock members
    return team.memberIds.map((memberId, index) => ({
      id: memberId,
      username: memberId === userId ? username! : `Player${index + 1}`,
      level: Math.floor(Math.random() * 20) + 1,
      role: memberId === team.leaderId ? "leader" : "member",
      joinedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    }));
  };

  return (
    <TeamsContext.Provider
      value={{
        currentTeam,
        teams,
        createTeam,
        joinTeam,
        leaveTeam,
        getTeamMembers,
        isInTeam,
      }}
    >
      {children}
    </TeamsContext.Provider>
  );
}

export function useTeams() {
  const context = useContext(TeamsContext);
  if (!context) {
    throw new Error("useTeams must be used within TeamsProvider");
  }
  return context;
}

