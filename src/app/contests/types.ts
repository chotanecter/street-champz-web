/**
 * Shared TypeScript types for the S.K.A.T.E. Challenge game mode.
 * See docs/SKATE_CHALLENGE_SPEC.md for the full schema.
 */

export type TrickLetter = "S" | "K" | "A" | "T" | "E";

export type ContestStatus =
  | "draft"
  | "scheduled"
  | "live"
  | "judging"
  | "complete"
  | "archived";

export type SubmissionStatus =
  | "draft"
  | "submitted"
  | "disqualified"
  | "winner";

export interface Skater {
  id: string;
  name: string;
  slug: string;
  bio: string;
  avatarUrl: string;
  socials?: Record<string, string>;
}

export interface Sponsor {
  id: string;
  name: string;
  logoUrl: string;
  website?: string;
  contact?: string;
}

export interface FeaturedTrick {
  letter: TrickLetter;
  trickName: string;
  difficulty?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  notes?: string;
}

export interface Contest {
  id: string;
  title: string;
  slug: string;
  description: string;
  heroImageUrl: string;
  prizeDescription: string;
  sponsor: Sponsor;
  featuredSkater: Skater;
  tricks: FeaturedTrick[]; // ordered [S,K,A,T,E]
  startAt: string;
  submissionsCloseAt: string;
  judgingCloseAt: string;
  status: ContestStatus;
  judges: string[]; // user ids
  winnerCount: number;
  winners: string[]; // submission ids
  createdBy: string;
  createdAt: string;
}

export interface Clip {
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: number;
}

export type ClipMap = Partial<Record<TrickLetter, Clip>>;

export interface Submission {
  id: string;
  contestId: string;
  playerId: string;
  playerName: string;
  playerAvatarUrl?: string;
  clips: ClipMap;
  status: SubmissionStatus;
  submittedAt?: string;
  upvoteCount: number;
  judgeScore: number;
  comment?: string;
}

export interface Scorecard {
  submissionId: string;
  judgeId: string;
  scores: {
    S: number;
    K: number;
    A: number;
    T: number;
    E: number;
    style: number;
  };
  total: number;
  comment?: string;
  submittedAt?: string;
}

export const TRICK_ORDER: TrickLetter[] = ["S", "K", "A", "T", "E"];
