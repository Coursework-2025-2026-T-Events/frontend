"use client";

import { useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Card from "@/components/ui/Card";
import Container from "@/components/ui/Container";
import EmptyState from "@/components/ui/EmptyState";
import ErrorMessage from "@/components/ui/ErrorMessage";
import LoadingState from "@/components/ui/LoadingState";
import PageHeader from "@/components/ui/PageHeader";
import Typography from "@/components/ui/Typography";
import RequireAuth from "@/features/auth/RequireAuth";
import { useIsAuthorized } from "@/features/auth/useIsAuthorized";
import { eventsApi } from "@/features/events/api";
import { useParticipationStore } from "@/features/participation/store";
import type { DirectionGamesItemDTO, DirectionProgressSummaryDTO } from "@/lib/api/types";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { routes } from "@/lib/routes";

function getStatusLabel(status: DirectionGamesItemDTO["status"]) {
  if (status === "completed") return "Завершена";
  if (status === "in_progress") return "В процессе";
  return "Не начата";
}

function getLaunchLabel(status: DirectionGamesItemDTO["status"]) {
  if (status === "completed") return "Игра завершена";
  if (status === "in_progress") return "Продолжить";
  return "Начать";
}

function DirectionProgressSummary({ summary }: { summary: DirectionProgressSummaryDTO }) {
  const max = Math.max(summary.direction_max_score, 1);
  const fillPct = Math.min(100, (summary.current_direction_score / max) * 100);
  const smallMarkerPct = Math.min(100, (summary.small_reward_threshold / max) * 100);
  const bigMarkerPct = Math.min(100, (summary.big_reward_threshold / max) * 100);

  return (
    <div className="mt-4 rounded-[var(--radius-md)] border border-neutral-200 bg-white p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Typography size="sm" className="font-medium text-neutral-800">
          {summary.current_direction_score} / {summary.direction_max_score} баллов
        </Typography>
        <Typography size="sm" className="text-neutral-500">
          Призы: {summary.small_reward_unlocked ? "малый доступен" : `малый от ${summary.small_reward_threshold}`} ·{" "}
          {summary.big_reward_unlocked ? "большой доступен" : `большой от ${summary.big_reward_threshold}`}
        </Typography>
      </div>
        <div className="relative mt-2 h-3 w-full overflow-hidden rounded bg-neutral-200">
          <div className="h-full bg-[var(--color-brand-yellow)] transition-[width] duration-300" style={{ width: `${fillPct}%` }} />
          <div
            className="pointer-events-none absolute top-0 h-full w-px bg-neutral-800/40"
            style={{ left: `${smallMarkerPct}%` }}
            title="Порог малого приза"
          />
          <div
            className="pointer-events-none absolute top-0 h-full w-px bg-neutral-800/40"
            style={{ left: `${bigMarkerPct}%` }}
            title="Порог большого приза"
          />
        </div>
      <Typography className="mt-1 hidden text-neutral-500 sm:block" size="sm">
        Пороги: {summary.small_reward_threshold} / {summary.big_reward_threshold}
      </Typography>
    </div>
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

  const summary = data?.data.summary;
  const directionName = data?.data.direction.name;
  const recommendedGame = data?.data.games.find((game) => game.status === "in_progress")
    ?? data?.data.games.find((game) => game.status === "not_started");
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
      <Container>
        <div className="mx-auto mt-6 max-w-6xl sm:mt-8">
          <PageHeader title="Игры направления" description={directionName} />
          <Breadcrumbs
            items={[
              { label: "Мероприятия", href: routes.events },
              { label: "Направления", href: routes.eventDirections(eventId) },
              { label: directionName ?? "Направление" },
            ]}
          />

          {summary && <DirectionProgressSummary summary={summary} />}

          {hasUnlockedReward && (
            <Card className="mt-5 border-[var(--color-brand-yellow)] bg-yellow-50">
              <Typography as="h2" size="lg" weight="bold">
                Следующий шаг
              </Typography>
              <Typography className="mt-2 text-neutral-700" size="sm">
                Приз уже доступен. Можно получить QR-код или продолжить набирать баллы.
              </Typography>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button onClick={() => router.push(routes.eventDirectionReward(eventId, directionId))}>
                  Получить приз
                </Button>
              </div>
            </Card>
          )}

          {isLoading && <LoadingState className="mt-4" message="Загрузка списка игр..." />}
          {error && (
            <ErrorMessage
              className="mt-4"
              message={getErrorMessage(error, "Не удалось загрузить список игр")}
              actionLabel={isFetching ? "Повторяем..." : "Повторить"}
              onAction={() => refetch()}
            />
          )}

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data?.data.games.map((game) => (
              <Card key={game.event_game_id}>
                <Typography as="h2" size="lg" weight="bold">
                  {game.title}
                </Typography>
                <Typography className="mt-2 line-clamp-2 text-neutral-600" size="sm">
                  {game.description}
                </Typography>
                <Typography className="mt-3 text-neutral-600" size="sm">
                  Статус: {getStatusLabel(game.status)}
                </Typography>
                <Typography className="mt-1 text-neutral-600" size="sm">
                  Баллы: {game.progress.current_score} / {game.progress.max_score}
                </Typography>
                <Typography className="mt-1 text-neutral-600" size="sm">
                  Отвечено вопросов: {game.progress.answered_questions} / {game.progress.total_questions}
                </Typography>

                <Button
                  className={`mt-4 w-full ${recommendedGame?.event_game_id === game.event_game_id ? "ring-2 ring-[var(--color-brand-yellow)] ring-offset-2" : ""}`}
                  disabled={game.status === "completed" || startSessionMutation.isPending}
                  onClick={() => startSessionMutation.mutate(game.event_game_id)}
                >
                  {startSessionMutation.isPending ? "Открытие..." : getLaunchLabel(game.status)}
                </Button>
              </Card>
            ))}
          </div>

          {Array.isArray(data?.data.games) && data.data.games.length === 0 && (
            <EmptyState
              className="mt-4"
              title="В этом направлении пока нет игр"
              description="Когда организаторы добавят игры, они появятся здесь."
            />
          )}

          {startSessionMutation.error && (
            <ErrorMessage className="mt-4" message={getErrorMessage(startSessionMutation.error, "Не удалось открыть игру")} />
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => router.push(routes.eventDirectionProgress(eventId, directionId))}>
              К прогрессу
            </Button>
            <Button variant="secondary" onClick={() => router.push(routes.eventDirectionReward(eventId, directionId))}>
              К призу
            </Button>
          </div>
        </div>
      </Container>
    </RequireAuth>
  );
}
