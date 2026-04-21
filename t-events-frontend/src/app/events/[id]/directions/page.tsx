"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Container from "@/components/ui/Container";
import { eventsApi } from "@/features/events/api";
import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";
import Button from "@/components/ui/Button";
import RequireAuth from "@/features/auth/RequireAuth";
import { useParticipationStore } from "@/features/participation/store";
import { useIsAuthorized } from "@/features/auth/useIsAuthorized";

export default function DirectionsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = Number(params.id);
  const isAuthorized = useIsAuthorized();

  const { directionId: selectedDirectionId, selectDirection } = useParticipationStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ["directions", eventId],
    queryFn: () => eventsApi.directions(eventId),
    enabled: Number.isFinite(eventId) && isAuthorized,
  });

  return (
    <RequireAuth>
      <Container>
        <div className="mt-8">
          <Typography as="h1" size="xl" weight="bold">
            Выбор направления
          </Typography>
          <Typography className="mt-2 text-neutral-600" size="sm">
            Выберите одно направление для участия
          </Typography>

          {isLoading && <p className="mt-4">Загрузка...</p>}
          {error && <p className="mt-4 text-red-600">Ошибка загрузки</p>}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {data?.data.map((d) => {
              const isSelected = d.direction_id === selectedDirectionId;
              return (
                <Card key={d.direction_id} className={isSelected ? "border-[var(--color-brand-black)]" : ""}>
                  <Typography as="h2" size="lg" weight="bold">
                    {d.name}
                  </Typography>
                  <Typography className="mt-2 text-neutral-600" size="sm">
                    Направление мероприятия
                  </Typography>

                  <Button
                    className="mt-4 w-full"
                    variant={isSelected ? "secondary" : "primary"}
                    onClick={() => {
                      if (!isSelected) {
                        selectDirection(eventId, d.direction_id);
                      }
                      router.push(`/events/${eventId}/directions/${d.direction_id}/games`);
                    }}
                  >
                    {isSelected ? "Открыть игры" : "Выбрать и открыть"}
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      </Container>
    </RequireAuth>
  );
}
