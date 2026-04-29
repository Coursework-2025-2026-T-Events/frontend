import { z } from "zod";
import { ApiError } from "@/lib/api/client";
import type {
  AddDirectionResponse,
  AdminDirectionsResponse,
  AdminEventGameResponse,
  AdminEventGamesResponse,
  AdminEventResponse,
  AdminEventSettingsResponse,
  AdminEventsResponse,
  ArchiveEventResponse,
  DeleteEventGameResponse,
  GameTemplatesResponse,
  PublishCheckResponse,
  RemoveDirectionResponse,
} from "@/lib/api/types";

const eventStatusSchema = z.enum(["draft", "published", "active", "finished", "archived"]);
const difficultySchema = z.enum(["easy", "medium", "hard"]);
const gameEngineSchema = z.enum(["question_answer", "quiz"]);
const publishIssueSectionSchema = z.enum(["details", "directions", "games", "publish"]);

const adminEventSchema = z
  .object({
    event_id: z.number(),
    title: z.string(),
    description: z.string(),
    start_time: z.string().nullable(),
    end_time: z.string().nullable(),
    timezone: z.string().nullable(),
    status: eventStatusSchema,
    small_reward_percent: z.number().nullable(),
    big_reward_percent: z.number().nullable(),
    direction_count: z.number(),
    game_count: z.number(),
    created_at: z.string(),
    updated_at: z.string(),
    published_at: z.string().nullable(),
    archived_at: z.string().nullable(),
    created_by_user_id: z.number().nullable(),
    updated_by_user_id: z.number().nullable(),
  })
  .strict();

const adminEventDirectionSchema = z
  .object({
    direction_id: z.number(),
    name: z.string(),
    description: z.string().nullable().optional(),
    event_id: z.number(),
    game_count: z.number().optional(),
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

const eventGameConfigSchema = z
  .object({
    questions_to_pick: z.record(difficultySchema, z.number()),
    score_by_level: z.record(difficultySchema, z.number()),
  })
  .strict();

const adminEventGameSchema = z
  .object({
    event_game_id: z.number(),
    event_id: z.number(),
    direction_id: z.number(),
    direction_name: z.string(),
    game_template_id: z.number(),
    template_title: z.string(),
    title: z.string(),
    description: z.string().optional(),
    engine: gameEngineSchema,
    config: eventGameConfigSchema,
    max_score: z.number(),
    steps_total: z.number(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
  })
  .strict();

const publishReadinessIssueSchema = z
  .object({
    code: z.string(),
    message: z.string(),
    section: publishIssueSectionSchema,
    field: z.string().optional(),
  })
  .strict();

const publishCheckSchema = z
  .object({
    publishable: z.boolean(),
    issues: z.array(publishReadinessIssueSchema),
  })
  .strict();

const archiveEventSchema = z
  .object({
    event_id: z.number(),
    status: z.literal("archived"),
    archived_at: z.string().nullable(),
  })
  .strict();

const eventDirectionLinkSchema = z
  .object({
    event_id: z.number(),
    direction_id: z.number(),
  })
  .strict();

const templateQuestionStatsSchema = z
  .object({
    easy: z.number(),
    medium: z.number(),
    hard: z.number(),
    total: z.number(),
  })
  .strict();

const gameTemplateSchema = z
  .object({
    game_template_id: z.number(),
    title: z.string(),
    description: z.string(),
    engine: gameEngineSchema,
    question_stats: templateQuestionStatsSchema,
    recommended_config: eventGameConfigSchema.optional(),
  })
  .strict();

const deleteEventGameSchema = z
  .object({
    event_game_id: z.number(),
    deleted: z.literal(true),
  })
  .strict();

const adminEventSettingsResponseSchema = z
  .object({
    data: z
      .object({
        event: adminEventSchema,
        directions: z.array(adminEventDirectionSchema),
        games: z.array(adminEventGameSchema),
        readiness: z
          .object({
            schedule: z.boolean(),
            rewards: z.boolean(),
            directions: z.boolean(),
            games: z.boolean(),
            publishable: z.boolean(),
            issues: z.array(publishReadinessIssueSchema),
          })
          .strict(),
      })
      .strict(),
  })
  .strict();

function toContractMismatch(error: unknown): ApiError {
  return new ApiError(
    "Admin event settings response does not match the expected contract",
    200,
    "contract_mismatch",
    error,
    "contract",
  );
}

function responseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({ data: dataSchema }).strict();
}

function parseResponse<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) throw toContractMismatch(result.error);
  return result.data;
}

export function parseAdminEventsResponse(value: unknown): AdminEventsResponse {
  return parseResponse(responseSchema(z.array(adminEventSchema)), value) as AdminEventsResponse;
}

export function parseAdminEventResponse(value: unknown): AdminEventResponse {
  return parseResponse(responseSchema(adminEventSchema), value) as AdminEventResponse;
}

export function parseAdminEventSettingsResponse(value: unknown): AdminEventSettingsResponse {
  return parseResponse(adminEventSettingsResponseSchema, value) as AdminEventSettingsResponse;
}

export function parseAdminDirectionsResponse(value: unknown): AdminDirectionsResponse {
  return parseResponse(responseSchema(z.array(directionSchema)), value) as AdminDirectionsResponse;
}

export function parseAddDirectionResponse(value: unknown): AddDirectionResponse {
  return parseResponse(responseSchema(eventDirectionLinkSchema), value) as AddDirectionResponse;
}

export function parseRemoveDirectionResponse(value: unknown): RemoveDirectionResponse {
  return parseResponse(responseSchema(eventDirectionLinkSchema), value) as RemoveDirectionResponse;
}

export function parsePublishCheckResponse(value: unknown): PublishCheckResponse {
  return parseResponse(responseSchema(publishCheckSchema), value) as PublishCheckResponse;
}

export function parseArchiveEventResponse(value: unknown): ArchiveEventResponse {
  return parseResponse(responseSchema(archiveEventSchema), value) as ArchiveEventResponse;
}

export function parseGameTemplatesResponse(value: unknown): GameTemplatesResponse {
  return parseResponse(responseSchema(z.array(gameTemplateSchema)), value) as GameTemplatesResponse;
}

export function parseAdminEventGamesResponse(value: unknown): AdminEventGamesResponse {
  return parseResponse(responseSchema(z.array(adminEventGameSchema)), value) as AdminEventGamesResponse;
}

export function parseAdminEventGameResponse(value: unknown): AdminEventGameResponse {
  return parseResponse(responseSchema(adminEventGameSchema), value) as AdminEventGameResponse;
}

export function parseDeleteEventGameResponse(value: unknown): DeleteEventGameResponse {
  return parseResponse(responseSchema(deleteEventGameSchema), value) as DeleteEventGameResponse;
}
