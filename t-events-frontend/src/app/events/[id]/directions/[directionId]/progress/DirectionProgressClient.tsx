"use client";

import { ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import RequireAuth from "@/features/auth/RequireAuth";
import {
  LeaderboardHero,
  LeaderboardSection,
} from "@/features/events/DirectionProgressViews";
import { useDirectionProgressPage } from "@/features/events/useDirectionProgressPage";
import { routes } from "@/lib/routes";

export default function DirectionProgressClient() {
  const progress = useDirectionProgressPage();

  return (
    <RequireAuth>
      <div className="min-h-[calc(100vh-4rem)] bg-[var(--color-brand-mist)] pb-16">
        <Container>
          <div className="py-4 sm:py-10 lg:py-12">
            <Button
              variant="ghost"
              href={routes.eventDirectionGames(progress.eventId, progress.directionId)}
              className="-ml-3 mb-4 min-h-10 gap-2 px-3 text-[14px] font-medium text-[var(--color-brand-muted)] hover:bg-white/70 sm:mb-6 sm:text-[15px]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              К играм направления
            </Button>

            <LeaderboardHero directionName={progress.directionName} />

            <div className="mt-5 space-y-4 sm:mt-6">
              <LeaderboardSection
                canGoToNextPage={progress.canGoToNextLeaderboardPage}
                canGoToPreviousPage={progress.canGoToPreviousLeaderboardPage}
                isFetching={progress.leaderboardQuery.isFetching}
                isLoading={progress.leaderboardQuery.isLoading}
                leaderboard={progress.leaderboard}
                onNextPage={progress.goToNextLeaderboardPage}
                onPreviousPage={progress.goToPreviousLeaderboardPage}
                pageError={progress.pageError}
                refetch={() => {
                  void progress.leaderboardQuery.refetch();
                }}
                visibleRange={progress.visibleRange}
              />
            </div>
          </div>
        </Container>
      </div>
    </RequireAuth>
  );
}
