"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Card from "@/components/ui/Card";
import Container from "@/components/ui/Container";
import Typography from "@/components/ui/Typography";
import RequireAuth from "@/features/auth/RequireAuth";
import { useIsAuthorized } from "@/features/auth/useIsAuthorized";
import { eventsApi } from "@/features/events/api";
import { useParticipationStore } from "@/features/participation/store";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { routes } from "@/lib/routes";

const LEADERBOARD_LIMIT = 20;

type LeaderboardPageState = {
  eventId: number;
  directionId: number;
  offset: number;
};

export default function ProgressPage() {
  const params = useParams();
  const router = useRouter();
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
    leaderboardPage.eventId === eventId && leaderboardPage.directionId === directionId
      ? leaderboardPage.offset
      : 0;
  const setLeaderboardOffset = (offset: number) => {
    setLeaderboardPage({ eventId, directionId, offset });
  };

  const { data, isLoading, error } = useQuery({
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

  const summary = data?.data.summary;
  const directionName = data?.data.direction.name;
  const leaderboard = leaderboardQuery.data?.data;
  const hasPreviousLeaderboardPage = leaderboardOffset > 0;
  const hasNextLeaderboardPage = leaderboard
    ? leaderboard.offset + leaderboard.limit < leaderboard.total_participants
    : false;
  const directionProgressPercent = summary
    ? Math.min(100, Math.round((summary.current_direction_score / Math.max(summary.direction_max_score, 1)) * 100))
    : 0;

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
      <Container>
        <div className="mx-auto mt-6 max-w-6xl sm:mt-8">
          <Typography as="h1" size="xl" weight="bold">
            Рейтинг направления
          </Typography>
          <Typography className="mt-2 text-neutral-600" size="sm">
            {directionName ?? "Направление"}
          </Typography>
          <Breadcrumbs
            items={[
              { label: "Мероприятия", href: routes.events },
              { label: "Направления", href: routes.eventDirections(eventId) },
              { label: directionName ?? "Направление", href: routes.eventDirectionGames(eventId, directionId) },
              { label: "Рейтинг" },
            ]}
          />

          {isLoading && <Typography className="mt-4">Загрузка прогресса...</Typography>}
          {error && (
            <Typography className="mt-4 text-red-600" size="sm">
              {getErrorMessage(error, "Не удалось загрузить прогресс")}
            </Typography>
          )}

          {summary && (
            <>
              <div className="mt-6 rounded-[var(--radius-md)] border border-neutral-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Typography size="sm" className="font-medium text-neutral-800">
                    Баллы: {summary.current_direction_score} / {summary.direction_max_score}
                  </Typography>
                  <Typography size="sm" className="text-neutral-500">
                    Призы: {summary.small_reward_unlocked ? "малый доступен" : `малый от ${summary.small_reward_threshold}`} ·{" "}
                    {summary.big_reward_unlocked ? "большой доступен" : `большой от ${summary.big_reward_threshold}`}
                  </Typography>
                </div>
                <div className="mt-3 h-3 w-full overflow-hidden rounded bg-neutral-200">
                  <div className="h-full bg-[var(--color-brand-yellow)]" style={{ width: `${directionProgressPercent}%` }} />
                </div>
              </div>

              <Card className="mt-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Typography as="h2" size="lg" weight="bold">
                      Рейтинг направления
                    </Typography>
                    {leaderboard && (
                      <Typography className="mt-1 text-neutral-600" size="sm">
                        Участников с прогрессом: {leaderboard.total_participants}
                      </Typography>
                    )}
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => leaderboardQuery.refetch()}
                    disabled={leaderboardQuery.isFetching}
                  >
                    {leaderboardQuery.isFetching ? "Обновление..." : "Обновить"}
                  </Button>
                </div>

                {leaderboardQuery.isLoading && (
                  <Typography className="mt-4 text-neutral-600" size="sm">
                    Загрузка рейтинга...
                  </Typography>
                )}

                {leaderboardQuery.error && (
                  <Typography className="mt-4 text-red-600" size="sm">
                    {getErrorMessage(leaderboardQuery.error, "Не удалось загрузить рейтинг")}
                  </Typography>
                )}

                {leaderboard && leaderboard.entries.length > 0 && (
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-[520px] border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-neutral-200 text-left text-neutral-500">
                          <th className="py-2 pr-3 font-medium">Место</th>
                          <th className="px-3 py-2 font-medium">Участник</th>
                          <th className="py-2 pl-3 text-right font-medium">Баллы</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboard.entries.map((entry) => {
                          const isMe = leaderboard.me?.user_id === entry.user_id;
                          return (
                            <tr
                              key={`${entry.rank}-${entry.user_id}`}
                              className={isMe ? "border-b border-neutral-100 bg-yellow-50" : "border-b border-neutral-100"}
                            >
                              <td className="py-2 pr-3 font-medium">#{entry.rank}</td>
                              <td className="px-3 py-2">
                                {entry.full_name}
                                {isMe && <span className="ml-2 text-xs font-medium text-yellow-700">Вы</span>}
                              </td>
                              <td className="py-2 pl-3 text-right font-medium">{entry.direction_score}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {leaderboard && leaderboard.entries.length === 0 && (
                  <Typography className="mt-4 text-neutral-600" size="sm">
                    В рейтинге пока нет участников с прогрессом.
                  </Typography>
                )}

                {leaderboard?.me && !leaderboard.me.in_page && (
                  <div className="mt-4 rounded-[var(--radius-md)] border border-neutral-200 bg-neutral-50 p-3">
                    <Typography size="sm" className="text-neutral-700">
                      Ваше место: #{leaderboard.me.rank}, баллы: {leaderboard.me.direction_score}
                    </Typography>
                  </div>
                )}

                {leaderboard && (
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <Typography className="text-neutral-500" size="sm">
                      Показаны {leaderboard.total_participants === 0 ? 0 : leaderboard.offset + 1}-
                      {Math.min(leaderboard.offset + leaderboard.limit, leaderboard.total_participants)} из{" "}
                      {leaderboard.total_participants}
                    </Typography>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        disabled={!hasPreviousLeaderboardPage || leaderboardQuery.isFetching}
                        onClick={() => setLeaderboardOffset(Math.max(0, leaderboardOffset - LEADERBOARD_LIMIT))}
                      >
                        Назад
                      </Button>
                      <Button
                        variant="secondary"
                        disabled={!hasNextLeaderboardPage || leaderboardQuery.isFetching}
                        onClick={() => setLeaderboardOffset(leaderboardOffset + LEADERBOARD_LIMIT)}
                      >
                        Далее
                      </Button>
                    </div>
                  </div>
                )}
              </Card>

              <div className="mt-5 flex flex-wrap gap-3">
                <Button variant="secondary" onClick={() => router.push(routes.eventDirectionGames(eventId, directionId))}>
                  К списку игр
                </Button>
                <Button variant="secondary" onClick={() => router.push(routes.eventDirectionReward(eventId, directionId))}>
                  К призу
                </Button>
              </div>
            </>
          )}
        </div>
      </Container>
    </RequireAuth>
  );
}
