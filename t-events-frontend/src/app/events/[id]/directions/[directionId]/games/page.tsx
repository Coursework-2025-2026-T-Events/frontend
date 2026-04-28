"use client";

import { useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, Gift, Play, Trophy } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import ErrorMessage from "@/components/ui/ErrorMessage";
import { DirectionVisual } from "@/components/events/directionVisuals";
import { getDirectionTheme } from "@/components/events/directionTheme";
import RequireAuth from "@/features/auth/RequireAuth";
import { useIsAuthorized } from "@/features/auth/useIsAuthorized";
import { eventsApi } from "@/features/events/api";
import { useParticipationStore } from "@/features/participation/store";
import type { DirectionGamesItemDTO, DirectionProgressSummaryDTO } from "@/lib/api/types";
import { getErrorPresentation } from "@/lib/getErrorMessage";
import { routes } from "@/lib/routes";
import clsx from "clsx";

function getStatusLabel(status: DirectionGamesItemDTO["status"]) {
  if (status === "completed") return "Завершена";
  if (status === "in_progress") return "В процессе";
  return "Не начата";
}

function getLaunchLabel(status: DirectionGamesItemDTO["status"]) {
  if (status === "completed") return "Посмотреть результат";
  if (status === "in_progress") return "Продолжить";
  return "Начать";
}

function getStatusStyle(status: DirectionGamesItemDTO["status"]) {
  if (status === "completed") return "bg-[#eaf7ee] text-[#237a3b]";
  if (status === "in_progress") return "bg-[var(--color-brand-yellow)] text-[var(--color-brand-ink)]";
  return "bg-[var(--color-brand-panel)] text-[var(--color-brand-graphite)]";
}

function getGameButtonClassName(status: DirectionGamesItemDTO["status"]) {
  const completed = status === "completed";

  return clsx(
    "mt-5 w-full min-h-12 gap-2 rounded-[var(--radius-md)] px-5 text-[15px] font-medium",
    completed ? "border-[#cfd8d3] bg-[#f5f8f6] text-[#237a3b] shadow-none hover:bg-[#edf5f0]" : "active:translate-y-px"
  );
}

function getGameProgress(game: DirectionGamesItemDTO) {
  const total = Math.max(game.progress.total_questions, game.steps_total, 1);
  const answered = Math.min(total, game.progress.answered_questions);

  return Math.round((answered / total) * 100);
}

function getDirectionProgressPct(summary: DirectionProgressSummaryDTO) {
  const maxScore = Math.max(summary.direction_max_score, 1);

  return Math.min(100, (summary.current_direction_score / maxScore) * 100);
}

function formatPointsLabel(points: number) {
  const absPoints = Math.abs(points);
  const lastTwoDigits = absPoints % 100;
  const lastDigit = absPoints % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return `${points} баллов`;
  if (lastDigit === 1) return `${points} балл`;
  if (lastDigit >= 2 && lastDigit <= 4) return `${points} балла`;
  return `${points} баллов`;
}

function getNextRewardThreshold(summary: DirectionProgressSummaryDTO) {
  if (!summary.small_reward_unlocked) return summary.small_reward_threshold;
  if (!summary.big_reward_unlocked) return summary.big_reward_threshold;
  return summary.direction_max_score;
}

function getThresholdPct(summary: DirectionProgressSummaryDTO, threshold: number) {
  const maxScore = Math.max(summary.direction_max_score, 1);
  const safeThreshold = Math.min(maxScore, Math.max(0, threshold));

  return Math.min(96, Math.max(4, (safeThreshold / maxScore) * 100));
}

function getRewardProgressText(summary: DirectionProgressSummaryDTO) {
  if (summary.big_reward_unlocked || summary.small_reward_unlocked) {
    return "Приз доступен";
  }

  const nextThreshold = getNextRewardThreshold(summary);
  const scoreLeft = Math.max(0, nextThreshold - summary.current_direction_score);

  return scoreLeft > 0 ? `До приза: ${formatPointsLabel(scoreLeft)}` : "Приз доступен";
}

