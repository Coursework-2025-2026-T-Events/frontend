import { ChevronLeft, ChevronRight, Medal, Users } from "lucide-react";
import clsx from "clsx";
import Button from "@/components/ui/Button";
import ErrorMessage from "@/components/ui/ErrorMessage";
import {
  formatLeaderboardPoints,
  getLeaderboardInitials,
} from "@/features/events/directionProgress";
import type { DirectionLeaderboardDTO, LeaderboardEntryDTO } from "@/lib/api/types";
import type { ErrorPresentation } from "@/lib/getErrorMessage";

type VisibleRange = {
  from: number;
  to: number;
  total: number;
};

function getRankStyle(rank: number): string {
  if (rank === 1) return "bg-[var(--color-brand-yellow)] text-[var(--color-brand-ink)]";
  if (rank === 2) return "bg-[#e9edf3] text-[var(--color-brand-ink)]";
  if (rank === 3) return "bg-[#f3dfc7] text-[var(--color-brand-ink)]";
  return "bg-[var(--color-brand-panel)] text-[var(--color-brand-graphite)]";
}

export function LeaderboardSkeleton() {
  return (
    <div className="space-y-2" role="status" aria-label="Загрузка рейтинга">
      {[0, 1, 2, 3, 4].map((item) => (
        <div key={item} className="h-[72px] animate-pulse rounded-[var(--radius-lg)] bg-white shadow-[var(--shadow-card)]" />
      ))}
    </div>
  );
}

export function LeaderboardHero({ directionName }: { directionName?: string | undefined }) {
  return (
    <section className="overflow-hidden rounded-[var(--radius-lg)] bg-white shadow-[var(--shadow-card)]">
      <div className="p-4 sm:p-8 lg:p-10">
        <span className="inline-flex rounded-full bg-[var(--color-brand-yellow)] px-3 py-1 text-[13px] font-medium leading-[18px] text-[var(--color-brand-ink)]">
          Рейтинг направления
        </span>
        <h1 className="mt-4 max-w-3xl text-balance text-[28px] font-bold leading-8 text-[var(--color-brand-ink)] sm:mt-5 sm:text-[44px] sm:leading-[48px]">
          Сравните свой результат с другими участниками
        </h1>
        <p className="mt-3 max-w-2xl text-[14px] leading-[22px] text-[var(--color-brand-graphite)] sm:text-[15px] sm:leading-6">
          Здесь видно, сколько баллов уже набрали участники в направлении
          {directionName ? ` «${directionName}»` : ""}. Рейтинг помогает понять свой темп и вернуться к играм, если хочется подняться выше.
        </p>
      </div>
    </section>
  );
}

function ParticipantRow({
  entry,
  isMe,
}: {
  entry: LeaderboardEntryDTO;
  isMe: boolean;
}) {
  const isTopThree = entry.rank <= 3;

  return (
    <article
      className={clsx(
        "grid grid-cols-[2.25rem_minmax(0,1fr)] items-center gap-x-3 gap-y-1 rounded-[var(--radius-lg)] bg-white px-3 py-3 shadow-[var(--shadow-card)] sm:grid-cols-[72px_minmax(0,1fr)_140px] sm:gap-3 sm:px-4",
        isMe && "ring-2 ring-[var(--color-brand-yellow)]"
      )}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <span className={clsx("flex h-9 w-9 items-center justify-center rounded-full text-[14px] font-medium sm:h-10 sm:w-10", getRankStyle(entry.rank))}>
          {isTopThree ? <Medal className="h-5 w-5" aria-hidden /> : entry.rank}
        </span>
      </div>

      <div className="flex min-w-0 items-center gap-3">
        <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-panel)] text-[13px] font-medium text-[var(--color-brand-graphite)] sm:flex">
          {getLeaderboardInitials(entry.full_name)}
        </div>
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="truncate text-[15px] font-medium leading-5 text-[var(--color-brand-ink)] sm:text-[16px]">
              {entry.full_name}
            </h2>
            {isMe && (
              <span className="shrink-0 rounded-full bg-[#fff7cf] px-2 py-0.5 text-[12px] leading-4 text-[var(--color-brand-ink)]">
                Вы
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[13px] leading-5 text-[var(--color-brand-muted)]">Место {entry.rank}</p>
        </div>
      </div>

      <div className="col-start-2 text-left sm:col-auto sm:text-right">
        <p className="text-[15px] font-medium leading-5 text-[var(--color-brand-ink)] sm:text-[16px]">{formatLeaderboardPoints(entry.direction_score)}</p>
      </div>
    </article>
  );
}

