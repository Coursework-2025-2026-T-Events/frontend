import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useIsAuthorized } from "@/features/auth/useIsAuthorized";
import { eventsApi } from "@/features/events/api";
import { useParticipationStore } from "@/features/participation/store";
import { rewardApi } from "@/features/reward/api";
import type { RewardQrDTO } from "@/lib/api/types";
import { buildRedemptionQrPayload } from "@/lib/qrToken";
import { queryKeys } from "@/lib/queryKeys";
import {
  canGenerateRewardQr,
  getVisibleRewardQr,
  isRewardRedeemed,
  shouldShowRewardMainPanel,
} from "./rewardPresentation";

export function useRewardPage() {
  const params = useParams();
  const eventId = Number(params.id);
  const routeDirectionId = Number(params.directionId);
  const { eventId: selectedEventId, directionId, clear } = useParticipationStore();
  const isAuthorized = useIsAuthorized();
  const [activeQr, setActiveQr] = useState<RewardQrDTO | null>(null);
  const autoQrRequestedRef = useRef(false);

  const effectiveDirectionId = Number.isFinite(routeDirectionId) ? routeDirectionId : directionId;
  const hasSelectedDirection =
    Number.isFinite(routeDirectionId) || (selectedEventId === eventId && effectiveDirectionId !== null);
  const visibleQr = getVisibleRewardQr(activeQr, eventId, effectiveDirectionId);

  useEffect(() => {
    if (selectedEventId !== null && selectedEventId !== eventId) {
      clear();
    }
  }, [clear, eventId, selectedEventId]);

  const rewardStatusQuery = useQuery({
    queryKey: queryKeys.reward.status(eventId, effectiveDirectionId),
    queryFn: () => rewardApi.getRewardStatus(eventId, effectiveDirectionId as number),
    enabled: Number.isFinite(eventId) && hasSelectedDirection && isAuthorized,
    refetchInterval: visibleQr ? 30_000 : false,
  });

  const directionQuery = useQuery({
    queryKey: queryKeys.events.direction(eventId, effectiveDirectionId),
    queryFn: () => eventsApi.directionById(eventId, effectiveDirectionId as number),
    enabled: Number.isFinite(eventId) && hasSelectedDirection && isAuthorized,
  });

  const generateQrMutation = useMutation({
    mutationFn: () => rewardApi.generateQr(eventId, effectiveDirectionId as number),
    onSuccess: (res) => {
      setActiveQr(res.data);
    },
  });

  const eligibility = rewardStatusQuery.data?.data;
  const directionName = directionQuery.data?.data.name;
  const redemption = eligibility?.event_redemption;
  const isRedeemed = isRewardRedeemed(eligibility);

  const qrPayload = useMemo(() => {
    if (!visibleQr) return "";
    const origin = typeof window === "undefined" ? undefined : window.location.origin;
    return buildRedemptionQrPayload(visibleQr.signed_token, origin);
  }, [visibleQr]);

  const canGenerateQr = canGenerateRewardQr(eligibility);
  const hasMainPanel = shouldShowRewardMainPanel({
    isLoading: rewardStatusQuery.isLoading,
    hasError: Boolean(rewardStatusQuery.error),
    isRedeemed,
    eligibility,
  });

  useEffect(() => {
    autoQrRequestedRef.current = false;
  }, [eventId, effectiveDirectionId]);

  useEffect(() => {
    if (!canGenerateQr || visibleQr || generateQrMutation.isPending || autoQrRequestedRef.current) return;

    autoQrRequestedRef.current = true;
    generateQrMutation.mutate();
  }, [canGenerateQr, generateQrMutation, visibleQr]);

  return {
    canGenerateQr,
    directionName,
    effectiveDirectionId,
    eligibility,
    eventId,
    generateQrMutation,
    hasMainPanel,
    hasSelectedDirection,
    isRedeemed,
    qrPayload,
    redemption,
    rewardStatusQuery,
    visibleQr,
  };
}
