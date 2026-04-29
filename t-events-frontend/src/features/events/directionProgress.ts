import type { DirectionLeaderboardDTO } from "@/lib/api/types";

export const DIRECTION_LEADERBOARD_LIMIT = 20;

export type DirectionLeaderboardPageState = {
  eventId: number;
  directionId: number;
  offset: number;
};

export function formatLeaderboardPoints(points: number) {
  const absPoints = Math.abs(points);
  const lastTwoDigits = absPoints % 100;
  const lastDigit = absPoints % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return `${points} баллов`;
  if (lastDigit === 1) return `${points} балл`;
  if (lastDigit >= 2 && lastDigit <= 4) return `${points} балла`;
  return `${points} баллов`;
}

export function getLeaderboardInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function getLeaderboardOffset(
  page: DirectionLeaderboardPageState,
  eventId: number,
  directionId: number,
) {
  return page.eventId === eventId && page.directionId === directionId ? page.offset : 0;
}

export function hasPreviousLeaderboardPage(offset: number) {
  return offset > 0;
}

export function hasNextLeaderboardPage(leaderboard: DirectionLeaderboardDTO | undefined) {
  if (!leaderboard) return false;
  return leaderboard.offset + leaderboard.limit < leaderboard.total_participants;
}

export function getLeaderboardVisibleRange(leaderboard: DirectionLeaderboardDTO) {
  if (leaderboard.total_participants === 0) {
    return { from: 0, to: 0, total: 0 };
  }

  return {
    from: leaderboard.offset + 1,
    to: Math.min(leaderboard.offset + leaderboard.limit, leaderboard.total_participants),
    total: leaderboard.total_participants,
  };
}
