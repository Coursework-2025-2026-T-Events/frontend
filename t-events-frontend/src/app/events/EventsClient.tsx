"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Container from "@/components/ui/Container";
import { eventsApi } from "@/features/events/api";
import { isPastEvent } from "@/features/events/presentation";
import {
  ContinueParticipationCard,
  EventsAccessDeniedNotice,
  EventsCatalogHero,
  EventsEmptyState,
  EventsLoadError,
  EventsLoadingState,
  EventsSection,
} from "@/features/events/EventsViews";
import { useParticipationStore } from "@/features/participation/store";
import { getErrorPresentation } from "@/lib/getErrorMessage";
import { queryKeys } from "@/lib/queryKeys";

export default function EventsClient() {
  const [isAccessDenied] = useState(() =>
    typeof window === "undefined" ? false : new URLSearchParams(window.location.search).get("accessDenied") === "1",
  );
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: queryKeys.events.list,
    queryFn: eventsApi.list,
  });
  const events = data?.data ?? [];
  const { eventId: selectedEventId, directionId: selectedDirectionId } = useParticipationStore();
  const selectedEvent = events.find((event) => event.event_id === selectedEventId);
  const eventsError = error ? getErrorPresentation(error, "Не удалось загрузить мероприятия") : null;
  const upcomingEvents = events.filter((event) => !isPastEvent(event));
  const pastEvents = events.filter(isPastEvent);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--color-brand-mist)] pb-16">
      <EventsCatalogHero />

      <Container>
        <div id="events-list" className="scroll-mt-24 pb-8 sm:pb-10">
          {isAccessDenied && <EventsAccessDeniedNotice />}
          {isLoading && <EventsLoadingState />}
          {error && <EventsLoadError error={eventsError} isFetching={isFetching} onRetry={() => refetch()} />}
          {selectedEvent && selectedDirectionId !== null && (
            <ContinueParticipationCard directionId={selectedDirectionId} event={selectedEvent} />
          )}
          {!isLoading && !error && (
            <>
              <EventsSection events={upcomingEvents} title="Будущие мероприятия" />
              <EventsSection events={pastEvents} title="Прошедшие мероприятия" />
              {events.length === 0 && <EventsEmptyState />}
            </>
          )}
        </div>
      </Container>
    </div>
  );
}
