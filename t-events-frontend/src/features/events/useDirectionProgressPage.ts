import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useIsAuthorized } from "@/features/auth/useIsAuthorized";
import { useParticipationStore } from "@/features/participation/store";
import { getErrorPresentation } from "@/lib/getErrorMessage";
import { queryKeys } from "@/lib/queryKeys";
import { eventsApi } from "./api";
import {
  DIRECTION_LEADERBOARD_LIMIT,
  getLeaderboardOffset,
  getLeaderboardVisibleRange,
  hasNextLeaderboardPage,
  hasPreviousLeaderboardPage,
  type DirectionLeaderboardPageState,
} from "./directionProgress";

export function useDirectionProgressPage() {
  const params = useParams();
  const eventId = Number(params.id);
  const directionId = Number(params.directionId);
  const isAuthorized = useIsAuthorized();
  const { eventId: selectedEventId, directionId: selectedDirectionId, selectDirection, markVerified } = useParticipationStore();
  const [leaderboardPage, setLeaderboardPage] = useState<DirectionLeaderboardPageState>({
    eventId,
    directionId,
    offset: 0,
  });

  const leaderboardOffset = getLeaderboardOffset(leaderboardPage, eventId, directionId);

  const setLeaderboardOffset = (offset: number) => {
    setLeaderboardPage({ eventId, directionId, offset });
  };

  const gamesQuery = useQuery({
    queryKey: queryKeys.events.directionGames(eventId, directionId),
    queryFn: () => eventsApi.directionGames(eventId, directionId),
    enabled: Number.isFinite(eventId) && Number.isFinite(directionId) && isAuthorized,
  });

  const leaderboardQuery = useQuery({
    queryKey: queryKeys.events.directionLeaderboard(eventId, directionId, DIRECTION_LEADERBOARD_LIMIT, leaderboardOffset),
    queryFn: () =>
      eventsApi.directionLeaderboard(eventId, directionId, {
        limit: DIRECTION_LEADERBOARD_LIMIT,
        offset: leaderboardOffset,
      }),
    enabled: Number.isFinite(eventId) && Number.isFinite(directionId) && isAuthorized,
  });

  const directionName = gamesQuery.data?.data.direction.name;
  const leaderboard = leaderboardQuery.data?.data;
  const pageError = leaderboardQuery.error ? getErrorPresentation(leaderboardQuery.error, "Не удалось загрузить рейтинг") : null;

  useEffect(() => {
    if (!Number.isFinite(eventId) || !Number.isFinite(directionId)) return;
    if (selectedEventId !== eventId || selectedDirectionId !== directionId) {
      selectDirection(eventId, directionId, { directionName });
      return;
    }
    if (directionName) markVerified({ directionName });
  }, [directionId, directionName, eventId, markVerified, selectDirection, selectedDirectionId, selectedEventId]);

  return {
    canGoToNextLeaderboardPage: hasNextLeaderboardPage(leaderboard),
    canGoToPreviousLeaderboardPage: hasPreviousLeaderboardPage(leaderboardOffset),
    directionId,
    directionName,
    eventId,
    goToNextLeaderboardPage: () => setLeaderboardOffset(leaderboardOffset + DIRECTION_LEADERBOARD_LIMIT),
    goToPreviousLeaderboardPage: () => setLeaderboardOffset(Math.max(0, leaderboardOffset - DIRECTION_LEADERBOARD_LIMIT)),
    leaderboard,
    leaderboardQuery,
    pageError,
    visibleRange: leaderboard ? getLeaderboardVisibleRange(leaderboard) : null,
  };
}
