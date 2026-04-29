import type { EventDTO, EventStatus } from "@/lib/api/types";

export const eventStatusMeta: Record<EventStatus, { label: string; className: string }> = {
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

export function formatEventDate(value: string | null): string {
  if (!value) return "Не указано";
  return new Date(value).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getEventTimeLabel(event: EventDTO): string {
  if (!event.start_time && !event.end_time) return "Расписание появится позже";
  if (!event.start_time) return `До ${formatEventDate(event.end_time)}`;
  if (!event.end_time) return `С ${formatEventDate(event.start_time)}`;
  return `${formatEventDate(event.start_time)} - ${formatEventDate(event.end_time)}`;
}

export function getStatusMeta(status: EventStatus) {
  return (
    eventStatusMeta[status] ?? {
      label: status,
      className: "bg-[var(--color-brand-panel)] text-[var(--color-brand-muted)]",
    }
  );
}

export function isPastEvent(event: EventDTO) {
  return event.status === "finished" || event.status === "archived";
}
