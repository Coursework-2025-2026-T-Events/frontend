"use client";

import { useState, type MouseEvent } from "react";
import { Award, BarChart3, Gift, Trophy, X } from "lucide-react";
import clsx from "clsx";
import Button from "@/components/ui/Button";
import type { DirectionProgressSummaryDTO } from "@/lib/api/types";
import { routes } from "@/lib/routes";
import {
  formatDirectionGamePoints,
  getDirectionProgressPct,
  getRewardAvailabilityText,
  getRewardButtonLabel,
  getRewardProgressText,
  getRewardThresholdPct,
} from "./directionGames";

function RewardProgressTrack({ summary, showLabels = false }: { summary: DirectionProgressSummaryDTO; showLabels?: boolean }) {
  const fillPct = getDirectionProgressPct(summary);
  const smallMarkerPct = getRewardThresholdPct(summary, summary.small_reward_threshold);
  const bigMarkerPct = getRewardThresholdPct(summary, summary.big_reward_threshold);
  const markerCenterClass = showLabels ? "top-[22px]" : "top-1/2";
  const unlockedMarkerClass = showLabels ? "reward-marker-unlocked" : "reward-marker-unlocked reward-marker-unlocked-compact";

  return (
    <div className={clsx("relative", showLabels ? "pb-9 pt-4" : "py-3")}>
      <div className="h-3 overflow-hidden rounded-full bg-[#e8eaef] shadow-[inset_0_1px_2px_rgba(16,17,20,0.06)]">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#f5ce00_0%,#fedd2e_72%,#ffe56b_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] transition-[width] duration-700 ease-out"
          style={{ width: `${fillPct}%` }}
        />
      </div>

      <span
        className={clsx(
          "absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white shadow-[0_2px_8px_rgba(16,17,20,0.14)]",
          markerCenterClass,
          summary.small_reward_unlocked
            ? `${unlockedMarkerClass} bg-[var(--color-brand-yellow)] text-[#237a3b]`
            : "bg-white text-[var(--color-brand-muted)] ring-1 ring-inset ring-[var(--color-brand-line)]",
        )}
        style={{ left: `${smallMarkerPct}%` }}
        aria-hidden
      >
        <Gift className="h-3.5 w-3.5" />
      </span>
      {showLabels && (
        <span className="absolute bottom-0 max-w-28 -translate-x-1/2 text-center text-[12px] leading-4 text-[var(--color-brand-muted)]" style={{ left: `${smallMarkerPct}%` }}>
          Малый · {formatDirectionGamePoints(summary.small_reward_threshold)}
        </span>
      )}

      <span
        className={clsx(
          "absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white shadow-[0_3px_10px_rgba(16,17,20,0.16)]",
          markerCenterClass,
          summary.big_reward_unlocked
            ? `${unlockedMarkerClass} bg-[var(--color-brand-yellow)] text-[#126df7]`
            : "bg-white text-[var(--color-brand-muted)] ring-1 ring-inset ring-[var(--color-brand-line)]",
        )}
        style={{ left: `${bigMarkerPct}%` }}
        aria-hidden
      >
        <Gift className="h-[18px] w-[18px]" />
      </span>
      {showLabels && (
        <span className="absolute bottom-0 max-w-28 -translate-x-1/2 text-center text-[12px] leading-4 text-[var(--color-brand-muted)]" style={{ left: `${bigMarkerPct}%` }}>
          Большой · {formatDirectionGamePoints(summary.big_reward_threshold)}
        </span>
      )}
    </div>
  );
}

function ScoreBadge({ summary }: { summary: DirectionProgressSummaryDTO }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-[#fff7cf] px-3.5 py-1.5 text-[var(--color-brand-ink)] shadow-[inset_0_0_0_1px_rgba(245,206,0,0.42)]">
      <span className="text-[15px] font-medium leading-5">{formatDirectionGamePoints(summary.current_direction_score)}</span>
      <span className="text-[13px] leading-5 text-[var(--color-brand-graphite)]">из {summary.direction_max_score}</span>
    </div>
  );
}

