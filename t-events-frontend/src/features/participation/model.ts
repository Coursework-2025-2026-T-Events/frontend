export type ParticipationMeta = {
  eventTitle?: string | undefined;
  directionName?: string | undefined;
};

export type ParticipationSnapshot = {
  eventId: number | null;
  directionId: number | null;
  eventTitle: string | null;
  directionName: string | null;
  selectedAt: string | null;
  verifiedAt: string | null;
};

export function hasParticipationSelection(selection: Pick<ParticipationSnapshot, "eventId" | "directionId">): boolean {
  return selection.eventId !== null && selection.directionId !== null;
}

export function mergeParticipationMeta(
  current: Pick<ParticipationSnapshot, "eventTitle" | "directionName">,
  meta?: ParticipationMeta
) {
  return {
    eventTitle: meta?.eventTitle ?? current.eventTitle,
    directionName: meta?.directionName ?? current.directionName,
  };
}

export function formatParticipationTimestamp(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
