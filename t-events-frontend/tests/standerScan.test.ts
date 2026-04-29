import test from "node:test";
import assert from "node:assert/strict";
import {
  buildManualRedemptionRequest,
  buildQrRedemptionRequest,
  getEligibilityStatusLabel,
  getQrStatusLabel,
  getStanderRewardTypeLabel,
  isValidRedeemCode,
} from "../src/features/reward/standerScan";

test("builds stander scan presentation labels", () => {
  assert.equal(getStanderRewardTypeLabel("big"), "Большой приз");
  assert.equal(getStanderRewardTypeLabel("small"), "Малый приз");
  assert.equal(getQrStatusLabel("active"), "Можно выдать");
  assert.equal(getQrStatusLabel("redeemed"), "Уже использован");
  assert.equal(getQrStatusLabel("expired"), "Истёк");
  assert.equal(getQrStatusLabel("cancelled"), "Отменён");
  assert.equal(getEligibilityStatusLabel("locked"), "Приз пока недоступен");
  assert.equal(getEligibilityStatusLabel("small_unlocked"), "Доступен малый приз");
  assert.equal(getEligibilityStatusLabel("big_unlocked"), "Доступен большой приз");
  assert.equal(getEligibilityStatusLabel("redeemed"), "Приз уже получен");
});

test("validates manual redemption codes", () => {
  assert.equal(isValidRedeemCode("A7C3-42K9"), true);
  assert.equal(isValidRedeemCode("ABC 123"), true);
  assert.equal(isValidRedeemCode("short"), false);
  assert.equal(isValidRedeemCode("bad/code"), false);
});

test("builds redemption requests from QR payloads and manual codes", () => {
  assert.deepEqual(buildQrRedemptionRequest("https://example.com/stander/scan?token=signed-token"), {
    signed_token: "signed-token",
  });
  assert.deepEqual(buildQrRedemptionRequest("raw-token"), { signed_token: "raw-token" });
  assert.equal(buildQrRedemptionRequest(""), null);
  assert.deepEqual(buildManualRedemptionRequest(" A7C3-42K9 "), { redeem_code: "A7C3-42K9" });
  assert.equal(buildManualRedemptionRequest("bad/code"), null);
});
