"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import ErrorMessage from "@/components/ui/ErrorMessage";
import { DirectionCard, DirectionSkeleton } from "@/components/events/DirectionCard";
import RequireAuth from "@/features/auth/RequireAuth";
import { useIsAuthorized } from "@/features/auth/useIsAuthorized";
import { eventsApi } from "@/features/events/api";
import { useParticipationStore } from "@/features/participation/store";
import { getErrorPresentation } from "@/lib/getErrorMessage";
import { queryKeys } from "@/lib/queryKeys";
import { routes } from "@/lib/routes";

export default function DirectionsClient() {
  const params = useParams();
  const router = useRouter();
  const eventId = Number(params.id);
  const isAuthorized = useIsAuthorized();

  const { eventId: selectedEventId, directionId: selectedDirectionId, selectDirection } = useParticipationStore();

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: queryKeys.events.directions(eventId),
    queryFn: () => eventsApi.directions(eventId),
    enabled: Number.isFinite(eventId) && isAuthorized,
  });
  const directions = data?.data ?? [];
  const directionsError = error ? getErrorPresentation(error, "Не удалось загрузить направления") : null;

  return (
    <RequireAuth>
      <div className="min-h-[calc(100vh-4rem)] bg-[var(--color-brand-mist)] pb-16">
        <section className="bg-[var(--color-brand-mist)]">
          <Container>
            <div className="py-8 sm:py-10 lg:py-12">
              <Button
                variant="ghost"
                href={routes.events}
                className="-ml-3 mb-6 min-h-10 gap-2 px-3 text-[15px] font-medium text-[var(--color-brand-muted)] hover:bg-white/70"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                К мероприятиям
              </Button>

              <div>
                <span className="inline-flex rounded-full bg-[var(--color-brand-yellow)] px-3 py-1 text-[13px] font-medium leading-[18px] text-[var(--color-brand-ink)]">
                  Направления
                </span>
                <h1 className="mt-5 max-w-3xl text-balance text-[36px] font-bold leading-10 text-[var(--color-brand-ink)] sm:text-[44px] sm:leading-[48px]">
                  Выберите подходящее направление
                </h1>
                <p className="mt-4 max-w-2xl text-[15px] leading-6 text-[var(--color-brand-graphite)]">
                  Можно начать с привычной темы или попробовать что-то новое. В каждом направлении собраны свои задания и игры: выбирайте то, что интересно сейчас, и переходите к участию.
                </p>
              </div>
            </div>
          </Container>
        </section>

        <Container>
          {isLoading && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Загрузка направлений">
              {[0, 1, 2].map((item) => (
                <DirectionSkeleton key={item} />
              ))}
            </div>
          )}

          {error && (
            <ErrorMessage
              title={directionsError?.title}
              message={directionsError?.message ?? "Не удалось загрузить направления"}
              actionLabel={directionsError?.retryable ? (isFetching ? "Повторяем..." : "Повторить") : undefined}
              onAction={directionsError?.retryable ? () => refetch() : undefined}
            />
          )}

          {!isLoading && !error && directions.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {directions.map((direction) => {
                const isSelected = selectedEventId === eventId && direction.direction_id === selectedDirectionId;
                return (
                  <DirectionCard
                    key={direction.direction_id}
                    direction={direction}
                    selected={isSelected}
                    onOpen={() => {
                      if (!isSelected) {
                        selectDirection(eventId, direction.direction_id, { directionName: direction.name });
                      }
                      router.push(routes.eventDirectionGames(eventId, direction.direction_id));
                    }}
                  />
                );
              })}
            </div>
          )}

          {!isLoading && !error && directions.length === 0 && (
            <div className="rounded-[var(--radius-lg)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
              <h2 className="text-[24px] font-medium leading-7 text-[var(--color-brand-ink)]">Направления пока не добавлены</h2>
              <p className="mt-3 max-w-2xl text-[15px] leading-6 text-[var(--color-brand-graphite)]">
                Организаторы ещё готовят игры для этого мероприятия. Попробуйте вернуться к списку позже.
              </p>
              <Button href={routes.events} variant="secondary" className="mt-5 min-h-12 px-6 text-[15px] font-normal">
                Вернуться к мероприятиям
              </Button>
            </div>
          )}
        </Container>
      </div>
    </RequireAuth>
  );
}

