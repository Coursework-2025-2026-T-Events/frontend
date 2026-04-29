import type { RedemptionTokenRequest } from "@/features/reward/api";
import type { QrStatus, RewardStatus, RewardType } from "@/lib/api/types";
import { extractSignedToken } from "@/lib/qrToken";

export type StanderScanStep = "scan" | "preview" | "confirmed" | "error";

export function getStanderRewardTypeLabel(type: RewardType): string {
  return type === "big" ? "Большой приз" : "Малый приз";
}

export function getQrStatusLabel(status: QrStatus): string {
  if (status === "active") return "Можно выдать";
  if (status === "redeemed") return "Уже использован";
  if (status === "expired") return "Истёк";
  return "Отменён";
}

export function getEligibilityStatusLabel(status: RewardStatus): string {
  if (status === "locked") return "Приз пока недоступен";
  if (status === "small_unlocked") return "Доступен малый приз";
  if (status === "big_unlocked") return "Доступен большой приз";
  return "Приз уже получен";
}

export function isValidRedeemCode(value: string) {
  const compact = value.replace(/[\s-]/g, "");
  return /^[A-Za-z0-9]{6,16}$/.test(compact);
}

export function buildQrRedemptionRequest(payload: string): RedemptionTokenRequest | null {
  const value = payload.trim();
  if (!value) return null;

  const token = extractSignedToken(value);
  if (!token) return null;
  return { signed_token: token };
}

export function buildManualRedemptionRequest(code: string): RedemptionTokenRequest | null {
  const value = code.trim();
  if (!value || !isValidRedeemCode(value)) return null;
  return { redeem_code: value };
}
