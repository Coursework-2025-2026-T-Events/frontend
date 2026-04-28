"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronLeft, ChevronRight, Medal, Users } from "lucide-react";
import { useParams } from "next/navigation";
import clsx from "clsx";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import ErrorMessage from "@/components/ui/ErrorMessage";
import RequireAuth from "@/features/auth/RequireAuth";
import { useIsAuthorized } from "@/features/auth/useIsAuthorized";
import { eventsApi } from "@/features/events/api";
import { useParticipationStore } from "@/features/participation/store";
import type { LeaderboardEntryDTO } from "@/lib/api/types";
import { getErrorPresentation } from "@/lib/getErrorMessage";
import { routes } from "@/lib/routes";

const LEADERBOARD_LIMIT = 20;

type LeaderboardPageState = {
  eventId: number;
  directionId: number;
  offset: number;
};

function formatPointsLabel(points: number) {
  const absPoints = Math.abs(points);
  const lastTwoDigits = absPoints % 100;
  const lastDigit = absPoints % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return `${points} баллов`;
  if (lastDigit === 1) return `${points} балл`;
  if (lastDigit >= 2 && lastDigit <= 4) return `${points} балла`;
  return `${points} баллов`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getRankStyle(rank: number) {
  if (rank === 1) return "bg-[var(--color-brand-yellow)] text-[var(--color-brand-ink)]";
  if (rank === 2) return "bg-[#e9edf3] text-[var(--color-brand-ink)]";
  if (rank === 3) return "bg-[#f3dfc7] text-[var(--color-brand-ink)]";
  return "bg-[var(--color-brand-panel)] text-[var(--color-brand-graphite)]";
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-2" role="status" aria-label="Загрузка рейтинга">
      {[0, 1, 2, 3, 4].map((item) => (
        <div key={item} className="h-[72px] animate-pulse rounded-[var(--radius-lg)] bg-white shadow-[var(--shadow-card)]" />
      ))}
    </div>
  );
}

function LeaderboardHero({ directionName }: { directionName?: string }) {
  return (
    <section className="overflow-hidden rounded-[var(--radius-lg)] bg-white shadow-[var(--shadow-card)]">
      <div>
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
          {getInitials(entry.full_name)}
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
        <p className="text-[15px] font-medium leading-5 text-[var(--color-brand-ink)] sm:text-[16px]">{formatPointsLabel(entry.direction_score)}</p>
      </div>
    </article>
  );
}

