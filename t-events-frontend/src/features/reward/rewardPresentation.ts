import type { RewardEligibilityDTO, RewardQrDTO, RewardType } from "@/lib/api/types";

export function getRewardTypeLabel(type: RewardType | null): string {
  if (type === "big") return "Большой приз";
  if (type === "small") return "Малый приз";
  return "Приз";
}

export function getRewardTitle(eligibility?: RewardEligibilityDTO) {
  if (!eligibility) return "Проверяем доступ к призу";
  if (eligibility.status === "redeemed") return "Приз уже получен";
  if (eligibility.status === "big_unlocked") return "Большой приз доступен";
  if (eligibility.status === "small_unlocked") return "Малый приз доступен";
  return "Приз пока не открыт";
}

export function getRewardDescription(eligibility?: RewardEligibilityDTO) {
  if (!eligibility) return "Проверяем статус получения мерча.";
  if (eligibility.status === "redeemed") {
    return "Мерч уже выдан на стойке. Повторное получение недоступно.";
  }
  if (eligibility.is_qr_available) {
    return "Мерч доступен. Подготовьте QR-код для стойки выдачи.";
  }
  return "Мерч пока недоступен. Статус обновится автоматически, когда приз откроется.";
}

export function isRewardRedeemed(eligibility?: RewardEligibilityDTO) {
  return eligibility?.event_redemption.is_redeemed === true || eligibility?.status === "redeemed";
}

export function canGenerateRewardQr(eligibility?: RewardEligibilityDTO) {
  return Boolean(
    eligibility?.is_qr_available &&
      (eligibility.status === "small_unlocked" || eligibility.status === "big_unlocked"),
  );
}

export function getVisibleRewardQr(
  activeQr: RewardQrDTO | null,
  eventId: number,
  directionId: number | null,
) {
  if (!activeQr || directionId === null) return null;
  if (activeQr.event_id !== eventId || activeQr.direction_id !== directionId) return null;
  return activeQr;
}

export function shouldShowRewardMainPanel(
  params: {
    isLoading: boolean;
    hasError: boolean;
    isRedeemed: boolean;
    eligibility: RewardEligibilityDTO | undefined;
  },
) {
  return params.isLoading || params.hasError || params.isRedeemed || params.eligibility?.status === "locked";
}
