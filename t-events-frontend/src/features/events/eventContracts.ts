import { z } from "zod";
import { ApiError } from "@/lib/api/client";
import type {
  DirectionGamesResponse,
  DirectionLeaderboardResponse,
  DirectionResponse,
  DirectionsResponse,
  EventResponse,
  EventsResponse,
  SessionStateResponse,
  StartOrResumeSessionResponse,
  SubmitAnswerResponse,
} from "@/lib/api/types";

const difficultySchema = z.enum(["easy", "medium", "hard"]);
const sessionStatusSchema = z.enum(["active", "paused", "finished", "expired"]);
const eventStatusSchema = z.enum(["draft", "published", "active", "finished", "archived"]);
const gameStatusSchema = z.enum(["not_started", "in_progress", "completed"]);
const gameEngineSchema = z.enum(["question_answer", "quiz"]);

const eventSchema = z
  .object({
    event_id: z.number(),
    title: z.string(),
    description: z.string(),
    start_time: z.string().nullable(),
    end_time: z.string().nullable(),
    status: eventStatusSchema,
  })
  .strict();

const directionSchema = z
  .object({
    direction_id: z.number(),
    name: z.string(),
    description: z.string().nullable().optional(),
    event_id: z.number().optional(),
    game_count: z.number().optional(),
  })
  .strict();

const progressSchema = z
  .object({
    current_score: z.number(),
    max_score: z.number(),
    answered_questions: z.number(),
    total_questions: z.number(),
    current_question_index: z.number(),
  })
  .strict();

const navigationItemSchema = z
  .object({
    question_index: z.number(),
    question_id: z.number(),
    answered: z.boolean(),
    is_current: z.boolean(),
  })
  .strict();

const questionAnswerQuestionSchema = z
  .object({
    question_id: z.number(),
    engine: z.literal("question_answer"),
    prompt: z.string(),
    difficulty: difficultySchema,
    score: z.number(),
    answered: z.boolean(),
    is_correct: z.boolean().optional(),
    text_answer: z.string().optional(),
  })
  .strict();

const quizQuestionSchema = z
  .object({
    question_id: z.number(),
    engine: z.literal("quiz"),
    prompt: z.string(),
    difficulty: difficultySchema,
    score: z.number(),
    options: z.array(
      z
        .object({
          option_id: z.number(),
          text: z.string(),
        })
        .strict(),
    ),
    answered: z.boolean(),
    is_correct: z.boolean().optional(),
    selected_option_id: z.number().optional(),
  })
  .strict();

const currentQuestionSchema = z.discriminatedUnion("engine", [questionAnswerQuestionSchema, quizQuestionSchema]);

const sessionStateDataSchema = z
  .object({
    session_id: z.number(),
    status: sessionStatusSchema,
    progress: progressSchema,
    navigation: z.array(navigationItemSchema),
    questions: z.array(currentQuestionSchema).optional(),
    current_question: currentQuestionSchema.nullable(),
  })
  .strict();

const startOrResumeSessionDataSchema = sessionStateDataSchema
  .extend({
    game: z
      .object({
        event_game_id: z.number(),
        game_template_id: z.number(),
        title: z.string(),
        engine: z.enum(["question_answer", "quiz"]),
      })
      .strict(),
  })
  .strict();

const directionProgressSummarySchema = z
  .object({
    current_direction_score: z.number(),
    direction_max_score: z.number(),
    small_reward_threshold: z.number(),
    big_reward_threshold: z.number(),
    small_reward_unlocked: z.boolean(),
    big_reward_unlocked: z.boolean(),
  })
  .strict();

const directionGamesItemSchema = z
  .object({
    event_game_id: z.number(),
    game_template_id: z.number(),
    title: z.string(),
    description: z.string(),
    engine: gameEngineSchema,
    status: gameStatusSchema,
    max_score: z.number(),
    steps_total: z.number(),
    progress: progressSchema,
  })
  .strict();

