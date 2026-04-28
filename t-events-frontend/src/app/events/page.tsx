"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Bot, BrainCircuit, Clock3, Code2, Database, PlayCircle, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import EmptyState from "@/components/ui/EmptyState";
import ErrorMessage from "@/components/ui/ErrorMessage";
import { eventsApi } from "@/features/events/api";
import { useParticipationStore } from "@/features/participation/store";
import { getErrorPresentation } from "@/lib/getErrorMessage";
import { routes } from "@/lib/routes";
import type { EventDTO, EventStatus } from "@/lib/api/types";

const statusMeta: Record<EventStatus, { label: string; className: string }> = {
  draft: {
    label: "Черновик",
    className: "bg-[var(--color-brand-panel)] text-[var(--color-brand-muted)]",
  },
  published: {
    label: "Опубликовано",
    className: "bg-[#edf3ff] text-[#126df7]",
  },
  active: {
    label: "Активно",
    className: "bg-[var(--color-brand-yellow)] text-[var(--color-brand-ink)]",
  },
  finished: {
    label: "Завершено",
    className: "bg-[var(--color-brand-panel)] text-[var(--color-brand-graphite)]",
  },
  archived: {
    label: "Архив",
    className: "bg-[var(--color-brand-panel)] text-[var(--color-brand-muted)]",
  },
};

const coverIcons: LucideIcon[] = [Code2, Bot, ShieldCheck, Database, BrainCircuit];

function formatEventDate(value: string | null): string {
  if (!value) return "Не указано";
  return new Date(value).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getEventTimeLabel(event: EventDTO): string {
  if (!event.start_time && !event.end_time) return "Расписание появится позже";
  if (!event.start_time) return `До ${formatEventDate(event.end_time)}`;
  if (!event.end_time) return `С ${formatEventDate(event.start_time)}`;
  return `${formatEventDate(event.start_time)} - ${formatEventDate(event.end_time)}`;
}

function getStatusMeta(status: EventStatus) {
  return (
    statusMeta[status] ?? {
      label: status,
      className: "bg-[var(--color-brand-panel)] text-[var(--color-brand-muted)]",
    }
  );
}

function isPastEvent(event: EventDTO) {
  return event.status === "finished" || event.status === "archived";
}

function EventCover({ eventId }: { eventId: number }) {
  const Icon = coverIcons[eventId % coverIcons.length];

  return (
    <div className="relative h-36 overflow-hidden rounded-t-[var(--radius-lg)] bg-[var(--color-brand-panel)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(254,221,46,0.55),transparent_30%),radial-gradient(circle_at_85%_25%,rgba(18,109,247,0.18),transparent_24%),linear-gradient(135deg,#ffffff_0%,#f6f7f9_100%)]" />
      <div className="absolute left-5 top-5 h-16 w-20 rounded-[var(--radius-md)] bg-[var(--color-brand-ink)] p-2 shadow-[var(--shadow-card)]">
        <div className="mb-2 flex gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-brand-yellow)]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#4d8dff]" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
        </div>
        <div className="space-y-1">
          <span className="block h-1.5 w-10 rounded-full bg-white/70" />
          <span className="block h-1.5 w-14 rounded-full bg-[var(--color-brand-yellow)]" />
          <span className="block h-1.5 w-8 rounded-full bg-[#4d8dff]" />
        </div>
      </div>
      <div className="absolute right-5 top-5 flex h-14 w-14 items-center justify-center rounded-[var(--radius-md)] bg-white text-[var(--color-brand-ink)] shadow-[var(--shadow-card)]">
        <Icon className="h-7 w-7" aria-hidden />
      </div>
      <div className="absolute bottom-4 left-5 right-5 grid grid-cols-3 gap-2">
        <span className="h-8 rounded-[var(--radius-md)] bg-white/90" />
        <span className="h-8 rounded-[var(--radius-md)] bg-[var(--color-brand-yellow)]" />
        <span className="h-8 rounded-[var(--radius-md)] bg-white/90" />
      </div>
    </div>
  );
}

function EventCard({ event }: { event: EventDTO }) {
  const status = getStatusMeta(event.status);

  return (
    <Link
      href={routes.eventDirections(event.event_id)}
      className="group flex min-h-[360px] flex-col overflow-hidden rounded-[var(--radius-lg)] bg-white shadow-[var(--shadow-card)] outline-none transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] focus-visible:ring-2 focus-visible:ring-[var(--color-brand-yellow)]"
    >
      <EventCover eventId={event.event_id} />
      <div className="flex flex-1 flex-col p-5">
        <span className={["mb-4 inline-flex w-fit rounded-full px-3 py-1 text-[13px] font-medium leading-[18px]", status.className].join(" ")}>
          {status.label}
        </span>
        <h3 className="line-clamp-3 text-[19px] font-medium leading-6 text-[var(--color-brand-ink)]">{event.title}</h3>
        <p className="mt-3 line-clamp-3 text-[15px] leading-6 text-[var(--color-brand-graphite)]">{event.description}</p>
        <div className="mt-auto pt-5">
          <div className="flex gap-2 text-[13px] leading-[18px] text-[var(--color-brand-muted)]">
            <Clock3 className="mt-0.5 h-4 w-4 flex-none text-[var(--color-brand-graphite)]" aria-hidden />
            <span>{getEventTimeLabel(event)}</span>
          </div>
          <div className="mt-4 inline-flex items-center text-[15px] font-medium leading-5 text-[#126df7]">
            Выбрать
            <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
          </div>
        </div>
      </div>
    </Link>
  );
}

function EventSkeleton() {
  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] bg-white shadow-[var(--shadow-card)]" aria-hidden>
      <div className="h-36 bg-[#edf0f4]" />
      <div className="p-5">
        <div className="h-7 w-28 rounded-full bg-[#edf0f4]" />
        <div className="mt-5 h-6 w-4/5 rounded bg-[#edf0f4]" />
        <div className="mt-3 space-y-2">
          <div className="h-4 rounded bg-[#edf0f4]" />
          <div className="h-4 w-5/6 rounded bg-[#edf0f4]" />
          <div className="h-4 w-2/3 rounded bg-[#edf0f4]" />
        </div>
        <div className="mt-8 h-4 w-2/3 rounded bg-[#edf0f4]" />
      </div>
    </div>
  );
}