export function DirectionProgressSummary({ className, summary }: { className?: string; summary: DirectionProgressSummaryDTO }) {
  const rewardUnlocked = summary.small_reward_unlocked || summary.big_reward_unlocked;

  return (
    <section className={clsx("rounded-[var(--radius-lg)] bg-white p-4 shadow-[var(--shadow-card)] sm:p-6", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-panel)] text-[var(--color-brand-ink)]">
          <Trophy className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-[20px] font-medium leading-6 text-[var(--color-brand-ink)]">Ваш прогресс</h2>
              <p className="mt-1 text-[15px] leading-6 text-[var(--color-brand-graphite)]">
                {rewardUnlocked ? "Приз доступен, но можно продолжить играть дальше." : getRewardProgressText(summary)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <ScoreBadge summary={summary} />
            </div>
          </div>
          <div className="mt-4">
            <RewardProgressTrack summary={summary} showLabels />
          </div>
        </div>
      </div>
    </section>
  );
}

export function DirectionActionStrip({ directionId, eventId, summary }: { directionId: number; eventId: number; summary?: DirectionProgressSummaryDTO | undefined }) {
  const rewardUnlocked = Boolean(summary?.small_reward_unlocked || summary?.big_reward_unlocked);
  const rewardText = getRewardAvailabilityText(summary);

  return (
    <section className="grid gap-3 sm:grid-cols-2">
      <div className="hidden sm:block">
        <Button
          href={routes.eventDirectionReward(eventId, directionId)}
          variant="secondary"
          className={clsx(
            "min-h-[78px] w-full justify-start rounded-[var(--radius-lg)] bg-white px-5 py-3 text-left shadow-[var(--shadow-card)] hover:bg-white hover:shadow-[0_10px_28px_rgba(16,17,20,0.10)]",
            !rewardUnlocked && "text-[var(--color-brand-muted)]",
          )}
          aria-disabled={!rewardUnlocked}
          tabIndex={rewardUnlocked ? undefined : -1}
          onClick={(event: MouseEvent<HTMLAnchorElement>) => {
            if (!rewardUnlocked) event.preventDefault();
          }}
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className={clsx("flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-panel)]", rewardUnlocked ? "text-[var(--color-brand-ink)]" : "text-[var(--color-brand-muted)]")}>
              <Award className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-[16px] font-medium leading-5 text-[var(--color-brand-ink)]">Приз</span>
              <span className="mt-0.5 block truncate text-[13px] leading-5 text-[var(--color-brand-graphite)]">{rewardText}</span>
            </span>
          </span>
        </Button>
      </div>

      <Button
        href={routes.eventDirectionProgress(eventId, directionId)}
        variant="secondary"
        className="min-h-[78px] justify-start rounded-[var(--radius-lg)] bg-white px-4 py-3 text-left shadow-[var(--shadow-card)] hover:bg-white hover:shadow-[0_10px_28px_rgba(16,17,20,0.10)] sm:px-5"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-panel)] text-[var(--color-brand-ink)]">
            <BarChart3 className="h-5 w-5" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block text-[16px] font-medium leading-5 text-[var(--color-brand-ink)]">Рейтинг</span>
            <span className="mt-0.5 block truncate text-[13px] leading-5 text-[var(--color-brand-graphite)]">Сравнить результат</span>
          </span>
        </span>
      </Button>
    </section>
  );
}

export function MobileDirectionProgressBar({ directionId, eventId, summary }: { directionId: number; eventId: number; summary: DirectionProgressSummaryDTO }) {
  const rewardUnlocked = summary.small_reward_unlocked || summary.big_reward_unlocked;
  const [thresholdsOpen, setThresholdsOpen] = useState(false);

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-brand-line)] bg-white/95 px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 shadow-[0_-10px_30px_rgba(16,17,20,0.12)] backdrop-blur sm:hidden">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-2 flex items-center justify-between gap-4 text-[14px] leading-5">
            <div className="flex items-center gap-3">
              <span className="font-medium text-[var(--color-brand-ink)]">Ваш прогресс</span>
              <button type="button" className="rounded-full bg-[var(--color-brand-panel)] px-3 py-1 text-[13px] leading-4 text-[var(--color-brand-graphite)] transition hover:bg-[var(--color-brand-line)]" onClick={() => setThresholdsOpen(true)}>
                Пороги
              </button>
            </div>
            <ScoreBadge summary={summary} />
          </div>
          <RewardProgressTrack summary={summary} />
          {rewardUnlocked && (
            <div className="mt-2 flex justify-center">
              <Button href={routes.eventDirectionReward(eventId, directionId)} className="relative min-h-9 w-auto overflow-hidden rounded-[12px] bg-[var(--color-brand-yellow)] px-8 text-[14px] font-medium shadow-[0_3px_0_rgba(16,17,20,0.12)] before:absolute before:left-[-8px] before:top-1/2 before:h-4 before:w-4 before:-translate-y-1/2 before:rounded-full before:bg-white/95 after:absolute after:right-[-8px] after:top-1/2 after:h-4 after:w-4 after:-translate-y-1/2 after:rounded-full after:bg-white/95 hover:bg-[var(--color-brand-yellow-hover)]">
                {getRewardButtonLabel(summary)}
              </Button>
            </div>
          )}
        </div>
      </div>

      {thresholdsOpen && (
        <div className="fixed inset-0 z-50 bg-[rgba(16,17,20,0.28)] sm:hidden" onClick={() => setThresholdsOpen(false)}>
          <div className="absolute inset-x-0 bottom-0 rounded-t-[24px] bg-white px-4 pb-[calc(env(safe-area-inset-bottom)+20px)] pt-4 shadow-[0_-18px_44px_rgba(16,17,20,0.18)]" onClick={(event) => event.stopPropagation()}>
            <div className="mx-auto max-w-[480px]">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-[20px] font-medium leading-6 text-[var(--color-brand-ink)]">Пороги призов</h2>
                <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-brand-panel)] text-[var(--color-brand-muted)]" aria-label="Закрыть" onClick={() => setThresholdsOpen(false)}>
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between rounded-[var(--radius-md)] bg-[var(--color-brand-panel)] px-4 py-3">
                  <span className="text-[15px] font-medium leading-5 text-[var(--color-brand-ink)]">Малый приз</span>
                  <span className="text-[15px] leading-5 text-[var(--color-brand-graphite)]">{formatDirectionGamePoints(summary.small_reward_threshold)}</span>
                </div>
                <div className="flex items-center justify-between rounded-[var(--radius-md)] bg-[var(--color-brand-panel)] px-4 py-3">
                  <span className="text-[15px] font-medium leading-5 text-[var(--color-brand-ink)]">Большой приз</span>
                  <span className="text-[15px] leading-5 text-[var(--color-brand-graphite)]">{formatDirectionGamePoints(summary.big_reward_threshold)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
