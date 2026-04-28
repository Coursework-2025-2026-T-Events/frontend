"use client";

import { useEffect, useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
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
import { formatParticipationTimestamp, hasParticipationSelection } from "@/features/participation/model";
import { routes } from "@/lib/routes";
import { getErrorMessage } from "@/lib/getErrorMessage";

export default function CurrentParticipationPage() {
  const router = useRouter();
  const isAuthorized = useIsAuthorized();
  const { eventId, directionId, eventTitle, directionName, selectedAt, verifiedAt, markVerified, clear } = useParticipationStore();
  const hasSelection = hasParticipationSelection({ eventId, directionId });

  const eventQuery = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => eventsApi.getById(eventId as number),
    enabled: hasSelection && isAuthorized,
  });

  const gamesQuery = useQuery({
    queryKey: ["direction-games", eventId, directionId],
    queryFn: () => eventsApi.directionGames(eventId as number, directionId as number),
    enabled: hasSelection && isAuthorized,
  });

  const startSessionMutation = useMutation({
    mutationFn: (eventGameId: number) =>
      eventsApi.startOrResumeSession(eventId as number, directionId as number, eventGameId),
    onSuccess: (_res, eventGameId) => {
      router.push(routes.eventGame(eventId as number, directionId as number, eventGameId));
    },
  });

  const nextGame = useMemo(() => {
    const games = gamesQuery.data?.data.games ?? [];
    return games.find((game) => game.status === "in_progress") ?? games.find((game) => game.status === "not_started");
  }, [gamesQuery.data]);

  const summary = gamesQuery.data?.data.summary;
  const event = eventQuery.data?.data;
  const direction = gamesQuery.data?.data.direction;
  const rewardAvailable = summary?.small_reward_unlocked || summary?.big_reward_unlocked;
  const selectedAtLabel = formatParticipationTimestamp(selectedAt);
  const verifiedAtLabel = formatParticipationTimestamp(verifiedAt);

  useEffect(() => {
    if (!event || !direction) return;
    markVerified({ eventTitle: event.title, directionName: direction.name });
  }, [direction, event, markVerified]);

  return (
    <RequireAuth>
      <Container>
        <div className="mx-auto mt-8 max-w-4xl space-y-5">
          <PageHeader title="Текущее участие" description="Быстрый возврат к выбранному направлению, прогрессу и призу." />

          {hasSelection && (eventTitle || directionName || selectedAtLabel) && (
            <div className="rounded-[var(--radius-md)] border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700">
              <div className="font-medium">
                {eventTitle ?? "Выбранное мероприятие"}
                {directionName ? ` · ${directionName}` : ""}
              </div>
              <div className="mt-1 text-neutral-500">
                {selectedAtLabel ? `Выбрано: ${selectedAtLabel}` : "Выбор сохранен"}
                {verifiedAtLabel ? ` · Проверено: ${verifiedAtLabel}` : ""}
              </div>
            </div>
          )}

          {!hasSelection && (
            <EmptyState
              title="Направление еще не выбрано"
              description="Откройте список мероприятий и выберите направление для участия."
              actionLabel="К мероприятиям"
              actionHref={routes.events}
            />
          )}

          {hasSelection && (eventQuery.isLoading || gamesQuery.isLoading) && (
            <LoadingState message="Загружаем участие..." />
          )}

          {(eventQuery.error || gamesQuery.error) && (
            <ErrorMessage
              message={getErrorMessage(eventQuery.error ?? gamesQuery.error, "Не удалось загрузить текущее участие")}
              actionLabel="Сбросить выбор"
              onAction={clear}
            />
          )}

          {hasSelection && event && direction && summary && (
            <Card>
              <Typography as="h2" size="lg" weight="bold">
                {event.title}
              </Typography>
              <Typography className="mt-1 text-neutral-600" size="sm">
                {direction.name}
              </Typography>

              <div className="mt-4 rounded-[var(--radius-md)] border border-neutral-200 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="font-medium text-neutral-800">
                    {summary.current_direction_score} / {summary.direction_max_score} баллов
                  </span>
                  <span className="text-neutral-500">
                    {rewardAvailable ? "Приз доступен" : `Малый приз от ${summary.small_reward_threshold}`}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {nextGame && (
                  <Button onClick={() => startSessionMutation.mutate(nextGame.event_game_id)} disabled={startSessionMutation.isPending}>
                    {nextGame.status === "in_progress" ? "Продолжить игру" : "Начать игру"}
                  </Button>
                )}
                <Button
                  variant={nextGame ? "secondary" : "primary"}
                  href={routes.eventDirectionGames(eventId as number, directionId as number)}
                >
                  Все игры
                </Button>
                <Button variant="secondary" href={routes.eventDirectionReward(eventId as number, directionId as number)}>
                  Приз
                </Button>
                <Button variant="secondary" href={routes.eventDirectionProgress(eventId as number, directionId as number)}>
                  Рейтинг
                </Button>
                <Button variant="ghost" onClick={clear}>
                  Сбросить выбор
                </Button>
              </div>
            </Card>
          )}
        </div>
      </Container>
    </RequireAuth>
  );
}
