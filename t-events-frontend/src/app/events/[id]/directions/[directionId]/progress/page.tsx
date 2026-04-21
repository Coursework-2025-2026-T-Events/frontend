"use client";

import { useQuery } from "@tanstack/react-query";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";
import RequireAuth from "@/features/auth/RequireAuth";
import { useParticipationStore } from "@/features/participation/store";
import { useParams, useRouter } from "next/navigation";
import { eventsApi } from "@/features/events/api";
import Button from "@/components/ui/Button";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { useAuth } from "@/features/auth/AuthProvider";

export default function ProgressPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = Number(params.id);
  const directionId = Number(params.directionId);
  const { user, isBootstrapping } = useAuth();
  const isAuthorized = !isBootstrapping && !!user;

  const { directionId: selectedDirectionId } = useParticipationStore();
  const isSelected = directionId === selectedDirectionId;

  const { data, isLoading, error } = useQuery({
    queryKey: ["direction-games", eventId, directionId],
    queryFn: () => eventsApi.directionGames(eventId, directionId),
    enabled: Number.isFinite(eventId) && Number.isFinite(directionId) && isSelected && isAuthorized,
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
            Прогресс направления
          </Typography>

          {!isSelected && (
            <Typography className="mt-2 text-red-600" size="sm">
              Это направление не выбрано. Прогресс недоступен.
            </Typography>
          )}

          {isSelected && isLoading && <Typography className="mt-4">Загрузка прогресса...</Typography>}
          {isSelected && error && (
            <Typography className="mt-4 text-red-600" size="sm">
              {getErrorMessage(error, "Не удалось загрузить прогресс")}
            </Typography>
          )}

          {isSelected && summary && (
            <>
              <div className="mt-6 h-3 w-full overflow-hidden rounded bg-neutral-200">
                <div className="h-full bg-[var(--color-brand-yellow)]" style={{ width: `${eventProgressPercent}%` }} />
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Card>
                  <Typography as="h2" size="lg" weight="bold">
                    Баллы направления
                  </Typography>
                  <Typography className="mt-2 text-neutral-700" size="sm">
                    {summary.current_direction_score} / {summary.direction_max_score}
                  </Typography>
                </Card>

                <Card>
                  <Typography as="h2" size="lg" weight="bold">
                    Баллы мероприятия
                  </Typography>
                  <Typography className="mt-2 text-neutral-700" size="sm">
                    {summary.current_event_score} / {summary.event_max_score}
                  </Typography>
                </Card>

                <Card>
                  <Typography as="h2" size="lg" weight="bold">
                    Малый приз
                  </Typography>
                  <Typography className="mt-2 text-neutral-700" size="sm">
                    Порог: {summary.small_reward_threshold}
                  </Typography>
                  <Typography className="mt-1 text-neutral-700" size="sm">
                    Статус: {summary.small_reward_unlocked ? "доступен" : "не доступен"}
                  </Typography>
                </Card>

                <Card>
                  <Typography as="h2" size="lg" weight="bold">
                    Большой приз
                  </Typography>
                  <Typography className="mt-2 text-neutral-700" size="sm">
                    Порог: {summary.big_reward_threshold}
                  </Typography>
                  <Typography className="mt-1 text-neutral-700" size="sm">
                    Статус: {summary.big_reward_unlocked ? "доступен" : "не доступен"}
                  </Typography>
                </Card>
              </div>

              <Button className="mt-6" variant="secondary" onClick={() => router.push(`/events/${eventId}/directions/${directionId}/games`)}>
                К списку игр
              </Button>
            </>
          )}
        </div>
      </Container>
    </RequireAuth>
  );
}