function LeaderboardHeader({ leaderboard }: { leaderboard: DirectionLeaderboardDTO | undefined }) {
  return (
    <section className="rounded-[var(--radius-lg)] bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-[22px] font-medium leading-7 text-[var(--color-brand-ink)]">Участники</h2>
          <p className="mt-1 text-[15px] leading-6 text-[var(--color-brand-graphite)]">
            Посмотрите, какое место занимаете вы и другие участники направления.
          </p>
        </div>
        {leaderboard?.me ? (
          <div className="grid w-full grid-cols-2 gap-2 rounded-[var(--radius-md)] bg-[var(--color-brand-panel)] p-2 md:w-auto md:min-w-[280px]">
            <div className="rounded-[var(--radius-md)] bg-white px-3 py-2">
              <span className="text-[12px] leading-4 text-[var(--color-brand-muted)]">Ваше место</span>
              <p className="mt-0.5 text-[17px] font-medium leading-6 text-[var(--color-brand-ink)]">#{leaderboard.me.rank}</p>
            </div>
            <div className="rounded-[var(--radius-md)] bg-[#fff7cf] px-3 py-2">
              <span className="text-[12px] leading-4 text-[var(--color-brand-graphite)]">Баллы</span>
              <p className="mt-0.5 text-[17px] font-medium leading-6 text-[var(--color-brand-ink)]">
                {formatLeaderboardPoints(leaderboard.me.direction_score)}
              </p>
            </div>
          </div>
        ) : (
          <span className="rounded-[var(--radius-md)] bg-[var(--color-brand-panel)] px-3 py-2 text-[14px] leading-5 text-[var(--color-brand-graphite)] md:shrink-0">
            Ваш результат появится после первой игры
          </span>
        )}
      </div>
    </section>
  );
}

function EmptyLeaderboard() {
  return (
    <section className="rounded-[var(--radius-lg)] bg-white p-5 text-center shadow-[var(--shadow-card)] sm:p-8">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-brand-panel)] text-[var(--color-brand-muted)]">
        <Users className="h-5 w-5" aria-hidden />
      </div>
      <h2 className="mt-4 text-[20px] font-medium leading-6 text-[var(--color-brand-ink)]">
        В рейтинге пока никого нет
      </h2>
      <p className="mx-auto mt-2 max-w-md text-[15px] leading-6 text-[var(--color-brand-graphite)]">
        Когда участники начнут проходить игры, их результаты появятся здесь.
      </p>
    </section>
  );
}

export function LeaderboardSection({
  canGoToNextPage,
  canGoToPreviousPage,
  isFetching,
  isLoading,
  leaderboard,
  onNextPage,
  onPreviousPage,
  pageError,
  refetch,
  visibleRange,
}: {
  canGoToNextPage: boolean;
  canGoToPreviousPage: boolean;
  isFetching: boolean;
  isLoading: boolean;
  leaderboard: DirectionLeaderboardDTO | undefined;
  onNextPage: () => void;
  onPreviousPage: () => void;
  pageError: ErrorPresentation | null;
  refetch: () => void;
  visibleRange: VisibleRange | null;
}) {
  return (
    <main className="min-w-0">
      <LeaderboardHeader leaderboard={leaderboard} />

      <div className="mt-3 space-y-2 sm:mt-4">
        {isLoading && <LeaderboardSkeleton />}

        {pageError && (
          <ErrorMessage
            title={pageError.title}
            message={pageError.message}
            actionLabel={pageError.retryable ? "Повторить" : undefined}
            onAction={pageError.retryable ? refetch : undefined}
          />
        )}

        {leaderboard?.entries.map((entry) => (
          <ParticipantRow
            key={`${entry.rank}-${entry.user_id}`}
            entry={entry}
            isMe={leaderboard.me?.user_id === entry.user_id}
          />
        ))}

        {leaderboard && leaderboard.entries.length === 0 && <EmptyLeaderboard />}
      </div>

      {leaderboard && (
        <div className="mt-4 flex flex-col gap-3 rounded-[var(--radius-lg)] bg-white p-3 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:justify-between sm:p-4">
          <p className="text-center text-[13px] leading-5 text-[var(--color-brand-muted)] sm:text-left sm:text-[14px]">
            Показаны {visibleRange?.from ?? 0}-{visibleRange?.to ?? 0} из {visibleRange?.total ?? 0}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Button
              variant="secondary"
              disabled={!canGoToPreviousPage || isFetching}
              onClick={onPreviousPage}
              className="min-h-10 gap-2 px-4 text-[14px]"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Назад
            </Button>
            <Button
              variant="secondary"
              disabled={!canGoToNextPage || isFetching}
              onClick={onNextPage}
              className="min-h-10 gap-2 px-4 text-[14px]"
            >
              Далее
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
