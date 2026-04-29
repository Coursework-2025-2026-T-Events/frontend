import test from "node:test";
import assert from "node:assert/strict";
import {
  DIRECTION_LEADERBOARD_LIMIT,
  formatLeaderboardPoints,
  getLeaderboardInitials,
  getLeaderboardOffset,
  getLeaderboardVisibleRange,
  hasNextLeaderboardPage,
  hasPreviousLeaderboardPage,
} from "../src/features/events/directionProgress";
import type { DirectionLeaderboardDTO } from "../src/lib/api/types";

function leaderboard(overrides: Partial<DirectionLeaderboardDTO>): DirectionLeaderboardDTO {
  return {
    event_id: 1,
    direction_id: 2,
    total_participants: 41,
    limit: DIRECTION_LEADERBOARD_LIMIT,
    offset: 0,
    entries: [],
    me: null,
    ...overrides,
  };
}

test("formats leaderboard points with Russian plural forms", () => {
  assert.equal(formatLeaderboardPoints(1), "1 балл");
  assert.equal(formatLeaderboardPoints(4), "4 балла");
  assert.equal(formatLeaderboardPoints(14), "14 баллов");
  assert.equal(formatLeaderboardPoints(22), "22 балла");
});

test("builds stable participant initials", () => {
  assert.equal(getLeaderboardInitials("Иван Петров"), "ИП");
  assert.equal(getLeaderboardInitials("  Мария   "), "М");
  assert.equal(getLeaderboardInitials(""), "");
});

test("keeps leaderboard pagination scoped to current route", () => {
  assert.equal(getLeaderboardOffset({ eventId: 1, directionId: 2, offset: 20 }, 1, 2), 20);
  assert.equal(getLeaderboardOffset({ eventId: 1, directionId: 3, offset: 20 }, 1, 2), 0);
  assert.equal(hasPreviousLeaderboardPage(20), true);
  assert.equal(hasPreviousLeaderboardPage(0), false);
});

test("calculates leaderboard ranges and next-page availability", () => {
  assert.equal(hasNextLeaderboardPage(leaderboard({ offset: 0 })), true);
  assert.equal(hasNextLeaderboardPage(leaderboard({ offset: 40 })), false);
  assert.equal(hasNextLeaderboardPage(undefined), false);
  assert.deepEqual(getLeaderboardVisibleRange(leaderboard({ offset: 20 })), {
    from: 21,
    to: 40,
    total: 41,
  });
  assert.deepEqual(getLeaderboardVisibleRange(leaderboard({ total_participants: 0 })), {
    from: 0,
    to: 0,
    total: 0,
  });
});
