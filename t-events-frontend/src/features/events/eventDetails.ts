import type { EventDTO, EventStatus } from "@/lib/api/types";

export const eventStatusLabels: Record<EventStatus, string> = {
  draft: "черновик",
  published: "опубликовано",
  active: "активно",
  finished: "завершено",
  archived: "архив",
};

export function formatEventDate(value: string | null): string {
  if (!value) return "не указано";
  return new Date(value).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatEventPeriod(event: EventDTO): string {
  return `${formatEventDate(event.start_time)} - ${formatEventDate(event.end_time)}`;
}

export function getEventStatusLabel(status: EventStatus): string {
  return eventStatusLabels[status] ?? status;
}