function RewardProgressTrack({ summary }: { summary: DirectionProgressSummaryDTO }) {
  const fillPct = getDirectionProgressPct(summary);
  const smallMarkerPct = getThresholdPct(summary, summary.small_reward_threshold);
  const bigMarkerPct = getThresholdPct(summary, summary.big_reward_threshold);

  return (
    <div className="relative py-3">
      <div className="h-3 overflow-hidden rounded-full bg-[#e8eaef] shadow-[inset_0_1px_2px_rgba(16,17,20,0.06)]">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#f5ce00_0%,#fedd2e_72%,#ffe56b_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] transition-[width] duration-700 ease-out"
          style={{ width: `${fillPct}%` }}
        />
      </div>
      <span
        className={clsx(
          "absolute top-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white shadow-[0_2px_8px_rgba(16,17,20,0.14)]",
          summary.small_reward_unlocked
            ? "reward-marker-unlocked bg-[var(--color-brand-yellow)] text-[#237a3b]"
            : "bg-white text-[var(--color-brand-muted)] ring-1 ring-inset ring-[var(--color-brand-line)]"
        )}
        style={{ left: `${smallMarkerPct}%` }}
        aria-hidden
      >
        <Gift className="h-3.5 w-3.5" />
      </span>
      <span
        className={clsx(
          "absolute top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white shadow-[0_3px_10px_rgba(16,17,20,0.16)]",
          summary.big_reward_unlocked
            ? "reward-marker-unlocked bg-[var(--color-brand-yellow)] text-[#126df7]"
            : "bg-white text-[var(--color-brand-muted)] ring-1 ring-inset ring-[var(--color-brand-line)]"
        )}
        style={{ left: `${bigMarkerPct}%` }}
        aria-hidden
      >
        <Gift className="h-[18px] w-[18px]" />
      </span>
    </div>
  );
}

function ScoreBadge({ summary }: { summary: DirectionProgressSummaryDTO }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-[#fff7cf] px-3.5 py-1.5 text-[var(--color-brand-ink)] shadow-[inset_0_0_0_1px_rgba(245,206,0,0.42)]">
      <span className="text-[15px] font-medium leading-5">{formatPointsLabel(summary.current_direction_score)}</span>
      <span className="text-[13px] leading-5 text-[var(--color-brand-graphite)]">из {summary.direction_max_score}</span>
    </div>
  );
}

function DirectionProgressSummary({ className, summary }: { className?: string; summary: DirectionProgressSummaryDTO }) {
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
            <ScoreBadge summary={summary} />
          </div>
          <div className="mt-4">
            <RewardProgressTrack summary={summary} />
          </div>
        </div>
      </div>
    </section>
  );
}

function MobileDirectionProgressBar({
  directionId,
  eventId,
  summary,
}: {
  directionId: number;
  eventId: number;
  summary: DirectionProgressSummaryDTO;
}) {
  const rewardUnlocked = summary.small_reward_unlocked || summary.big_reward_unlocked;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-brand-line)] bg-white/95 px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 shadow-[0_-10px_30px_rgba(16,17,20,0.12)] backdrop-blur sm:hidden">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-2 flex items-center justify-between gap-4 text-[14px] leading-5">
          <span className="font-medium text-[var(--color-brand-ink)]">{getRewardProgressText(summary)}</span>
          <ScoreBadge summary={summary} />
        </div>
        <RewardProgressTrack summary={summary} />
        {rewardUnlocked && (
          <Button
            href={routes.eventDirectionReward(eventId, directionId)}
            className="relative mt-3 min-h-11 w-full overflow-hidden rounded-[14px] bg-[var(--color-brand-yellow)] px-5 text-[15px] font-medium shadow-[0_4px_0_rgba(16,17,20,0.12)] before:absolute before:left-[-10px] before:top-1/2 before:h-5 before:w-5 before:-translate-y-1/2 before:rounded-full before:bg-white/95 after:absolute after:right-[-10px] after:top-1/2 after:h-5 after:w-5 after:-translate-y-1/2 after:rounded-full after:bg-white/95 hover:bg-[var(--color-brand-yellow-hover)]"
          >
            Получить приз
          </Button>
        )}
      </div>
    </div>
  );
}

function EmptyGamesState({
  directionTheme,
  eventId,
}: {
  directionTheme: ReturnType<typeof getDirectionTheme>;
  eventId: number;
}) {
  return (
    <section className="overflow-hidden rounded-[var(--radius-lg)] bg-white shadow-[var(--shadow-card)]">
      <div className="grid gap-0 sm:grid-cols-[240px_minmax(0,1fr)] sm:items-center">
        <DirectionVisual className="h-36 rounded-none sm:h-48" theme={directionTheme} selected={false} />
        <div className="p-5 sm:p-6">
          <h2 className="text-[22px] font-medium leading-7 text-[var(--color-brand-ink)]">
            В этом направлении пока нет игр
          </h2>
          <p className="mt-2 text-[15px] leading-6 text-[var(--color-brand-graphite)]">
            Когда организаторы добавят задания, они появятся здесь.
          </p>
          <Button
            href={routes.eventDirections(eventId)}
            variant="secondary"
            className="mt-5 min-h-12 w-full gap-2 px-6 text-[15px] font-medium sm:w-auto"
          >
            Вернуться к направлениям
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>
    </section>
  );
}

function GamesSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Загрузка игр">
      {[0, 1, 2].map((item) => (
        <div key={item} className="min-h-[240px] rounded-[var(--radius-lg)] bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
          <div className="h-10 w-10 animate-pulse rounded-[var(--radius-md)] bg-[var(--color-brand-line)]" />
          <div className="mt-5 h-6 w-3/4 animate-pulse rounded-full bg-[var(--color-brand-line)]" />
          <div className="mt-4 h-4 w-full animate-pulse rounded-full bg-[var(--color-brand-line)]" />
          <div className="mt-2 h-4 w-5/6 animate-pulse rounded-full bg-[var(--color-brand-line)]" />
          <div className="mt-7 h-11 w-full animate-pulse rounded-[var(--radius-md)] bg-[var(--color-brand-line)]" />
        </div>
      ))}
    </div>
  );
}

type GameCardProps = {
  game: DirectionGamesItemDTO;
  pending: boolean;
  onOpen: () => void;
};

function GameCard({ game, pending, onOpen }: GameCardProps) {
  const progress = getGameProgress(game);
  const completed = game.status === "completed";
  const inProgress = game.status === "in_progress";
  const Icon = completed ? CheckCircle2 : inProgress ? Clock3 : Play;

  return (
    <article
      className={clsx(
        "flex min-h-[250px] flex-col rounded-[var(--radius-lg)] bg-white p-4 shadow-[var(--shadow-card)] transition duration-150 sm:min-h-[270px] sm:p-5",
        completed
          ? "border border-[var(--color-brand-line)] bg-white/70 shadow-none"
          : "hover:-translate-y-0.5 hover:shadow-[0_12px_34px_rgba(16,17,20,0.12)]"
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div
          className={clsx(
            "flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-brand-ink)]",
            completed ? "bg-[#eaf7ee] text-[#237a3b]" : "bg-[var(--color-brand-panel)]"
          )}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        <span className={`rounded-full px-3 py-1 text-[13px] font-medium leading-[18px] ${getStatusStyle(game.status)}`}>
          {getStatusLabel(game.status)}
        </span>
      </div>

      <h2 className="mt-5 text-[20px] font-medium leading-6 text-[var(--color-brand-ink)] sm:text-[22px] sm:leading-7">{game.title}</h2>
      <p className="mt-3 line-clamp-3 text-[15px] leading-6 text-[var(--color-brand-graphite)]">{game.description}</p>

      <div className="mt-auto pt-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[14px] leading-5 text-[var(--color-brand-graphite)]">
          <span>{game.progress.answered_questions} из {Math.max(game.progress.total_questions, game.steps_total)} заданий</span>
          <span>{game.progress.current_score} / {game.progress.max_score}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[var(--color-brand-line)]">
          <div className="h-full rounded-full bg-[var(--color-brand-yellow)] transition-[width] duration-700 ease-out" style={{ width: `${progress}%` }} />
        </div>
        <Button
          variant={completed ? "secondary" : "primary"}
          className={getGameButtonClassName(game.status)}
          disabled={pending}
          onClick={onOpen}
        >
          {pending ? "Открываем..." : getLaunchLabel(game.status)}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </article>
  );
}

export default function GamesPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = Number(params.id);
  const directionId = Number(params.directionId);
  const isAuthorized = useIsAuthorized();
  const { eventId: selectedEventId, directionId: selectedDirectionId, selectDirection, markVerified } = useParticipationStore();

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["direction-games", eventId, directionId],
    queryFn: () => eventsApi.directionGames(eventId, directionId),
    enabled: Number.isFinite(eventId) && Number.isFinite(directionId) && isAuthorized,
  });

  const startSessionMutation = useMutation({
    mutationFn: (eventGameId: number) => eventsApi.startOrResumeSession(eventId, directionId, eventGameId),
    onSuccess: (_res, eventGameId) => {
      router.push(routes.eventGame(eventId, directionId, eventGameId));
    },
  });

  const handleOpenGame = (game: DirectionGamesItemDTO) => {
    startSessionMutation.mutate(game.event_game_id);
  };

  const directionName = data?.data.direction.name;
  const directionTheme = getDirectionTheme(directionName ?? "");
  const summary = data?.data.summary;
  const games = data?.data.games ?? [];
  const pageError = error ? getErrorPresentation(error, "Не удалось загрузить игры") : null;
  const hasUnlockedReward = summary?.small_reward_unlocked || summary?.big_reward_unlocked;

  useEffect(() => {
    if (!Number.isFinite(eventId) || !Number.isFinite(directionId)) return;
    if (selectedEventId !== eventId || selectedDirectionId !== directionId) {
      selectDirection(eventId, directionId, { directionName });
      return;
    }
    if (directionName) markVerified({ directionName });
  }, [directionId, directionName, eventId, markVerified, selectDirection, selectedDirectionId, selectedEventId]);

  return (
    <RequireAuth>
      <div className={clsx("min-h-[calc(100vh-4rem)] bg-[var(--color-brand-mist)] sm:pb-16", hasUnlockedReward ? "pb-44" : "pb-28")}>
        <Container>
          <div className="py-4 sm:py-10 lg:py-12">
            <Button
              variant="ghost"
              href={routes.eventDirections(eventId)}
              className="-ml-3 mb-4 min-h-10 gap-2 px-3 text-[14px] font-medium text-[var(--color-brand-muted)] hover:bg-white/70 sm:mb-6 sm:text-[15px]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              К направлениям
            </Button>

            <section className="overflow-hidden rounded-[var(--radius-lg)] bg-white shadow-[var(--shadow-card)]">
              <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-stretch">
                <div className="p-4 sm:p-8 lg:p-10">
                  <span className="inline-flex rounded-full bg-[var(--color-brand-yellow)] px-3 py-1 text-[13px] font-medium leading-[18px] text-[var(--color-brand-ink)]">
                    Игры направления
                  </span>
                  <h1 className="mt-4 max-w-3xl text-balance text-[28px] font-bold leading-8 text-[var(--color-brand-ink)] sm:mt-5 sm:text-[44px] sm:leading-[48px]">
                    {directionName ?? "Выберите игру"}
                  </h1>
                  <p className="mt-3 max-w-2xl text-[14px] leading-[22px] text-[var(--color-brand-graphite)] sm:mt-4 sm:text-[15px] sm:leading-6">
                    Проходите задания в удобном темпе: можно начать новую игру или вернуться к той, где уже есть прогресс.
                  </p>
                </div>
                <DirectionVisual className="hidden h-40 rounded-none sm:block sm:h-44 lg:h-full lg:min-h-[300px]" theme={directionTheme} selected />
              </div>
            </section>

            <div className="mt-5 space-y-4 sm:mt-6 sm:space-y-5">
              {summary && <DirectionProgressSummary className="hidden sm:block" summary={summary} />}

              {hasUnlockedReward && (
                <section className="hidden rounded-[var(--radius-lg)] bg-white p-4 shadow-[var(--shadow-card)] sm:block sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-[22px] font-medium leading-7 text-[var(--color-brand-ink)]">
                        Приз можно получить
                      </h2>
                      <p className="mt-2 max-w-2xl text-[15px] leading-6 text-[var(--color-brand-graphite)]">
                        Откройте QR-код и покажите его на стойке выдачи.
                      </p>
                    </div>
                    <Button
                      href={routes.eventDirectionReward(eventId, directionId)}
                      className="min-h-12 w-full shrink-0 gap-2 px-6 text-[15px] font-medium shadow-[0_3px_0_rgba(16,17,20,0.12)] sm:w-auto"
                    >
                      К призу
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Button>
                  </div>
                </section>
              )}

              {isLoading && <GamesSkeleton />}

              {error && (
                <ErrorMessage
                  message={pageError?.message ?? "Не удалось загрузить игры"}
                  title={pageError?.title}
                  actionLabel={pageError?.retryable ? (isFetching ? "Повторяем..." : "Повторить") : undefined}
                  onAction={pageError?.retryable ? () => refetch() : undefined}
                />
              )}

              {!isLoading && !error && games.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 xl:gap-5">
                  {games.map((game) => (
                    <GameCard
                      key={game.event_game_id}
                      game={game}
                      pending={startSessionMutation.isPending}
                      onOpen={() => handleOpenGame(game)}
                    />
                  ))}
                </div>
              )}

              {!isLoading && !error && games.length === 0 && (
                <EmptyGamesState directionTheme={directionTheme} eventId={eventId} />
              )}

              {startSessionMutation.error && (
                <ErrorMessage message={pageError?.message ?? "Не удалось открыть игру"} />
              )}
            </div>
          </div>
        </Container>
        {summary && <MobileDirectionProgressBar directionId={directionId} eventId={eventId} summary={summary} />}
      </div>
    </RequireAuth>
  );
}
