import test from "node:test";
import assert from "node:assert/strict";
import {
  formatDirectionGamePoints,
  getDirectionGameLaunchLabel,
  getDirectionGameProgress,
  getDirectionGameStatusLabel,
  getDirectionProgressPct,
  getRewardAvailabilityText,
  getRewardButtonLabel,
  getRewardProgressText,
  getRewardThresholdPct,
} from "../src/features/events/directionGames";
import type { DirectionGamesItemDTO, DirectionProgressSummaryDTO } from "../src/lib/api/types";

function game(overrides: Partial<DirectionGamesItemDTO>): DirectionGamesItemDTO {
  return {
    event_game_id: 1,
    game_template_id: 1,
    title: "Quiz",
    description: "",
    engine: "quiz",
    status: "not_started",
    max_score: 100,
    steps_total: 10,
    progress: {
      current_score: 0,
      max_score: 100,
      answered_questions: 0,
      total_questions: 10,
      current_question_index: 1,
    },
    ...overrides,
  };
}

function summary(overrides: Partial<DirectionProgressSummaryDTO>): DirectionProgressSummaryDTO {
  return {
    current_direction_score: 0,
    direction_max_score: 100,
    small_reward_threshold: 30,
    big_reward_threshold: 80,
    small_reward_unlocked: false,
    big_reward_unlocked: false,
    ...overrides,
  };
}

test("formats direction game status and launch labels", () => {
  assert.equal(getDirectionGameStatusLabel("not_started"), "Не начата");
  assert.equal(getDirectionGameStatusLabel("in_progress"), "В процессе");
  assert.equal(getDirectionGameStatusLabel("completed"), "Завершена");
  assert.equal(getDirectionGameLaunchLabel("not_started"), "Начать");
  assert.equal(getDirectionGameLaunchLabel("in_progress"), "Продолжить");
  assert.equal(getDirectionGameLaunchLabel("completed"), "Посмотреть результат");
});

test("calculates progress with safe bounds", () => {
  assert.equal(getDirectionGameProgress(game({ progress: { ...game({}).progress, answered_questions: 5 } })), 50);
  assert.equal(getDirectionGameProgress(game({ steps_total: 0, progress: { ...game({}).progress, total_questions: 0 } })), 0);
  assert.equal(getDirectionProgressPct(summary({ current_direction_score: 150 })), 100);
  assert.equal(getRewardThresholdPct(summary({}), 0), 4);
  assert.equal(getRewardThresholdPct(summary({}), 100), 96);
});

test("formats points with Russian plural forms", () => {
  assert.equal(formatDirectionGamePoints(1), "1 балл");
  assert.equal(formatDirectionGamePoints(3), "3 балла");
  assert.equal(formatDirectionGamePoints(12), "12 баллов");
  assert.equal(formatDirectionGamePoints(25), "25 баллов");
});

test("builds reward progress and action copy", () => {
  assert.equal(getRewardProgressText(summary({ current_direction_score: 10 })), "До малого приза: 20 баллов");
  assert.equal(
    getRewardProgressText(summary({ current_direction_score: 45, small_reward_unlocked: true })),
    "Малый приз доступен · до большого: 35 баллов",
  );
  assert.equal(getRewardProgressText(summary({ big_reward_unlocked: true })), "Большой приз доступен");
  assert.equal(getRewardButtonLabel(summary({ small_reward_unlocked: true })), "Получить малый приз");
  assert.equal(getRewardButtonLabel(summary({ big_reward_unlocked: true })), "Получить большой приз");
  assert.equal(getRewardAvailabilityText(undefined), "Проверьте доступ");
}
);
