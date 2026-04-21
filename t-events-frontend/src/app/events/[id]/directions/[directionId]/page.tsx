"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Container from "@/components/ui/Container";
import { eventsApi } from "@/features/events/api";
import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";
import Button from "@/components/ui/Button";
import RequireAuth from "@/features/auth/RequireAuth";
import { useParticipationStore } from "@/features/participation/store";
import { useRouter } from "next/navigation";
import { useIsAuthorized } from "@/features/auth/useIsAuthorized";

export default function DirectionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = Number(params.id);
  const directionId = Number(params.directionId);
  const isAuthorized = useIsAuthorized();

  const { directionId: selectedDirectionId, selectDirection } = useParticipationStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ["direction", eventId, directionId],
    queryFn: () => eventsApi.directionById(eventId, directionId),
    enabled: Number.isFinite(eventId) && Number.isFinite(directionId) && isAuthorized,
  });

  const isSelected = directionId === selectedDirectionId;

  return (
    <RequireAuth>
      <Container>
        <div className="mt-8">
          {isLoading && <p>Загрузка...</p>}
          {error && <p className="text-red-600">Ошибка загрузки</p>}

          {data && (
            <Card>
              <Typography as="h1" size="xl" weight="bold">
                {data.data.name}
              </Typography>
              <Typography className="mt-2 text-neutral-600" size="sm">
                {isSelected
                  ? "Направление выбрано. Можно перейти к списку игр."
                  : "Это направление не выбрано. Вы можете вернуться и выбрать его."}
              </Typography>

              {!isSelected && (
                <Button
                  className="mt-4"
                  onClick={() => {
                    selectDirection(eventId, directionId);
                    router.push(`/events/${eventId}/directions/${directionId}/games`);
                  }}
                >
                  Выбрать и открыть игры
                </Button>
              )}

              {isSelected && (
                <Button className="mt-4" onClick={() => router.push(`/events/${eventId}/directions/${directionId}/games`)}>
                  Перейти к играм
                </Button>
              )}

              <Button className="mt-3" variant="secondary" onClick={() => router.push(`/events/${eventId}/directions`)}>
                Назад к выбору направления
              </Button>
            </Card>
          )}
        </div>
      </Container>
    </RequireAuth>
  );
}
