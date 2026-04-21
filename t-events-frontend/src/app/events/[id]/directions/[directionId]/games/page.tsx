"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";
import Button from "@/components/ui/Button";
import RequireAuth from "@/features/auth/RequireAuth";
import { useParticipationStore } from "@/features/participation/store";
import { useParams, useRouter } from "next/navigation";
import { eventsApi } from "@/features/events/api";
import type { DirectionGamesItemDTO } from "@/lib/api/types";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { useAuth } from "@/features/auth/AuthProvider";

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

export default function GamesPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = Number(params.id);
  const directionId = Number(params.directionId);
  const { user, isBootstrapping } = useAuth();
  const isAuthorized = !isBootstrapping && !!user;

  const { directionId: selectedDirectionId } = useParticipationStore();
  const isSelected = directionId === selectedDirectionId;

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["direction-games", eventId, directionId],
    queryFn: () => eventsApi.directionGames(eventId, directionId),
    enabled: Number.isFinite(eventId) && Number.isFinite(directionId) && isSelected && isAuthorized,
  });

  const startSessionMutation = useMutation({
    mutationFn: (eventGameId: number) => eventsApi.startOrResumeSession(eventId, directionId, eventGameId),
    onSuccess: (res, eventGameId) => {
      const sessionId = res.data.session_id;
      router.push(`/events/${eventId}/directions/${directionId}/games/${eventGameId}?sessionId=${sessionId}`);
    },
  });

  const summary = data?.data.summary;
  const eventProgressPercent = summary
    ? Math.min(100, Math.round((summary.current_event_score / Math.max(summary.event_max_score, 1)) * 100))
    : 0;

  return (
    <RequireAuth>
      <Container>
        <div className="mt-8">
          <Typography as="h1" size="xl" weight="bold">
            Игры направления
          </Typography>

          {!isSelected && (
            <Typography className="mt-2 text-red-600" size="sm">
              Это направление не выбрано. Вернитесь и выберите направление.
            </Typography>
          )}

          {isSelected && summary && (
            <Card className="mt-6">
              <Typography as="h2" size="lg" weight="bold">
                Общий прогресс
              </Typography>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <Typography size="sm" className="text-neutral-700">
                  По направлению: {summary.current_direction_score} / {summary.direction_max_score}
                </Typography>
                <Typography size="sm" className="text-neutral-700">
                  По мероприятию: {summary.current_event_score} / {summary.event_max_score}
                </Typography>
              </div>

              <div className="mt-4 h-2 w-full overflow-hidden rounded bg-neutral-200">
                <div className="h-full bg-[var(--color-brand-yellow)]" style={{ width: `${eventProgressPercent}%` }} />
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <Typography size="sm" className="text-neutral-700">
                  Малый приз: {summary.current_event_score} / {summary.small_reward_threshold} (
                  {summary.small_reward_unlocked ? "доступен" : "не доступен"})
                </Typography>
                <Typography size="sm" className="text-neutral-700">
                  Большой приз: {summary.current_event_score} / {summary.big_reward_threshold} (
                  {summary.big_reward_unlocked ? "доступен" : "не доступен"})
                </Typography>
              </div>
            </Card>
          )}

          {isSelected && isLoading && <Typography className="mt-4">Загрузка списка игр...</Typography>}
          {isSelected && error && (
            <Typography className="mt-4 text-red-600" size="sm">
              {getErrorMessage(error, "Не удалось загрузить список игр")}
            </Typography>
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data?.data.games.map((game) => (
              <Card key={game.event_game_id}>
                <Typography as="h2" size="lg" weight="bold">
                  {game.title}
                </Typography>
                <Typography className="mt-2 text-neutral-600" size="sm">
                  {game.description}
                </Typography>
                <Typography className="mt-3 text-neutral-700" size="sm">
                  Статус: {getStatusLabel(game.status)}
                </Typography>
                <Typography className="mt-1 text-neutral-700" size="sm">
                  Баллы: {game.progress.current_score} / {game.progress.max_score}
                </Typography>
                <Typography className="mt-1 text-neutral-700" size="sm">
                  Вопросы: {game.progress.answered_questions} / {game.progress.total_questions}
                </Typography>

                <Button
                  className="mt-4 w-full"
                  disabled={game.status === "completed" || startSessionMutation.isPending}
                  onClick={() => startSessionMutation.mutate(game.event_game_id)}
                >
                  {startSessionMutation.isPending ? "Открытие..." : getLaunchLabel(game.status)}
                </Button>
              </Card>
            ))}
          </div>

          {data?.data.games.length === 0 && (
            <Typography className="mt-4 text-neutral-600" size="sm">
              В этом направлении пока нет игр.
            </Typography>
          )}

          {startSessionMutation.error && (
            <Typography className="mt-4 text-red-600" size="sm">
              {getErrorMessage(startSessionMutation.error, "Не удалось открыть игру")}
            </Typography>
          )}

          <div className="mt-6 flex gap-3">
            <Button variant="secondary" onClick={() => router.push(`/events/${eventId}/directions/${directionId}/progress`)}>
              Перейти к прогрессу
            </Button>
            <Button variant="secondary" onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? "Обновление..." : "Обновить"}
            </Button>
          </div>
        </div>
      </Container>
    </RequireAuth>
  );
}
