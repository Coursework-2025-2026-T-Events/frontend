"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Container from "@/components/ui/Container";
import { eventsApi } from "@/features/events/api";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";
import { getErrorPresentation } from "@/lib/getErrorMessage";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ErrorMessage from "@/components/ui/ErrorMessage";
import LoadingState from "@/components/ui/LoadingState";
import PageHeader from "@/components/ui/PageHeader";
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

export default function EventsPage() {
  const [isAccessDenied] = useState(() =>
    typeof window === "undefined" ? false : new URLSearchParams(window.location.search).get("accessDenied") === "1"
  );
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["events"],
    queryFn: eventsApi.list,
  });
  const events = data?.data ?? [];
  const { eventId: selectedEventId, directionId: selectedDirectionId } = useParticipationStore();
  const selectedEvent = events.find((event) => event.event_id === selectedEventId);
  const eventsError = error ? getErrorPresentation(error, "Не удалось загрузить мероприятия") : null;

  return (
    <Container>
      <div className="mt-8">
        <PageHeader title="Активные мероприятия" />

        {isAccessDenied && (
          <Card className="mt-4 border-amber-200 bg-amber-50" role="alert">
            <Typography size="sm" className="font-medium text-amber-900">
              У вас нет доступа к этому разделу.
            </Typography>
            <Typography size="sm" className="mt-1 text-amber-800">
              Мы открыли доступную страницу с мероприятиями.
            </Typography>
          </Card>
        )}

        {isLoading && (
          <LoadingState className="mt-4" message="Загрузка мероприятий..." />
        )}
        {error && (
          <ErrorMessage
            className="mt-4"
            title={eventsError?.title}
            message={eventsError?.message ?? "Не удалось загрузить мероприятия"}
            actionLabel={eventsError?.retryable ? (isFetching ? "Повторяем..." : "Повторить") : undefined}
            onAction={eventsError?.retryable ? () => refetch() : undefined}
          />
        )}

        {selectedEvent && selectedDirectionId !== null && (
          <Card className="mt-5 border-[var(--color-brand-yellow)] bg-yellow-50">
            <Typography as="h2" size="lg" weight="bold">
              Продолжить участие
            </Typography>
            <Typography className="mt-2 text-neutral-700" size="sm">
              Последний выбор: {selectedEvent.title}. Откройте игры направления или проверьте приз.
            </Typography>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button href={routes.currentParticipation}>
                Открыть текущее участие
              </Button>
              <Button variant="secondary" href={routes.eventDirectionReward(selectedEvent.event_id, selectedDirectionId)}>
                Проверить приз
              </Button>
            </div>
          </Card>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Link key={event.event_id} href={routes.eventDirections(event.event_id)}>
              <Card className="hover:shadow-md transition">
                <Typography as="h2" size="lg" weight="bold">
                  {event.title}
                </Typography>
                <Typography className="mt-2 text-neutral-600" size="sm">
                  {event.description}
                </Typography>
                <Typography className="mt-3 text-neutral-500" size="sm">
                  Статус: {statusLabels[event.status] ?? event.status}
                </Typography>
                <Typography className="mt-1 text-neutral-500" size="sm">
                  Период: {formatEventPeriod(event)}
                </Typography>
              </Card>
            </Link>
          ))}
        </div>

        {!isLoading && !error && events.length === 0 && (
          <EmptyState
            className="mt-6"
            title="Пока нет активных мероприятий"
            description="Когда организаторы опубликуют мероприятие, оно появится здесь."
          />
        )}
      </div>
    </Container>
  );
}
