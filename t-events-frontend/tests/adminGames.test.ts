import test from "node:test";
import assert from "node:assert/strict";
import { groupGamesByDirection } from "../src/features/admin/games";
import type { AdminEventDirectionDTO, AdminEventGameDTO } from "../src/lib/api/types";

const directions: AdminEventDirectionDTO[] = [
  { direction_id: 1, event_id: 10, name: "Backend" },
  { direction_id: 2, event_id: 10, name: "Frontend" },
];

const games: AdminEventGameDTO[] = [
  {
    event_game_id: 101,
    event_id: 10,
    direction_id: 1,
    direction_name: "Backend",
    game_template_id: 5,
    template_title: "Quiz",
    title: "Backend quiz",
    engine: "quiz",
    config: {
      questions_to_pick: { easy: 1, medium: 1, hard: 0 },
      score_by_level: { easy: 1, medium: 2, hard: 3 },
    },
    max_score: 3,
    steps_total: 2,
  },
  {
    event_game_id: 102,
    event_id: 10,
    direction_id: 99,
    direction_name: "Detached",
    game_template_id: 6,
    template_title: "QA",
    title: "Detached game",
    engine: "question_answer",
    config: {
      questions_to_pick: { easy: 1, medium: 0, hard: 0 },
      score_by_level: { easy: 1, medium: 2, hard: 3 },
    },
    max_score: 1,
    steps_total: 1,
  },
];

test("groups admin event games by attached direction and keeps detached games separately", () => {
  const result = groupGamesByDirection(directions, games);

  assert.equal(result.gamesByDirection[0]?.games[0]?.event_game_id, 101);
  assert.equal(result.gamesByDirection[1]?.games.length, 0);
  assert.equal(result.gamesWithoutDirection[0]?.event_game_id, 102);
});
