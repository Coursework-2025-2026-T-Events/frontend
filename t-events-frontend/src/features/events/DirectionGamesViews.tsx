"use client";

import { ArrowRight, CheckCircle2, Clock3, Play } from "lucide-react";
import clsx from "clsx";
import Button from "@/components/ui/Button";
import ErrorMessage from "@/components/ui/ErrorMessage";
import { DirectionVisual } from "@/components/events/directionVisuals";
import type { getDirectionTheme } from "@/components/events/directionTheme";
import type { DirectionGamesItemDTO } from "@/lib/api/types";
import { routes } from "@/lib/routes";
import {
  getDirectionGameLaunchLabel,
  getDirectionGameProgress,
  getDirectionGameStatusLabel,
} from "./directionGames";
export { DirectionActionStrip, DirectionProgressSummary, MobileDirectionProgressBar } from "./DirectionRewardProgressViews";

type DirectionTheme = ReturnType<typeof getDirectionTheme>;

function getStatusStyle(status: DirectionGamesItemDTO["status"]) {
  if (status === "completed") return "bg-[#eaf7ee] text-[#237a3b]";
  if (status === "in_progress") return "bg-[var(--color-brand-yellow)] text-[var(--color-brand-ink)]";
  return "bg-[var(--color-brand-panel)] text-[var(--color-brand-graphite)]";
}

function getGameButtonClassName(status: DirectionGamesItemDTO["status"]) {
  const completed = status === "completed";

  return clsx(
    "mt-5 w-full min-h-12 gap-2 rounded-[var(--radius-md)] px-5 text-[15px] font-medium",
    completed ? "border-[#cfd8d3] bg-[#f5f8f6] text-[#237a3b] shadow-none hover:bg-[#edf5f0]" : "active:translate-y-px",
  );
}

export function DirectionGamesHero({ directionName, directionTheme }: { directionName?: string | undefined; directionTheme: DirectionTheme }) {
  return (
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
  );
}


export function EmptyGamesState({ directionTheme, eventId }: { directionTheme: DirectionTheme; eventId: number }) {
  return (
    <section className="overflow-hidden rounded-[var(--radius-lg)] bg-white shadow-[var(--shadow-card)]">
      <div className="grid gap-0 sm:grid-cols-[240px_minmax(0,1fr)] sm:items-center">
        <DirectionVisual className="h-36 rounded-none sm:h-48" theme={directionTheme} selected={false} />
        <div className="p-5 sm:p-6">
          <h2 className="text-[22px] font-medium leading-7 text-[var(--color-brand-ink)]">В этом направлении пока нет игр</h2>
          <p className="mt-2 text-[15px] leading-6 text-[var(--color-brand-graphite)]">Когда организаторы добавят задания, они появятся здесь.</p>
          <Button href={routes.eventDirections(eventId)} variant="secondary" className="mt-5 min-h-12 w-full gap-2 px-6 text-[15px] font-medium sm:w-auto">
            Вернуться к направлениям
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>
    </section>
  );
}

export function GamesSkeleton() {
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

export function GameCard({ game, pending, onOpen }: { game: DirectionGamesItemDTO; pending: boolean; onOpen: () => void }) {
  const progress = getDirectionGameProgress(game);
  const completed = game.status === "completed";
  const inProgress = game.status === "in_progress";
  const Icon = completed ? CheckCircle2 : inProgress ? Clock3 : Play;

  return (
    <article className={clsx("flex min-h-[250px] flex-col rounded-[var(--radius-lg)] bg-white p-4 shadow-[var(--shadow-card)] transition duration-150 sm:min-h-[270px] sm:p-5", completed ? "border border-[var(--color-brand-line)] bg-white/70 shadow-none" : "hover:-translate-y-0.5 hover:shadow-[0_12px_34px_rgba(16,17,20,0.12)]")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className={clsx("flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-brand-ink)]", completed ? "bg-[#eaf7ee] text-[#237a3b]" : "bg-[var(--color-brand-panel)]")}>
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        <span className={`rounded-full px-3 py-1 text-[13px] font-medium leading-[18px] ${getStatusStyle(game.status)}`}>
          {getDirectionGameStatusLabel(game.status)}
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
        <Button variant={completed ? "secondary" : "primary"} className={getGameButtonClassName(game.status)} disabled={pending} onClick={onOpen}>
          {pending ? "Открываем..." : getDirectionGameLaunchLabel(game.status)}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </article>
  );
}

export function DirectionGamesGrid({ games, isStartPending, onOpenGame }: { games: DirectionGamesItemDTO[]; isStartPending: boolean; onOpenGame: (game: DirectionGamesItemDTO) => void }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 xl:gap-5">
      {games.map((game) => (
        <GameCard key={game.event_game_id} game={game} pending={isStartPending} onOpen={() => onOpenGame(game)} />
      ))}
    </div>
  );
}

export function DirectionGamesLoadError({ isFetching, message, retryable, title, onRetry }: { isFetching: boolean; message: string; retryable?: boolean | undefined; title?: string | undefined; onRetry: () => void }) {
  return (
    <ErrorMessage
      message={message}
      title={title}
      actionLabel={retryable ? (isFetching ? "Повторяем..." : "Повторить") : undefined}
      onAction={retryable ? onRetry : undefined}
    />
  );
}
