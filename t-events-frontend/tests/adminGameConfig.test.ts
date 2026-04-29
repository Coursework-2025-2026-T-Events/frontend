import test from "node:test";
import assert from "node:assert/strict";
import { getTemplateDefaultConfigForm, validateConfigForm } from "../src/features/admin/gameConfig";
import type { GameTemplateDTO } from "../src/lib/api/types";

const baseTemplate: GameTemplateDTO = {
  game_template_id: 1,
  title: "Template",
  description: "Template description",
  engine: "quiz",
  question_stats: {
    easy: 2,
    medium: 0,
    hard: 1,
    total: 3,
  },
};

test("builds default admin game config from question stats", () => {
  assert.deepEqual(getTemplateDefaultConfigForm(baseTemplate), {
    easy_pick: "1",
    medium_pick: "0",
    hard_pick: "1",
    easy_score: "1",
    medium_score: "2",
    hard_score: "3",
  });
});

test("uses recommended admin game config when template provides it", () => {
  assert.deepEqual(
    getTemplateDefaultConfigForm({
      ...baseTemplate,
      recommended_config: {
        questions_to_pick: { easy: 2, medium: 0, hard: 1 },
        score_by_level: { easy: 3, medium: 4, hard: 5 },
      },
    }),
    {
      easy_pick: "2",
      medium_pick: "0",
      hard_pick: "1",
      easy_score: "3",
      medium_score: "4",
      hard_score: "5",
    },
  );
});

test("validates admin game config against available questions", () => {
  assert.equal(
    validateConfigForm(
      {
        easy_pick: "3",
        medium_pick: "0",
        hard_pick: "0",
        easy_score: "1",
        medium_score: "2",
        hard_score: "3",
      },
      baseTemplate.question_stats,
    ),
    "В шаблоне доступно вопросов (легкий): 2. Уменьшите количество вопросов.",
  );
});

test("validates required numeric admin game config fields", () => {
  assert.equal(
    validateConfigForm({
      easy_pick: "",
      medium_pick: "0",
      hard_pick: "0",
      easy_score: "1",
      medium_score: "2",
      hard_score: "3",
    }),
    "Количество вопросов (легкий) обязательно.",
  );
});
