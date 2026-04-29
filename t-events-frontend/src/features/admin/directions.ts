import type { AdminEventDirectionDTO, DirectionDTO } from "@/lib/api/types";

export function getAvailableDirections(
  directions: DirectionDTO[] | undefined,
  eventDirections: AdminEventDirectionDTO[] | undefined,
): DirectionDTO[] {
  const attachedIds = new Set(eventDirections?.map((direction) => direction.direction_id) ?? []);
  return directions?.filter((direction) => !attachedIds.has(direction.direction_id)) ?? [];
}
