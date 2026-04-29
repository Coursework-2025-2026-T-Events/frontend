import test from "node:test";
import assert from "node:assert/strict";
import { ApiError } from "../src/lib/api/client";
import {
  parseAdminDirectionsResponse,
  parseAdminEventGameResponse,
  parseAdminEventGamesResponse,
  parseAdminEventResponse,
  parseAdminEventSettingsResponse,
  parseAdminEventsResponse,
  parseArchiveEventResponse,
  parseDeleteEventGameResponse,
  parseGameTemplatesResponse,
  parsePublishCheckResponse,
} from "../src/features/admin/adminContracts";

function validAdminEvent() {
  return {
        event_id: 1,
        title: "Event",
        description: "Description",
        start_time: null,
        end_time: null,
        timezone: "Europe/Moscow",
        status: "draft",
        small_reward_percent: null,
        big_reward_percent: null,
        direction_count: 1,
        game_count: 1,
        created_at: "2026-05-12T10:00:00Z",
        updated_at: "2026-05-12T10:00:00Z",
        published_at: null,
        archived_at: null,
        created_by_user_id: 1,
        updated_by_user_id: null,
  };
}

function validAdminEventGame() {
  return {
    event_game_id: 100,
    event_id: 1,
    direction_id: 10,
    direction_name: "Backend",
    game_template_id: 20,
    template_title: "Quiz",
    title: "Quiz",
    description: "Game",
    engine: "quiz",
    config: {
      questions_to_pick: { easy: 1, medium: 1, hard: 1 },
      score_by_level: { easy: 10, medium: 20, hard: 30 },
    },
    max_score: 60,
    steps_total: 3,
    created_at: "2026-05-12T10:00:00Z",
    updated_at: "2026-05-12T10:00:00Z",
  };
}

function validSettingsResponse() {
  return {
    data: {
      event: validAdminEvent(),
      directions: [
        {
          direction_id: 10,
          event_id: 1,
          name: "Backend",
          description: null,
          game_count: 1,
        },
      ],
      games: [validAdminEventGame()],
      readiness: {
        schedule: false,
        rewards: false,
        directions: true,
        games: true,
        publishable: false,
        issues: [{ code: "missing_schedule", message: "Schedule required", section: "details" }],
      },
    },
  };
}

test("parses admin event, direction and game catalog responses", () => {
  assert.equal(parseAdminEventsResponse({ data: [validAdminEvent()] }).data[0]?.title, "Event");
  assert.equal(parseAdminEventResponse({ data: validAdminEvent() }).data.status, "draft");
  assert.equal(
    parseAdminDirectionsResponse({ data: [{ direction_id: 1, name: "Backend", description: null }] }).data[0]?.name,
    "Backend",
  );
  assert.equal(parseAdminEventGamesResponse({ data: [validAdminEventGame()] }).data[0]?.engine, "quiz");
  assert.equal(parseAdminEventGameResponse({ data: validAdminEventGame() }).data.max_score, 60);
  assert.equal(
    parseGameTemplatesResponse({
      data: [
        {
          game_template_id: 1,
          title: "Quiz",
          description: "Template",
          engine: "quiz",
          question_stats: { easy: 1, medium: 2, hard: 3, total: 6 },
          recommended_config: {
            questions_to_pick: { easy: 1, medium: 1, hard: 1 },
            score_by_level: { easy: 10, medium: 20, hard: 30 },
          },
        },
      ],
    }).data[0]?.question_stats.total,
    6,
  );
});

test("parses admin mutation responses", () => {
  assert.equal(parsePublishCheckResponse({ data: { publishable: false, issues: [] } }).data.publishable, false);
  assert.equal(parseArchiveEventResponse({ data: { event_id: 1, status: "archived", archived_at: null } }).data.status, "archived");
  assert.equal(parseDeleteEventGameResponse({ data: { event_game_id: 100, deleted: true } }).data.deleted, true);
});

test("parses valid admin event settings responses", () => {
  const parsed = parseAdminEventSettingsResponse(validSettingsResponse());

  assert.equal(parsed.data.event.status, "draft");
  assert.equal(parsed.data.directions[0]?.name, "Backend");
  assert.equal(parsed.data.games[0]?.config.score_by_level.hard, 30);
  assert.equal(parsed.data.readiness.issues[0]?.section, "details");
});

test("rejects admin event settings contract mismatches", () => {
  const invalidReadiness = validSettingsResponse();
  invalidReadiness.data.readiness.publishable = "yes" as unknown as boolean;

  assert.throws(
    () => parseAdminEventSettingsResponse(invalidReadiness),
    (error) => error instanceof ApiError && error.kind === "contract" && error.code === "contract_mismatch",
  );

  const invalidGameConfig = validSettingsResponse();
  invalidGameConfig.data.games[0]!.config.score_by_level.hard = "30" as unknown as number;

  assert.throws(
    () => parseAdminEventSettingsResponse(invalidGameConfig),
    (error) => error instanceof ApiError && error.kind === "contract" && error.code === "contract_mismatch",
  );
});

test("rejects admin API contract mismatches", () => {
  assert.throws(
    () => parseAdminEventResponse({ data: { ...validAdminEvent(), status: "hidden" } }),
    (error) => error instanceof ApiError && error.kind === "contract" && error.code === "contract_mismatch",
  );

  assert.throws(
    () =>
      parseGameTemplatesResponse({
        data: [{ game_template_id: 1, title: "Quiz", description: "Template", engine: "quiz", question_stats: { easy: 1 } }],
      }),
    (error) => error instanceof ApiError && error.kind === "contract" && error.code === "contract_mismatch",
  );
});
