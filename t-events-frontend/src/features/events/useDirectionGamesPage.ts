import { useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { getDirectionTheme } from "@/components/events/directionTheme";
import { useIsAuthorized } from "@/features/auth/useIsAuthorized";
import { useParticipationStore } from "@/features/participation/store";
import type { DirectionGamesItemDTO } from "@/lib/api/types";
import { getErrorPresentation } from "@/lib/getErrorMessage";
import { queryKeys } from "@/lib/queryKeys";
import { routes } from "@/lib/routes";
import { eventsApi } from "./api";

export function useDirectionGamesPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = Number(params.id);
  const directionId = Number(params.directionId);
  const isAuthorized = useIsAuthorized();
  const { eventId: selectedEventId, directionId: selectedDirectionId, selectDirection, markVerified } = useParticipationStore();

  const gamesQuery = useQuery({
    queryKey: queryKeys.events.directionGames(eventId, directionId),
    queryFn: () => eventsApi.directionGames(eventId, directionId),
    enabled: Number.isFinite(eventId) && Number.isFinite(directionId) && isAuthorized,
  });

  const startSessionMutation = useMutation({
    mutationFn: (eventGameId: number) => eventsApi.startOrResumeSession(eventId, directionId, eventGameId),
    onSuccess: (_res, eventGameId) => {
      router.push(routes.eventGame(eventId, directionId, eventGameId));
    },
  });

  const directionName = gamesQuery.data?.data.direction.name;
  const directionTheme = getDirectionTheme(directionName ?? "");
  const summary = gamesQuery.data?.data.summary;
  const games = gamesQuery.data?.data.games ?? [];
  const pageError = gamesQuery.error ? getErrorPresentation(gamesQuery.error, "Не удалось загрузить игры") : null;
  const hasUnlockedReward = Boolean(summary?.small_reward_unlocked || summary?.big_reward_unlocked);

  useEffect(() => {
    if (!Number.isFinite(eventId) || !Number.isFinite(directionId)) return;
    if (selectedEventId !== eventId || selectedDirectionId !== directionId) {
      selectDirection(eventId, directionId, { directionName });
      return;
    }
    if (directionName) markVerified({ directionName });
  }, [directionId, directionName, eventId, markVerified, selectDirection, selectedDirectionId, selectedEventId]);

  const openGame = (game: DirectionGamesItemDTO) => {
    startSessionMutation.mutate(game.event_game_id);
  };

  return {
    directionId,
    directionName,
    directionTheme,
    eventId,
    games,
    gamesQuery,
    hasUnlockedReward,
    openGame,
    pageError,
    startSessionMutation,
    summary,
  };
}