const directionGamesSchema = z
  .object({
    direction: z
      .object({
        direction_id: z.number(),
        name: z.string(),
      })
      .strict(),
    summary: directionProgressSummarySchema,
    games: z.array(directionGamesItemSchema),
  })
  .strict();

const leaderboardEntrySchema = z
  .object({
    rank: z.number(),
    user_id: z.number(),
    full_name: z.string(),
    direction_score: z.number(),
  })
  .strict();

const leaderboardMeSchema = leaderboardEntrySchema
  .extend({
    in_page: z.boolean(),
  })
  .strict();

const directionLeaderboardSchema = z
  .object({
    event_id: z.number(),
    direction_id: z.number(),
    total_participants: z.number(),
    limit: z.number(),
    offset: z.number(),
    entries: z.array(leaderboardEntrySchema),
    me: leaderboardMeSchema.nullable(),
  })
  .strict();

const submitAnswerDataSchema = z
  .object({
    session_id: z.number(),
    status: sessionStatusSchema,
    answer_result: z
      .object({
        question_id: z.number(),
        is_correct: z.boolean(),
        earned_score: z.number(),
      })
      .strict(),
    progress: progressSchema,
    direction_summary: directionProgressSummarySchema,
    next_question: currentQuestionSchema.nullable(),
    navigation: z.array(navigationItemSchema),
    questions: z.array(currentQuestionSchema).optional(),
  })
  .strict();

function responseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({ data: dataSchema }).strict();
}

function toContractMismatch(error: unknown): ApiError {
  return new ApiError("Game session response does not match the expected contract", 200, "contract_mismatch", error, "contract");
}

export function parseStartOrResumeSessionResponse(value: unknown): StartOrResumeSessionResponse {
  const result = responseSchema(startOrResumeSessionDataSchema).safeParse(value);
  if (!result.success) throw toContractMismatch(result.error);
  return result.data as StartOrResumeSessionResponse;
}

export function parseEventsResponse(value: unknown): EventsResponse {
  const result = responseSchema(z.array(eventSchema)).safeParse(value);
  if (!result.success) throw toContractMismatch(result.error);
  return result.data as EventsResponse;
}

export function parseEventResponse(value: unknown): EventResponse {
  const result = responseSchema(eventSchema).safeParse(value);
  if (!result.success) throw toContractMismatch(result.error);
  return result.data as EventResponse;
}

export function parseDirectionsResponse(value: unknown): DirectionsResponse {
  const result = responseSchema(z.array(directionSchema)).safeParse(value);
  if (!result.success) throw toContractMismatch(result.error);
  return result.data as DirectionsResponse;
}

export function parseDirectionResponse(value: unknown): DirectionResponse {
  const result = responseSchema(directionSchema).safeParse(value);
  if (!result.success) throw toContractMismatch(result.error);
  return result.data as DirectionResponse;
}

export function parseDirectionGamesResponse(value: unknown): DirectionGamesResponse {
  const result = responseSchema(directionGamesSchema).safeParse(value);
  if (!result.success) throw toContractMismatch(result.error);
  return result.data as DirectionGamesResponse;
}

export function parseDirectionLeaderboardResponse(value: unknown): DirectionLeaderboardResponse {
  const result = responseSchema(directionLeaderboardSchema).safeParse(value);
  if (!result.success) throw toContractMismatch(result.error);
  return result.data as DirectionLeaderboardResponse;
}

export function parseSessionStateResponse(value: unknown): SessionStateResponse {
  const result = responseSchema(sessionStateDataSchema).safeParse(value);
  if (!result.success) throw toContractMismatch(result.error);
  return result.data as SessionStateResponse;
}

export function parseSubmitAnswerResponse(value: unknown): SubmitAnswerResponse {
  const result = responseSchema(submitAnswerDataSchema).safeParse(value);
  if (!result.success) throw toContractMismatch(result.error);
  return result.data as SubmitAnswerResponse;
}
