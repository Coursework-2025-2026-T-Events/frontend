"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Container from "@/components/ui/Container";
import ErrorMessage from "@/components/ui/ErrorMessage";
import LoadingState from "@/components/ui/LoadingState";
import PageHeader from "@/components/ui/PageHeader";
import Typography from "@/components/ui/Typography";
import { eventsApi } from "@/features/events/api";
import { getErrorPresentation } from "@/lib/getErrorMessage";
import { useParticipationStore } from "@/features/participation/store";
import { routes } from "@/lib/routes";
import type { EventDTO, EventStatus } from "@/lib/api/types";

const statusLabels: Record<EventStatus, string> = {
  draft: "черновик",
  published: "опубликовано",
  active: "активно",
  finished: "завершено",
  archived: "архив",
};

function formatEventDate(value: string | null): string {
  if (!value) return "не указано";
  return new Date(value).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatEventPeriod(event: EventDTO): string {
  return `${formatEventDate(event.start_time)} - ${formatEventDate(event.end_time)}`;
}

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { eventId: selectedEventId, directionId: selectedDirectionId, selectDirection } = useParticipationStore();

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["event", id],
    queryFn: () => eventsApi.getById(id),
    enabled: Number.isFinite(id),
  });
  const directionsQuery = useQuery({
    queryKey: ["directions", id],
    queryFn: () => eventsApi.directions(id),
    enabled: Number.isFinite(id),
  });

  if (isLoading) {
    return (
      <Container>
        <LoadingState className="mt-6" message="Загрузка мероприятия..." />
      </Container>
    );
  }

  if (error || !data) {
    const eventError = getErrorPresentation(error, "Не удалось загрузить мероприятие");
    return (
      <Container>
        <ErrorMessage
          className="mt-6"
          title={eventError.title}
          message={eventError.message}
          actionLabel={eventError.retryable ? (isFetching ? "Повторяем..." : "Повторить") : undefined}
          onAction={eventError.retryable ? () => refetch() : undefined}
        />
      </Container>
    );
  }

  const event = data.data;
  const directions = directionsQuery.data?.data ?? [];
  const hasSelectedDirection = selectedEventId === event.event_id && selectedDirectionId !== null;

  return (
    <Container>
      <div className="mt-8">
        <PageHeader title={event.title} description={event.description} />

        <Card className="mt-5">
          <Typography as="h2" size="lg" weight="bold">
            Сведения о мероприятии
          </Typography>
          <Typography className="mt-3 text-neutral-700" size="sm">
            Статус: {statusLabels[event.status] ?? event.status}
          </Typography>
          <Typography className="mt-1 text-neutral-700" size="sm">
            Период проведения: {formatEventPeriod(event)}
          </Typography>
        </Card>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button href={hasSelectedDirection ? routes.eventDirectionGames(event.event_id, selectedDirectionId) : routes.eventDirections(event.event_id)}>
            {hasSelectedDirection ? "Продолжить игры" : "Выбрать направление"}
          </Button>
          {hasSelectedDirection && (
            <Button variant="secondary" href={routes.eventDirectionReward(event.event_id, selectedDirectionId)}>
              Проверить приз
            </Button>
          )}
        </div>

        {directions.length > 0 && (
          <Card className="mt-6">
            <Typography as="h2" size="lg" weight="bold">
              Направления
            </Typography>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {directions.map((direction) => {
                const isSelected = selectedDirectionId === direction.direction_id && selectedEventId === event.event_id;
                return (
                  <button
                    key={direction.direction_id}
                    type="button"
                    onClick={() => {
                      selectDirection(event.event_id, direction.direction_id, {
                        eventTitle: event.title,
                        directionName: direction.name,
                      });
                      router.push(routes.eventDirectionGames(event.event_id, direction.direction_id));
                    }}
                    className={`rounded-[var(--radius-md)] border p-4 text-left transition-colors hover:bg-neutral-50 ${
                      isSelected ? "border-[var(--color-brand-black)] bg-yellow-50" : "border-neutral-200 bg-white"
                    }`}
                  >
                    <span className="block font-medium text-neutral-950">{direction.name}</span>
                    <span className="mt-1 block text-sm text-neutral-600">
                      {isSelected ? "Выбрано. Открыть игры" : "Выбрать и открыть игры"}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>
        )}

        <div className="mt-6">
          <Link className="text-sm text-neutral-600 underline-offset-4 hover:underline" href={routes.events}>
            Вернуться к списку мероприятий
          </Link>
        </div>
      </div>
    </Container>
  );
}
