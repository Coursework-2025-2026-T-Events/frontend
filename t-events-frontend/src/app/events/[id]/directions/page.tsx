"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Container from "@/components/ui/Container";
import { eventsApi } from "@/features/events/api";
import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";
import Button from "@/components/ui/Button";
import ErrorMessage from "@/components/ui/ErrorMessage";
import LoadingState from "@/components/ui/LoadingState";
import PageHeader from "@/components/ui/PageHeader";
import RequireAuth from "@/features/auth/RequireAuth";
import { useParticipationStore } from "@/features/participation/store";
import { useIsAuthorized } from "@/features/auth/useIsAuthorized";
import { getErrorPresentation } from "@/lib/getErrorMessage";
import { routes } from "@/lib/routes";

export default function DirectionsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = Number(params.id);
  const isAuthorized = useIsAuthorized();

  const { eventId: selectedEventId, directionId: selectedDirectionId, selectDirection } = useParticipationStore();

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["directions", eventId],
    queryFn: () => eventsApi.directions(eventId),
    enabled: Number.isFinite(eventId) && isAuthorized,
  });
  const directionsError = error ? getErrorPresentation(error, "Не удалось загрузить направления") : null;

  return (
    <RequireAuth>
      <Container>
        <div className="mt-8">
          <PageHeader title="Выбор направления" description="Выберите одно направление для участия" />

          {isLoading && (
            <LoadingState className="mt-4" message="Загрузка направлений..." />
          )}
          {error && (
            <ErrorMessage
              className="mt-4"
              title={directionsError?.title}
              message={directionsError?.message ?? "Не удалось загрузить направления"}
              actionLabel={directionsError?.retryable ? (isFetching ? "Повторяем..." : "Повторить") : undefined}
              onAction={directionsError?.retryable ? () => refetch() : undefined}
            />
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {data?.data.map((d) => {
              const isSelected = selectedEventId === eventId && d.direction_id === selectedDirectionId;
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
                        selectDirection(eventId, d.direction_id, { directionName: d.name });
                      }
                      router.push(routes.eventDirectionGames(eventId, d.direction_id));
                    }}
                  >
                    {isSelected ? "Открыть игры" : "Выбрать и открыть"}
                  </Button>
                </Card>
              );
            })}
          </div>

          {!isLoading && !error && data?.data.length === 0 && (
            <Card className="mt-6">
              <Typography as="h2" size="lg" weight="bold">
                Направления пока не добавлены
              </Typography>
              <Typography className="mt-2 text-neutral-600" size="sm">
                Организаторы еще не открыли направления для этого мероприятия.
              </Typography>
            </Card>
          )}
        </div>
      </Container>
    </RequireAuth>
  );
}
