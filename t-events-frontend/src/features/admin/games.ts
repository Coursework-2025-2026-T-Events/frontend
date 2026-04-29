import type { AdminEventDirectionDTO, AdminEventGameDTO } from "@/lib/api/types";

export type GamesByDirection = {
  direction: AdminEventDirectionDTO;
  games: AdminEventGameDTO[];
};

export function groupGamesByDirection(
  eventDirections: AdminEventDirectionDTO[],
  eventGames: AdminEventGameDTO[],
): {
  gamesByDirection: GamesByDirection[];
  gamesWithoutDirection: AdminEventGameDTO[];
} {
  const directionIds = new Set(eventDirections.map((direction) => direction.direction_id));

  return {
    gamesByDirection: eventDirections.map((direction) => ({
      direction,
      games: eventGames.filter((game) => game.direction_id === direction.direction_id),
    })),
    gamesWithoutDirection: eventGames.filter((game) => !directionIds.has(game.direction_id)),
  };
}
