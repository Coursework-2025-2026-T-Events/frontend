import test from "node:test";
import assert from "node:assert/strict";
import {
  canGenerateRewardQr,
  getRewardDescription,
  getRewardTitle,
  getRewardTypeLabel,
  getVisibleRewardQr,
  isRewardRedeemed,
  shouldShowRewardMainPanel,
} from "../src/features/reward/rewardPresentation";
import type { RewardEligibilityDTO, RewardQrDTO } from "../src/lib/api/types";

function eligibility(overrides: Partial<RewardEligibilityDTO>): RewardEligibilityDTO {
  return {
    event_id: 1,
    direction_id: 2,
    current_direction_score: 0,
    small_reward_threshold: 30,
    big_reward_threshold: 80,
    status: "locked",
    max_available_reward_type: null,
    is_qr_available: false,
    event_redemption: {
      is_redeemed: false,
      redeemed_reward_type: null,
      redeemed_from_direction_id: null,
      redeemed_at: null,
    },
    ...overrides,
  };
}

const qr: RewardQrDTO = {
  qr_id: "qr-1",
  event_id: 1,
  direction_id: 2,
  reward_type: "small",
  issued_at: "2026-05-12T11:00:00Z",
  signed_token: "signed",
  redeem_code: "123456",
  expires_at: "2026-05-12T12:00:00Z",
  status: "active",
};

test("builds reward labels and hero copy", () => {
  assert.equal(getRewardTypeLabel("big"), "Большой приз");
  assert.equal(getRewardTypeLabel("small"), "Малый приз");
  assert.equal(getRewardTypeLabel(null), "Приз");
  assert.equal(getRewardTitle(), "Проверяем доступ к призу");
  assert.equal(getRewardTitle(eligibility({ status: "small_unlocked" })), "Малый приз доступен");
  assert.equal(getRewardTitle(eligibility({ status: "redeemed" })), "Приз уже получен");
  assert.match(getRewardDescription(eligibility({ is_qr_available: true })), /QR-код/);
});

test("derives reward QR and redeemed states", () => {
  assert.equal(canGenerateRewardQr(eligibility({ status: "small_unlocked", is_qr_available: true })), true);
  assert.equal(canGenerateRewardQr(eligibility({ status: "locked", is_qr_available: true })), false);
  assert.equal(isRewardRedeemed(eligibility({ status: "redeemed" })), true);
  assert.equal(isRewardRedeemed(eligibility({ event_redemption: { ...eligibility({}).event_redemption, is_redeemed: true } })), true);
  assert.equal(getVisibleRewardQr(qr, 1, 2), qr);
  assert.equal(getVisibleRewardQr(qr, 1, 3), null);
  assert.equal(getVisibleRewardQr(null, 1, 2), null);
});

test("decides when the reward main panel should be rendered", () => {
  assert.equal(
    shouldShowRewardMainPanel({ isLoading: true, hasError: false, isRedeemed: false, eligibility: undefined }),
    true,
  );
  assert.equal(
    shouldShowRewardMainPanel({ isLoading: false, hasError: true, isRedeemed: false, eligibility: undefined }),
    true,
  );
  assert.equal(
    shouldShowRewardMainPanel({ isLoading: false, hasError: false, isRedeemed: true, eligibility: undefined }),
    true,
  );
  assert.equal(
    shouldShowRewardMainPanel({
      isLoading: false,
      hasError: false,
      isRedeemed: false,
      eligibility: eligibility({ status: "locked" }),
    }),
    true,
  );
  assert.equal(
    shouldShowRewardMainPanel({
      isLoading: false,
      hasError: false,
      isRedeemed: false,
      eligibility: eligibility({ status: "small_unlocked", is_qr_available: true }),
    }),
    false,
  );
});
