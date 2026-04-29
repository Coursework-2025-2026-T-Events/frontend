import test from "node:test";
import assert from "node:assert/strict";
import { ApiError } from "../src/lib/api/client";
import {
  parseDirectionGamesResponse,
  parseDirectionLeaderboardResponse,
  parseDirectionResponse,
  parseDirectionsResponse,
  parseEventResponse,
  parseEventsResponse,
  parseSessionStateResponse,
  parseStartOrResumeSessionResponse,
  parseSubmitAnswerResponse,
} from "../src/features/events/eventContracts";

const progress = {
  current_score: 10,
  max_score: 30,
  answered_questions: 1,
  total_questions: 3,
  current_question_index: 1,
};

const navigation = [
  {
    question_index: 1,
    question_id: 100,
    answered: false,
    is_current: true,
  },
];

const quizQuestion = {
  question_id: 100,
  engine: "quiz",
  prompt: "Question",
  difficulty: "easy",
  score: 10,
  options: [{ option_id: 1, text: "Answer" }],
  answered: false,
};

const textQuestion = {
  question_id: 101,
  engine: "question_answer",
  prompt: "Question",
  difficulty: "medium",
  score: 20,
  answered: true,
  is_correct: true,
  text_answer: "Answer",
};

function sessionStateResponse() {
  return {
    data: {
      session_id: 5,
      status: "active",
      progress,
      navigation,
      questions: [quizQuestion, textQuestion],
      current_question: quizQuestion,
    },
  };
}

test("parses game session API responses", () => {
  const started = parseStartOrResumeSessionResponse({
    data: {
      ...sessionStateResponse().data,
      game: {
        event_game_id: 7,
        game_template_id: 8,
        title: "Quiz",
        engine: "quiz",
      },
    },
  });
  const state = parseSessionStateResponse(sessionStateResponse());
  const submitted = parseSubmitAnswerResponse({
    data: {
      session_id: 5,
      status: "active",
      answer_result: {
        question_id: 100,
        is_correct: true,
        earned_score: 10,
      },
      progress,
      direction_summary: {
        current_direction_score: 10,
        direction_max_score: 30,
        small_reward_threshold: 30,
        big_reward_threshold: 70,
        small_reward_unlocked: false,
        big_reward_unlocked: false,
      },
      next_question: textQuestion,
      navigation,
      questions: [quizQuestion, textQuestion],
    },
  });

  assert.equal(started.data.game.engine, "quiz");
  assert.equal(state.data.current_question?.engine, "quiz");
  assert.equal(submitted.data.answer_result.earned_score, 10);
});

test("parses participant event listing and progress responses", () => {
  const event = {
    event_id: 1,
    title: "Event",
    description: "Description",
    start_time: null,
    end_time: "2026-05-12T12:00:00Z",
    status: "active",
  };
  const direction = {
    direction_id: 2,
    event_id: 1,
    name: "Direction",
    description: null,
    game_count: 1,
  };

  assert.equal(parseEventsResponse({ data: [event] }).data[0]?.status, "active");
  assert.equal(parseEventResponse({ data: event }).data.title, "Event");
  assert.equal(parseDirectionsResponse({ data: [direction] }).data[0]?.name, "Direction");
  assert.equal(parseDirectionResponse({ data: direction }).data.direction_id, 2);
  assert.equal(
    parseDirectionGamesResponse({
      data: {
        direction: { direction_id: 2, name: "Direction" },
        summary: {
          current_direction_score: 10,
          direction_max_score: 30,
          small_reward_threshold: 30,
          big_reward_threshold: 70,
          small_reward_unlocked: false,
          big_reward_unlocked: false,
        },
        games: [
          {
            event_game_id: 3,
            game_template_id: 4,
            title: "Quiz",
            description: "Description",
            engine: "quiz",
            status: "in_progress",
            max_score: 30,
            steps_total: 3,
            progress,
          },
        ],
      },
    }).data.games[0]?.status,
    "in_progress",
  );
  assert.equal(
    parseDirectionLeaderboardResponse({
      data: {
        event_id: 1,
        direction_id: 2,
        total_participants: 1,
        limit: 20,
        offset: 0,
        entries: [{ rank: 1, user_id: 3, full_name: "User", direction_score: 10 }],
        me: { rank: 1, user_id: 3, full_name: "User", direction_score: 10, in_page: true },
      },
    }).data.me?.in_page,
    true,
  );
});

test("rejects game session contract mismatches", () => {
  const invalidProgress = sessionStateResponse();
  invalidProgress.data.progress.current_score = "10" as unknown as number;

  assert.throws(
    () => parseSessionStateResponse(invalidProgress),
    (error) => error instanceof ApiError && error.kind === "contract" && error.code === "contract_mismatch",
  );

  const invalidQuestion = sessionStateResponse();
  invalidQuestion.data.current_question = { ...quizQuestion, engine: "unknown" } as unknown as typeof quizQuestion;

  assert.throws(
    () => parseSessionStateResponse(invalidQuestion),
    (error) => error instanceof ApiError && error.kind === "contract" && error.code === "contract_mismatch",
  );
});

test("rejects participant event contract mismatches", () => {
  assert.throws(
    () =>
      parseEventsResponse({
        data: [{ event_id: 1, title: "Event", description: "", start_time: null, end_time: null, status: "hidden" }],
      }),
    (error) => error instanceof ApiError && error.kind === "contract" && error.code === "contract_mismatch",
  );

  assert.throws(
    () =>
      parseDirectionLeaderboardResponse({
        data: {
          event_id: 1,
          direction_id: 2,
          total_participants: "1",
          limit: 20,
          offset: 0,
          entries: [],
          me: null,
        },
      }),
    (error) => error instanceof ApiError && error.kind === "contract" && error.code === "contract_mismatch",
  );
});
