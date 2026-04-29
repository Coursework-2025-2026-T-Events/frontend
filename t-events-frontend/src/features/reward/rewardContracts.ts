import { z } from "zod";
import { ApiError } from "@/lib/api/client";
import type {
  EventRedemptionResponse,
  RedemptionListResponse,
  RedemptionPreviewResponse,
  RewardEligibilityResponse,
  RewardQrResponse,
  RewardRedemptionResponse,
} from "@/lib/api/types";

const rewardTypeSchema = z.enum(["small", "big"]);
const rewardStatusSchema = z.enum(["locked", "small_unlocked", "big_unlocked", "redeemed"]);
const qrStatusSchema = z.enum(["active", "redeemed", "expired", "cancelled"]);

const eventRedemptionStateSchema = z
  .object({
    is_redeemed: z.boolean(),
    redeemed_reward_type: rewardTypeSchema.nullable(),
    redeemed_from_direction_id: z.number().nullable(),
    redeemed_at: z.string().nullable(),
  })
  .strict();

const rewardEligibilitySchema = z
  .object({
    event_id: z.number(),
    direction_id: z.number(),
    current_direction_score: z.number(),
    small_reward_threshold: z.number(),
    big_reward_threshold: z.number(),
    status: rewardStatusSchema,
    max_available_reward_type: rewardTypeSchema.nullable(),
    is_qr_available: z.boolean(),
    event_redemption: eventRedemptionStateSchema,
  })
  .strict();

const rewardQrSchema = z
  .object({
    qr_id: z.string(),
    event_id: z.number(),
    direction_id: z.number(),
    reward_type: rewardTypeSchema,
    status: qrStatusSchema,
    issued_at: z.string(),
    expires_at: z.string(),
    signed_token: z.string(),
    redeem_code: z.string(),
  })
  .strict();

const eventRedemptionSchema = z
  .object({
    is_redeemed: z.boolean(),
    reward_type: rewardTypeSchema.nullable(),
    direction_id: z.number().nullable(),
    redeemed_at: z.string().nullable(),
  })
  .strict();

const redemptionPreviewSchema = z
  .object({
    event_id: z.number(),
    event_title: z.string(),
    user_id: z.number(),
    full_name: z.string(),
    direction_id: z.number(),
    reward_type: rewardTypeSchema,
    qr_status: qrStatusSchema,
    eligibility_status: rewardStatusSchema,
    already_redeemed: z.boolean(),
  })
  .strict();

const rewardRedemptionSchema = z
  .object({
    redemption_id: z.string(),
    event_id: z.number(),
    user_id: z.number(),
    full_name: z.string(),
    direction_id: z.number(),
    reward_type: rewardTypeSchema,
    qr_id: z.string(),
    stander_user_id: z.number(),
    created_at: z.string(),
  })
  .strict();

const redemptionListEntrySchema = z
  .object({
    redemption_id: z.string(),
    event_id: z.number(),
    direction_id: z.number(),
    direction_name: z.string(),
    user_id: z.number(),
    full_name: z.string(),
    email: z.string(),
    reward_type: rewardTypeSchema,
    redeemed_at: z.string(),
    stander_user_id: z.number(),
    stander_full_name: z.string(),
  })
  .strict();

const redemptionListPageSchema = z
  .object({
    event_id: z.number(),
    total: z.number(),
    limit: z.number(),
    offset: z.number(),
    items: z.array(redemptionListEntrySchema),
  })
  .strict();

function responseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({ data: dataSchema }).strict();
}

function toContractMismatch(error: unknown): ApiError {
  return new ApiError("Reward API response does not match the expected contract", 200, "contract_mismatch", error, "contract");
}

function parseResponse<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) throw toContractMismatch(result.error);
  return result.data;
}

export function parseRewardEligibilityResponse(value: unknown): RewardEligibilityResponse {
  return parseResponse(responseSchema(rewardEligibilitySchema), value) as RewardEligibilityResponse;
}

export function parseRewardQrResponse(value: unknown): RewardQrResponse {
  return parseResponse(responseSchema(rewardQrSchema), value) as RewardQrResponse;
}

export function parseEventRedemptionResponse(value: unknown): EventRedemptionResponse {
  return parseResponse(responseSchema(eventRedemptionSchema), value) as EventRedemptionResponse;
}

export function parseRedemptionPreviewResponse(value: unknown): RedemptionPreviewResponse {
  return parseResponse(responseSchema(redemptionPreviewSchema), value) as RedemptionPreviewResponse;
}

export function parseRewardRedemptionResponse(value: unknown): RewardRedemptionResponse {
  return parseResponse(responseSchema(rewardRedemptionSchema), value) as RewardRedemptionResponse;
}

export function parseRedemptionListResponse(value: unknown): RedemptionListResponse {
  return parseResponse(responseSchema(redemptionListPageSchema), value) as RedemptionListResponse;
}
