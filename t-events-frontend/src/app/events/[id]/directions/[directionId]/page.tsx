"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import ErrorMessage from "@/components/ui/ErrorMessage";
import { DirectionVisual } from "@/components/events/directionVisuals";
import { getDirectionTheme } from "@/components/events/directionTheme";
import RequireAuth from "@/features/auth/RequireAuth";
import { useIsAuthorized } from "@/features/auth/useIsAuthorized";
import { eventsApi } from "@/features/events/api";
import { useParticipationStore } from "@/features/participation/store";
import { getErrorPresentation } from "@/lib/getErrorMessage";
import { routes } from "@/lib/routes";

function DirectionPageSkeleton() {
  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] bg-white shadow-[var(--shadow-card)]" role="status" aria-label="Загрузка направления">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-stretch">
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="h-7 w-32 animate-pulse rounded-full bg-[var(--color-brand-line)]" />
          <div className="mt-6 h-12 w-3/4 animate-pulse rounded-[var(--radius-md)] bg-[var(--color-brand-line)]" />
          <div className="mt-8 h-12 w-56 animate-pulse rounded-[var(--radius-md)] bg-[var(--color-brand-line)]" />
        </div>
        <div className="min-h-[260px] animate-pulse bg-[var(--color-brand-panel)]" />
      </div>
    </div>
  );
}

export default function DirectionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = Number(params.id);
  const directionId = Number(params.directionId);
  const isAuthorized = useIsAuthorized();

  const { eventId: selectedEventId, directionId: selectedDirectionId, selectDirection } = useParticipationStore();

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["direction", eventId, directionId],
    queryFn: () => eventsApi.directionById(eventId, directionId),
    enabled: Number.isFinite(eventId) && Number.isFinite(directionId) && isAuthorized,
  });

  const direction = data?.data;
  const directionTheme = direction ? getDirectionTheme(direction.name) : null;
  const isSelected = selectedEventId === eventId && directionId === selectedDirectionId;
  const directionError = error ? getErrorPresentation(error, "Не удалось загрузить направление") : null;

  const openGames = () => {
    if (!direction) {
      return;
    }

    if (!isSelected) {
      selectDirection(eventId, directionId, { directionName: direction.name });
    }

    router.push(routes.eventDirectionGames(eventId, directionId));
  };

  return (
    <RequireAuth>
      <div className="min-h-[calc(100vh-4rem)] bg-[var(--color-brand-mist)] pb-16">
        <Container>
          <div className="py-8 sm:py-10 lg:py-12">
            <Button
              variant="ghost"
              href={routes.eventDirections(eventId)}
              className="-ml-3 mb-6 min-h-10 gap-2 px-3 text-[15px] font-medium text-[var(--color-brand-muted)] hover:bg-white/70"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              К направлениям
            </Button>

            {isLoading && <DirectionPageSkeleton />}

            {error && (
              <ErrorMessage
                title={directionError?.title}
                message={directionError?.message ?? "Не удалось загрузить направление"}
                actionLabel={directionError?.retryable ? (isFetching ? "Повторяем..." : "Повторить") : undefined}
                onAction={directionError?.retryable ? () => refetch() : undefined}
              />
            )}

            {direction && directionTheme && (
              <section className="overflow-hidden rounded-[var(--radius-lg)] bg-white shadow-[var(--shadow-card)]">
                <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-stretch">
                  <div className="p-6 sm:p-8 lg:p-10">
                    <span className="inline-flex rounded-full bg-[var(--color-brand-yellow)] px-3 py-1 text-[13px] font-medium leading-[18px] text-[var(--color-brand-ink)]">
                      Направление
                    </span>
                    <h1 className="mt-5 max-w-3xl text-balance text-[36px] font-bold leading-10 text-[var(--color-brand-ink)] sm:text-[44px] sm:leading-[48px]">
                      {direction.name}
                    </h1>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                      <Button onClick={openGames} className="min-h-12 px-6 text-[15px] font-normal">
                        {isSelected ? "Перейти к играм" : "Выбрать и открыть игры"}
                        <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                      </Button>
                      <Button
                        href={routes.eventDirections(eventId)}
                        variant="secondary"
                        className="min-h-12 px-6 text-[15px] font-normal"
                      >
                        Другие направления
                      </Button>
                    </div>
                  </div>

                  <DirectionVisual
                    className="h-full min-h-[240px] rounded-none lg:min-h-[300px]"
                    theme={directionTheme}
                    selected={isSelected}
                  />
                </div>
              </section>
            )}
          </div>
        </Container>
      </div>
    </RequireAuth>
  );
}
