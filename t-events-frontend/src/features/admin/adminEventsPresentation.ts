import type { AdminEventDTO, EventStatus } from "@/lib/api/types";

export type AdminEventStatusFilter = "all" | EventStatus;

export type AdminEventStatusMeta = {
  label: string;
  tone: string;
  dot: string;
};

export type AdminEventsSummary = {
  totalEvents: number;
  activeEvents: number;
  draftEvents: number;
  readyEvents: number;
};

export const adminEventStatusMeta: Record<EventStatus, AdminEventStatusMeta> = {
  draft: { label: "Черновик", tone: "bg-[#f1f3f6] text-[var(--color-brand-graphite)]", dot: "bg-[#8a94a6]" },
  published: { label: "Опубликовано", tone: "bg-[#eef5ff] text-[#126df7]", dot: "bg-[#126df7]" },
  active: { label: "Активно", tone: "bg-[#eaf7ee] text-[#237a3b]", dot: "bg-[#35b55b]" },
  finished: { label: "Завершено", tone: "bg-[#fff7cf] text-[var(--color-brand-ink)]", dot: "bg-[#d9a900]" },
  archived: { label: "Архив", tone: "bg-[#fdecec] text-[#b42318]", dot: "bg-[#d04437]" },
};

export const adminEventStatusOptions: Array<{ value: AdminEventStatusFilter; label: string; shortLabel: string }> = [
  { value: "all", label: "Все", shortLabel: "Все" },
  { value: "draft", label: "Черновики", shortLabel: "Черновики" },
  { value: "published", label: "Опубликованные", shortLabel: "Опубл." },
  { value: "active", label: "Активные", shortLabel: "Активные" },
  { value: "finished", label: "Завершенные", shortLabel: "Заверш." },
  { value: "archived", label: "Архив", shortLabel: "Архив" },
];

export function formatAdminEventDateTime(value: string | null) {
  if (!value) return "Не задано";
  return new Date(value).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getAdminEventWindow(event: AdminEventDTO) {
  if (!event.start_time && !event.end_time) return "Расписание не задано";
  return `${formatAdminEventDateTime(event.start_time)} - ${formatAdminEventDateTime(event.end_time)}`;
}

export function sortAdminEvents(events: AdminEventDTO[]) {
  return [...events].sort((left, right) => {
    const leftTime = Date.parse(left.updated_at ?? left.created_at);
    const rightTime = Date.parse(right.updated_at ?? right.created_at);
    return rightTime - leftTime;
  });
}

export function filterAdminEvents(events: AdminEventDTO[], search: string, statusFilter: AdminEventStatusFilter) {
  const normalizedSearch = search.trim().toLowerCase();

  return sortAdminEvents(events).filter((event) => {
    const matchesStatus = statusFilter === "all" || event.status === statusFilter;
    const matchesSearch =
      !normalizedSearch ||
      event.title.toLowerCase().includes(normalizedSearch) ||
      event.description.toLowerCase().includes(normalizedSearch) ||
      String(event.event_id).includes(normalizedSearch);

    return matchesStatus && matchesSearch;
  });
}

export function getAdminEventsSummary(events: AdminEventDTO[]): AdminEventsSummary {
  return {
    totalEvents: events.length,
    activeEvents: events.filter((event) => event.status === "active").length,
    draftEvents: events.filter((event) => event.status === "draft").length,
    readyEvents: getReadyAdminEventsCount(events),
  };
}

export function getReadyAdminEventsCount(events: AdminEventDTO[]) {
  return events.filter(isAdminEventReady).length;
}

export function isAdminEventReady(event: AdminEventDTO) {
  return event.direction_count > 0 && event.game_count > 0;
}

