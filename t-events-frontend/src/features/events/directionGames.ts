import type { DirectionGamesItemDTO, DirectionProgressSummaryDTO } from "@/lib/api/types";

export function getDirectionGameStatusLabel(status: DirectionGamesItemDTO["status"]) {
  if (status === "completed") return "Завершена";
  if (status === "in_progress") return "В процессе";
  return "Не начата";
}

export function getDirectionGameLaunchLabel(status: DirectionGamesItemDTO["status"]) {
  if (status === "completed") return "Посмотреть результат";
  if (status === "in_progress") return "Продолжить";
  return "Начать";
}

export function getDirectionGameProgress(game: DirectionGamesItemDTO) {
  const total = Math.max(game.progress.total_questions, game.steps_total, 1);
  const answered = Math.min(total, game.progress.answered_questions);

  return Math.round((answered / total) * 100);
}

export function getDirectionProgressPct(summary: DirectionProgressSummaryDTO) {
  const maxScore = Math.max(summary.direction_max_score, 1);

  return Math.min(100, (summary.current_direction_score / maxScore) * 100);
}

export function formatDirectionGamePoints(points: number) {
  const absPoints = Math.abs(points);
  const lastTwoDigits = absPoints % 100;
  const lastDigit = absPoints % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return `${points} баллов`;
  if (lastDigit === 1) return `${points} балл`;
  if (lastDigit >= 2 && lastDigit <= 4) return `${points} балла`;
  return `${points} баллов`;
}

export function getNextRewardThreshold(summary: DirectionProgressSummaryDTO) {
  if (!summary.small_reward_unlocked) return summary.small_reward_threshold;
  if (!summary.big_reward_unlocked) return summary.big_reward_threshold;
  return summary.direction_max_score;
}

export function getRewardThresholdPct(summary: DirectionProgressSummaryDTO, threshold: number) {
  const maxScore = Math.max(summary.direction_max_score, 1);
  const safeThreshold = Math.min(maxScore, Math.max(0, threshold));

  return Math.min(96, Math.max(4, (safeThreshold / maxScore) * 100));
}

export function getRewardProgressText(summary: DirectionProgressSummaryDTO) {
  if (summary.big_reward_unlocked) {
    return "Большой приз доступен";
  }

  if (summary.small_reward_unlocked) {
    const scoreLeft = Math.max(0, summary.big_reward_threshold - summary.current_direction_score);

    return scoreLeft > 0
      ? `Малый приз доступен · до большого: ${formatDirectionGamePoints(scoreLeft)}`
      : "Большой приз доступен";
  }

  const nextThreshold = getNextRewardThreshold(summary);
  const scoreLeft = Math.max(0, nextThreshold - summary.current_direction_score);

  return scoreLeft > 0 ? `До малого приза: ${formatDirectionGamePoints(scoreLeft)}` : "Малый приз доступен";
}

export function getRewardButtonLabel(summary: DirectionProgressSummaryDTO) {
  if (summary.big_reward_unlocked) return "Получить большой приз";
  if (summary.small_reward_unlocked) return "Получить малый приз";
  return "Получить приз";
}

export function getRewardAvailabilityText(summary: DirectionProgressSummaryDTO | undefined) {
  if (!summary) return "Проверьте доступ";
  if (summary.big_reward_unlocked) return "Большой приз доступен";
  if (summary.small_reward_unlocked) return "Малый приз доступен";
  return `Откроется от ${formatDirectionGamePoints(summary.small_reward_threshold)}`;
}