export default function ProgressPage() {
  const params = useParams();
  const eventId = Number(params.id);
  const directionId = Number(params.directionId);
  const isAuthorized = useIsAuthorized();
  const { eventId: selectedEventId, directionId: selectedDirectionId, selectDirection, markVerified } = useParticipationStore();
  const [leaderboardPage, setLeaderboardPage] = useState<LeaderboardPageState>({
    eventId,
    directionId,
    offset: 0,
  });

  const leaderboardOffset =
    leaderboardPage.eventId === eventId && leaderboardPage.directionId === directionId ? leaderboardPage.offset : 0;

  const setLeaderboardOffset = (offset: number) => {
    setLeaderboardPage({ eventId, directionId, offset });
  };

  const gamesQuery = useQuery({
    queryKey: ["direction-games", eventId, directionId],
    queryFn: () => eventsApi.directionGames(eventId, directionId),
    enabled: Number.isFinite(eventId) && Number.isFinite(directionId) && isAuthorized,
  });

  const leaderboardQuery = useQuery({
    queryKey: ["direction-leaderboard", eventId, directionId, LEADERBOARD_LIMIT, leaderboardOffset],
    queryFn: () =>
      eventsApi.directionLeaderboard(eventId, directionId, {
        limit: LEADERBOARD_LIMIT,
        offset: leaderboardOffset,
      }),
    enabled: Number.isFinite(eventId) && Number.isFinite(directionId) && isAuthorized,
  });

  const directionName = gamesQuery.data?.data.direction.name;
  const leaderboard = leaderboardQuery.data?.data;
  const pageError = leaderboardQuery.error ? getErrorPresentation(leaderboardQuery.error, "Не удалось загрузить рейтинг") : null;
  const hasPreviousLeaderboardPage = leaderboardOffset > 0;
  const hasNextLeaderboardPage = leaderboard
    ? leaderboard.offset + leaderboard.limit < leaderboard.total_participants
    : false;

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
      <div className="min-h-[calc(100vh-4rem)] bg-[var(--color-brand-mist)] pb-16">
        <Container>
          <div className="py-4 sm:py-10 lg:py-12">
            <Button
              variant="ghost"
              href={routes.eventDirectionGames(eventId, directionId)}
              className="-ml-3 mb-4 min-h-10 gap-2 px-3 text-[14px] font-medium text-[var(--color-brand-muted)] hover:bg-white/70 sm:mb-6 sm:text-[15px]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              К играм направления
            </Button>

            <LeaderboardHero directionName={directionName} />

            <div className="mt-5 space-y-4 sm:mt-6">
              <main className="min-w-0">
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
                            {formatPointsLabel(leaderboard.me.direction_score)}
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

                <div className="mt-3 space-y-2 sm:mt-4">
                  {leaderboardQuery.isLoading && <LeaderboardSkeleton />}

                  {leaderboardQuery.error && (
                    <ErrorMessage
                      title={pageError?.title}
                      message={pageError?.message ?? "Не удалось загрузить рейтинг"}
                      actionLabel={pageError?.retryable ? "Повторить" : undefined}
                      onAction={pageError?.retryable ? () => leaderboardQuery.refetch() : undefined}
                    />
                  )}

                  {leaderboard && leaderboard.entries.length > 0 && (
                    <>
                      {leaderboard.entries.map((entry) => (
                        <ParticipantRow
                          key={`${entry.rank}-${entry.user_id}`}
                          entry={entry}
                          isMe={leaderboard.me?.user_id === entry.user_id}
                        />
                      ))}
                    </>
                  )}

                  {leaderboard && leaderboard.entries.length === 0 && (
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
                  )}
                </div>

                {leaderboard && (
                  <div className="mt-4 flex flex-col gap-3 rounded-[var(--radius-lg)] bg-white p-3 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:justify-between sm:p-4">
                    <p className="text-center text-[13px] leading-5 text-[var(--color-brand-muted)] sm:text-left sm:text-[14px]">
                      Показаны {leaderboard.total_participants === 0 ? 0 : leaderboard.offset + 1}-
                      {Math.min(leaderboard.offset + leaderboard.limit, leaderboard.total_participants)} из{" "}
                      {leaderboard.total_participants}
                    </p>
                    <div className="grid grid-cols-2 gap-2 sm:flex">
                      <Button
                        variant="secondary"
                        disabled={!hasPreviousLeaderboardPage || leaderboardQuery.isFetching}
                        onClick={() => setLeaderboardOffset(Math.max(0, leaderboardOffset - LEADERBOARD_LIMIT))}
                        className="min-h-10 gap-2 px-4 text-[14px]"
                      >
                        <ChevronLeft className="h-4 w-4" aria-hidden />
                        Назад
                      </Button>
                      <Button
                        variant="secondary"
                        disabled={!hasNextLeaderboardPage || leaderboardQuery.isFetching}
                        onClick={() => setLeaderboardOffset(leaderboardOffset + LEADERBOARD_LIMIT)}
                        className="min-h-10 gap-2 px-4 text-[14px]"
                      >
                        Далее
                        <ChevronRight className="h-4 w-4" aria-hidden />
                      </Button>
                    </div>
                  </div>
                )}
              </main>

            </div>
          </div>
        </Container>
      </div>
    </RequireAuth>
  );
}
