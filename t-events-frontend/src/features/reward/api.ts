// src/features/reward/api.ts
import { api } from "@/lib/api/client";
import type {
  RewardEligibilityResponse,
  RewardQrResponse,
  RedemptionPreviewResponse,
  RewardRedemptionResponse,
  EventRedemptionResponse,
  RedemptionListResponse,
  RewardType,
} from "@/lib/api/types";

export type RedemptionListFilters = {
  q?: string;
  direction_id?: number;
  reward_type?: RewardType;
  limit?: number;
  offset?: number;
};

export const rewardApi = {
  /** GET /api/v1/me/events/{event_id}/directions/{direction_id}/reward-status */
  getRewardStatus: (eventId: number, directionId: number) =>
    api.get<RewardEligibilityResponse>(
      `/me/events/${eventId}/directions/${directionId}/reward-status`
    ),

  /** POST /api/v1/me/events/{event_id}/directions/{direction_id}/reward-qr */
  generateQr: (eventId: number, directionId: number) =>
    api.post<RewardQrResponse>(
      `/me/events/${eventId}/directions/${directionId}/reward-qr`
    ),

  /** GET /api/v1/me/events/{event_id}/redemption */
  getEventRedemption: (eventId: number) =>
    api.get<EventRedemptionResponse>(`/me/events/${eventId}/redemption`),

  /** POST /api/v1/stander/redemptions/preview */
  previewRedemption: (signedToken: string) =>
    api.post<RedemptionPreviewResponse>("/stander/redemptions/preview", {
      signed_token: signedToken,
    }),

  /** POST /api/v1/stander/redemptions */
  confirmRedemption: (signedToken: string) =>
    api.post<RewardRedemptionResponse>("/stander/redemptions", {
      signed_token: signedToken,
    }),

  /** GET /api/v1/stander/events/{event_id}/redemptions */
  listEventRedemptions: (eventId: number, filters: RedemptionListFilters = {}) => {
    const searchParams = new URLSearchParams();
    if (filters.q) searchParams.set("q", filters.q);
    if (filters.direction_id !== undefined) searchParams.set("direction_id", String(filters.direction_id));
    if (filters.reward_type) searchParams.set("reward_type", filters.reward_type);
    if (filters.limit !== undefined) searchParams.set("limit", String(filters.limit));
    if (filters.offset !== undefined) searchParams.set("offset", String(filters.offset));
    const query = searchParams.toString();
    return api.get<RedemptionListResponse>(
      `/stander/events/${eventId}/redemptions${query ? `?${query}` : ""}`
    );
  },
};
