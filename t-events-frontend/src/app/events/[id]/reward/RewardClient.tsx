"use client";

import { ArrowLeft } from "lucide-react";
import clsx from "clsx";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import RequireAuth from "@/features/auth/RequireAuth";
import {
  RewardHero,
  RewardMainPanel,
  RewardQrPanel,
  RewardQrSkeleton,
  SelectDirectionPrompt,
} from "@/features/reward/RewardViews";
import { useRewardPage } from "@/features/reward/useRewardPage";
import { routes } from "@/lib/routes";

export default function RewardClient() {
  const reward = useRewardPage();

  return (
    <RequireAuth>
      <div className="min-h-[calc(100vh-4rem)] bg-[var(--color-brand-mist)] pb-16">
        <Container>
          <div className="py-4 sm:py-10 lg:py-12">
            {!reward.hasSelectedDirection ? (
              <SelectDirectionPrompt eventId={reward.eventId} />
            ) : (
              <>
                {reward.effectiveDirectionId !== null && (
                  <Button
                    variant="ghost"
                    href={routes.eventDirectionGames(reward.eventId, reward.effectiveDirectionId)}
                    className="-ml-3 mb-4 min-h-10 gap-2 px-3 text-[14px] font-medium text-[var(--color-brand-muted)] hover:bg-white/70 sm:mb-6 sm:text-[15px]"
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden />
                    К играм направления
                  </Button>
                )}

                <RewardHero
                  directionName={reward.directionName}
                  eligibility={reward.eligibility}
                  canGenerateQr={Boolean(reward.canGenerateQr)}
                  hasQr={Boolean(reward.visibleQr)}
                  isGeneratingQr={reward.generateQrMutation.isPending}
                  onGenerateQr={() => reward.generateQrMutation.mutate()}
                />

                <div
                  className={clsx(
                    "mt-5 grid gap-4 sm:mt-6 lg:items-start",
                    reward.hasMainPanel ? "lg:grid-cols-[minmax(0,1fr)_360px]" : "lg:grid-cols-[minmax(0,420px)] lg:justify-center",
                  )}
                >
                  {reward.hasMainPanel && (
                    <RewardMainPanel
                      effectiveDirectionId={reward.effectiveDirectionId}
                      eligibility={reward.eligibility}
                      error={reward.rewardStatusQuery.error}
                      eventId={reward.eventId}
                      isLoading={reward.rewardStatusQuery.isLoading}
                      isRedeemed={reward.isRedeemed}
                      redemption={reward.redemption}
                    />
                  )}

                  {reward.rewardStatusQuery.isLoading && <RewardQrSkeleton />}

                  {reward.eligibility && !reward.rewardStatusQuery.error && !reward.isRedeemed && (
                    <RewardQrPanel
                      canGenerateQr={Boolean(reward.canGenerateQr)}
                      generateQrError={reward.generateQrMutation.error}
                      qrPayload={reward.qrPayload}
                      visibleQr={reward.visibleQr}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        </Container>
      </div>
    </RequireAuth>
  );
}
