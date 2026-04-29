import test from "node:test";
import assert from "node:assert/strict";
import { ApiError } from "../src/lib/api/client";
import {
  parseEventRedemptionResponse,
  parseRedemptionListResponse,
  parseRedemptionPreviewResponse,
  parseRewardEligibilityResponse,
  parseRewardQrResponse,
  parseRewardRedemptionResponse,
} from "../src/features/reward/rewardContracts";

const eligibility = {
  data: {
    event_id: 1,
    direction_id: 2,
    current_direction_score: 40,
    small_reward_threshold: 30,
    big_reward_threshold: 80,
    status: "small_unlocked",
    max_available_reward_type: "small",
    is_qr_available: true,
    event_redemption: {
      is_redeemed: false,
      redeemed_reward_type: null,
      redeemed_from_direction_id: null,
      redeemed_at: null,
    },
  },
};

const qr = {
  data: {
    qr_id: "qr-1",
    event_id: 1,
    direction_id: 2,
    reward_type: "small",
    status: "active",
    issued_at: "2026-05-12T12:00:00Z",
    expires_at: "2026-05-12T12:10:00Z",
    signed_token: "signed",
    redeem_code: "ABC123",
  },
};

const preview = {
  data: {
    event_id: 1,
    event_title: "Event",
    user_id: 3,
    full_name: "User",
    direction_id: 2,
    reward_type: "small",
    qr_status: "active",
    eligibility_status: "small_unlocked",
    already_redeemed: false,
  },
};

const redemption = {
  data: {
    redemption_id: "redemption-1",
    event_id: 1,
    user_id: 3,
    full_name: "User",
    direction_id: 2,
    reward_type: "small",
    qr_id: "qr-1",
    stander_user_id: 4,
    created_at: "2026-05-12T12:00:00Z",
  },
};

const list = {
  data: {
    event_id: 1,
    total: 1,
    limit: 20,
    offset: 0,
    items: [
      {
        redemption_id: "redemption-1",
        event_id: 1,
        direction_id: 2,
        direction_name: "Direction",
        user_id: 3,
        full_name: "User",
        email: "user@example.com",
        reward_type: "small",
        redeemed_at: "2026-05-12T12:00:00Z",
        stander_user_id: 4,
        stander_full_name: "Stander",
      },
    ],
  },
};

test("parses reward and stander API responses", () => {
  assert.equal(parseRewardEligibilityResponse(eligibility).data.status, "small_unlocked");
  assert.equal(parseRewardQrResponse(qr).data.status, "active");
  assert.equal(parseEventRedemptionResponse({ data: { is_redeemed: false, reward_type: null, direction_id: null, redeemed_at: null } }).data.is_redeemed, false);
  assert.equal(parseRedemptionPreviewResponse(preview).data.qr_status, "active");
  assert.equal(parseRewardRedemptionResponse(redemption).data.redemption_id, "redemption-1");
  assert.equal(parseRedemptionListResponse(list).data.items[0]?.stander_full_name, "Stander");
});

test("rejects reward API contract mismatches", () => {
  assert.throws(
    () => parseRewardQrResponse({ data: { ...qr.data, status: "unknown" } }),
    (error) => error instanceof ApiError && error.kind === "contract" && error.code === "contract_mismatch",
  );
  assert.throws(
    () => parseRedemptionPreviewResponse({ data: { ...preview.data, already_redeemed: "no" } }),
    (error) => error instanceof ApiError && error.kind === "contract" && error.code === "contract_mismatch",
  );
  assert.throws(
    () => parseRedemptionListResponse({ data: { ...list.data, total: "1" } }),
    (error) => error instanceof ApiError && error.kind === "contract" && error.code === "contract_mismatch",
  );
});
