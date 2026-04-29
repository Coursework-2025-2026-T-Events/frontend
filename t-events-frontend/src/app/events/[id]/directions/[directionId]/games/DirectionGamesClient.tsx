"use client";

import { ArrowLeft } from "lucide-react";
import clsx from "clsx";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import ErrorMessage from "@/components/ui/ErrorMessage";
import RequireAuth from "@/features/auth/RequireAuth";
import {
  DirectionActionStrip,
  DirectionGamesGrid,
  DirectionGamesHero,
  DirectionGamesLoadError,
  DirectionProgressSummary,
  EmptyGamesState,
  GamesSkeleton,
  MobileDirectionProgressBar,
} from "@/features/events/DirectionGamesViews";
import { useDirectionGamesPage } from "@/features/events/useDirectionGamesPage";
import { routes } from "@/lib/routes";

export default function DirectionGamesClient() {
  const directionGames = useDirectionGamesPage();
  const shouldShowGames = !directionGames.gamesQuery.isLoading && !directionGames.gamesQuery.error && directionGames.games.length > 0;
  const shouldShowEmpty = !directionGames.gamesQuery.isLoading && !directionGames.gamesQuery.error && directionGames.games.length === 0;

  return (
    <RequireAuth>
      <div className={clsx("min-h-[calc(100vh-4rem)] bg-[var(--color-brand-mist)] sm:pb-16", directionGames.hasUnlockedReward ? "pb-44" : "pb-28")}>
        <Container>
          <div className="py-4 sm:py-10 lg:py-12">
            <Button
              variant="ghost"
              href={routes.eventDirections(directionGames.eventId)}
              className="-ml-3 mb-4 min-h-10 gap-2 px-3 text-[14px] font-medium text-[var(--color-brand-muted)] hover:bg-white/70 sm:mb-6 sm:text-[15px]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              К направлениям
            </Button>

            <DirectionGamesHero directionName={directionGames.directionName} directionTheme={directionGames.directionTheme} />

            <div className="mt-5 space-y-4 sm:mt-6 sm:space-y-5">
              {directionGames.summary && (
                <DirectionProgressSummary className="hidden sm:block" summary={directionGames.summary} />
              )}

              <DirectionActionStrip directionId={directionGames.directionId} eventId={directionGames.eventId} summary={directionGames.summary} />

              {directionGames.gamesQuery.isLoading && <GamesSkeleton />}

              {directionGames.gamesQuery.error && (
                <DirectionGamesLoadError
                  message={directionGames.pageError?.message ?? "Не удалось загрузить игры"}
                  title={directionGames.pageError?.title}
                  retryable={directionGames.pageError?.retryable}
                  isFetching={directionGames.gamesQuery.isFetching}
                  onRetry={() => directionGames.gamesQuery.refetch()}
                />
              )}

              {shouldShowGames && (
                <DirectionGamesGrid
                  games={directionGames.games}
                  isStartPending={directionGames.startSessionMutation.isPending}
                  onOpenGame={directionGames.openGame}
                />
              )}

              {shouldShowEmpty && (
                <EmptyGamesState directionTheme={directionGames.directionTheme} eventId={directionGames.eventId} />
              )}

              {directionGames.startSessionMutation.error && (
                <ErrorMessage message="Не удалось открыть игру" />
              )}
            </div>
          </div>
        </Container>
        {directionGames.summary && (
          <MobileDirectionProgressBar directionId={directionGames.directionId} eventId={directionGames.eventId} summary={directionGames.summary} />
        )}
      </div>
    </RequireAuth>
  );
}