export default function EventsPage() {
  const [isAccessDenied] = useState(() =>
    typeof window === "undefined" ? false : new URLSearchParams(window.location.search).get("accessDenied") === "1",
  );
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["events"],
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
      <section className="relative overflow-hidden bg-[var(--color-brand-mist)]">
        <Container>
          <div className="py-8 sm:py-10 lg:py-12">
            <div className="relative overflow-hidden rounded-[var(--radius-lg)] bg-transparent">
              <div className="grid lg:min-h-[420px] lg:grid-cols-[minmax(0,1fr)_minmax(440px,560px)] lg:items-center lg:gap-8">
                <div className="relative z-10 px-0 py-8 sm:py-10 lg:flex lg:flex-col lg:justify-center lg:py-14 lg:pr-8">
                  <span className="inline-flex w-fit rounded-full bg-[var(--color-brand-yellow)] px-3 py-1 text-[13px] font-medium leading-[18px] text-[var(--color-brand-ink)]">
                    Каталог
                  </span>
                  <h1 className="mt-5 max-w-[560px] text-balance text-[36px] font-bold leading-10 text-[var(--color-brand-ink)] sm:text-[44px] sm:leading-[48px] lg:max-w-[520px]">
                    Активные мероприятия
                  </h1>
                  <p className="mt-4 max-w-[520px] text-[15px] leading-6 text-[var(--color-brand-graphite)]">
                    Выберите событие, откройте направления и переходите к играм. Всё важное для участия собрано в карточках.
                  </p>
                </div>

                <div className="relative min-h-[280px] overflow-hidden bg-[var(--color-brand-mist)] sm:min-h-[340px] lg:min-h-[420px]">
                  <div className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-10 bg-gradient-to-r from-[var(--color-brand-mist)]/90 to-transparent lg:block" />
                  <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-[var(--color-brand-mist)] via-[var(--color-brand-mist)]/95 to-transparent lg:hidden" />
                  <div className="pointer-events-none absolute inset-x-0 top-0 z-10 hidden h-28 bg-gradient-to-b from-[var(--color-brand-mist)] via-[var(--color-brand-mist)]/95 to-transparent lg:block" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-[var(--color-brand-mist)] to-transparent" />
                  <Image
                    src="/images/events-catalog-hero.png"
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 560px, 100vw"
                    priority
                    unoptimized
                    className="object-contain object-center lg:translate-y-4"
                    aria-hidden
                  />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Container>
        <div id="events-list" className="scroll-mt-24 pb-8 sm:pb-10">
          {isAccessDenied && (
            <div
              className="rounded-[var(--radius-md)] bg-[#fff7d6] p-4 text-[15px] leading-6 text-[var(--color-brand-graphite)]"
              role="alert"
            >
              <p className="font-medium text-[var(--color-brand-ink)]">У вас нет доступа к этому разделу.</p>
              <p className="mt-1">Мы открыли страницу с мероприятиями, где можно выбрать доступное участие.</p>
            </div>
          )}

          {isLoading && (
            <div className="mt-2">
              <div className="flex items-center gap-3 text-[15px] leading-6 text-[var(--color-brand-graphite)]" role="status">
                <span className="h-4 w-4 rounded-full border-2 border-[var(--color-brand-yellow)] border-t-transparent animate-spin" />
                Загружаем мероприятия
              </div>
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2].map((item) => (
                  <EventSkeleton key={item} />
                ))}
              </div>
            </div>
          )}

          {error && (
            <ErrorMessage
              className="mt-2"
              title={eventsError?.title}
              message={eventsError?.message ?? "Не удалось загрузить мероприятия"}
              actionLabel={eventsError?.retryable ? (isFetching ? "Повторяем..." : "Повторить") : undefined}
              onAction={eventsError?.retryable ? () => refetch() : undefined}
            />
          )}

          {selectedEvent && selectedDirectionId !== null && (
            <section className="mt-6 grid gap-4 rounded-[var(--radius-lg)] bg-white p-5 shadow-[var(--shadow-card)] sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-yellow)] text-[var(--color-brand-ink)]">
                <PlayCircle className="h-6 w-6" aria-hidden />
              </span>
              <div>
                <h2 className="text-[24px] font-medium leading-7 text-[var(--color-brand-ink)]">Продолжайте с выбранного мероприятия</h2>
                <p className="mt-2 max-w-2xl text-[15px] leading-6 text-[var(--color-brand-graphite)]">
                  Вернитесь к играм или проверьте, доступен ли приз.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  href={routes.eventDirectionGames(selectedEvent.event_id, selectedDirectionId)}
                  variant="dark"
                  className="min-h-12 px-6 text-[15px] font-normal"
                >
                  Продолжить игры
                </Button>
                <Button
                  variant="secondary"
                  href={routes.eventDirectionReward(selectedEvent.event_id, selectedDirectionId)}
                  className="min-h-12 px-6 text-[15px] font-normal"
                >
                  Проверить приз
                </Button>
              </div>
            </section>
          )}

          {!isLoading && !error && upcomingEvents.length > 0 && (
            <section className="mt-8">
              <h2 className="text-[24px] font-medium leading-7 text-[var(--color-brand-ink)]">Будущие мероприятия</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.event_id} event={event} />
                ))}
              </div>
            </section>
          )}

          {!isLoading && !error && pastEvents.length > 0 && (
            <section className="mt-10">
              <h2 className="text-[24px] font-medium leading-7 text-[var(--color-brand-ink)]">Прошедшие мероприятия</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {pastEvents.map((event) => (
                  <EventCard key={event.event_id} event={event} />
                ))}
              </div>
            </section>
          )}

          {!isLoading && !error && events.length === 0 && (
            <EmptyState
              className="mt-7 bg-white"
              title="Пока нет активных мероприятий"
              description="Когда организаторы опубликуют мероприятие, оно появится здесь."
            />
          )}
        </div>
      </Container>
    </div>
  );
}
