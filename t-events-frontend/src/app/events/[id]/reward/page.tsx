"use client";

import { useParams } from "next/navigation";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";
import Button from "@/components/ui/Button";
import RequireAuth from "@/features/auth/RequireAuth";
import { useParticipationStore } from "@/features/participation/store";
import { useQuery } from "@tanstack/react-query";
import { eventsApi } from "@/features/events/api";
import { useIsAuthorized } from "@/features/auth/useIsAuthorized";
import { getErrorMessage } from "@/lib/getErrorMessage";

export default function RewardPage() {
  const params = useParams();
  const eventId = Number(params.id);
  const { directionId } = useParticipationStore();
  const isAuthorized = useIsAuthorized();

  const hasSelectedDirection = directionId !== null;

  const rewardQuery = useQuery({
    queryKey: ["reward-summary", eventId, directionId],
    queryFn: () => eventsApi.directionGames(eventId, directionId as number),
    enabled: Number.isFinite(eventId) && hasSelectedDirection && isAuthorized,
  });

  const summary = rewardQuery.data?.data.summary;
  const rewardStatus = summary
    ? summary.big_reward_unlocked
      ? "Доступен большой приз"
      : summary.small_reward_unlocked
        ? "Доступен малый приз"
        : "Приз пока недоступен"
    : "Приз пока недоступен";

  return (
    <RequireAuth>
      <Container>
        <div className="mt-8">
          <Typography as="h1" size="xl" weight="bold">
            Приз
          </Typography>

          {!hasSelectedDirection && (
            <Typography className="mt-3 text-red-600" size="sm">
              Сначала выберите направление мероприятия, чтобы увидеть статус приза.
            </Typography>
          )}

          {rewardQuery.isLoading && hasSelectedDirection && (
            <Typography className="mt-3" size="sm">
              Загружаем статус приза...
            </Typography>
          )}

          {rewardQuery.error && (
            <Typography className="mt-3 text-red-600" size="sm">
              {getErrorMessage(rewardQuery.error, "Не удалось загрузить статус приза")}
            </Typography>
          )}

          <Card className="mt-6">
            <Typography as="h2" size="lg" weight="bold">
              Ваш статус
            </Typography>
            <Typography className="mt-2 text-neutral-600" size="sm">
              {rewardStatus}
            </Typography>

            {summary && (
              <div className="mt-4 space-y-2">
                <Typography className="text-neutral-700" size="sm">
                  Баллы мероприятия: {summary.current_event_score} / {summary.event_max_score}
                </Typography>
                <Typography className="text-neutral-700" size="sm">
                  Малый приз: {summary.current_event_score} / {summary.small_reward_threshold}
                </Typography>
                <Typography className="text-neutral-700" size="sm">
                  Большой приз: {summary.current_event_score} / {summary.big_reward_threshold}
                </Typography>
              </div>
            )}

            <Button
              className="mt-4"
              disabled={!summary || (!summary.small_reward_unlocked && !summary.big_reward_unlocked)}
            >
              Получить приз (QR)
            </Button>
          </Card>
        </div>
      </Container>
    </RequireAuth>
  );
}
