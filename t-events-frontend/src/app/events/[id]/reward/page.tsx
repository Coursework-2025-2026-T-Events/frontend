"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import Button from "@/components/ui/Button";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Card from "@/components/ui/Card";
import Container from "@/components/ui/Container";
import Typography from "@/components/ui/Typography";
import RequireAuth from "@/features/auth/RequireAuth";
import { useIsAuthorized } from "@/features/auth/useIsAuthorized";
import { rewardApi } from "@/features/reward/api";
import QrCodeDisplay from "@/features/reward/QrCodeDisplay";
import { useParticipationStore } from "@/features/participation/store";
import type { RewardQrDTO, RewardType } from "@/lib/api/types";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { buildRedemptionQrPayload } from "@/lib/qrToken";
import { eventsApi } from "@/features/events/api";
import { routes } from "@/lib/routes";

function rewardTypeLabel(type: RewardType | null): string {
  if (type === "big") return "Большой приз";
  if (type === "small") return "Малый приз";
  return "—";
}

export default function RewardPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = Number(params.id);
  const routeDirectionId = Number(params.directionId);
  const { eventId: selectedEventId, directionId, clear } = useParticipationStore();
  const isAuthorized = useIsAuthorized();
  const [activeQr, setActiveQr] = useState<RewardQrDTO | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const effectiveDirectionId = Number.isFinite(routeDirectionId) ? routeDirectionId : directionId;
  const hasSelectedDirection =
    Number.isFinite(routeDirectionId) || (selectedEventId === eventId && effectiveDirectionId !== null);
  const visibleQr =
    activeQr && activeQr.event_id === eventId && effectiveDirectionId !== null && activeQr.direction_id === effectiveDirectionId
      ? activeQr
      : null;

  useEffect(() => {
    if (selectedEventId !== null && selectedEventId !== eventId) {
      clear();
    }
  }, [clear, eventId, selectedEventId]);

  const rewardStatusQuery = useQuery({
    queryKey: ["reward-status", eventId, effectiveDirectionId],
    queryFn: () => rewardApi.getRewardStatus(eventId, effectiveDirectionId as number),
    enabled: Number.isFinite(eventId) && hasSelectedDirection && isAuthorized,
    refetchInterval: visibleQr ? 30_000 : false,
  });
  const directionQuery = useQuery({
    queryKey: ["direction", eventId, effectiveDirectionId],
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
  const qrPayload = useMemo(() => {
    if (!visibleQr) return "";
    const origin = typeof window === "undefined" ? undefined : window.location.origin;
    return buildRedemptionQrPayload(visibleQr.signed_token, origin);
  }, [visibleQr]);
  const qrSecondsLeft = visibleQr ? Math.max(0, Math.floor((new Date(visibleQr.expires_at).getTime() - now) / 1000)) : 0;
  const isVisibleQrExpired = visibleQr ? qrSecondsLeft <= 0 || visibleQr.status === "expired" : false;

  useEffect(() => {
    if (!visibleQr) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, [visibleQr]);

  const canGenerateQr =
    eligibility &&
    eligibility.is_qr_available &&
    (eligibility.status === "small_unlocked" || eligibility.status === "big_unlocked");

  const isRedeemed = redemption?.is_redeemed === true || eligibility?.status === "redeemed";
  const pointsUntilSmallReward = eligibility
    ? Math.max(0, eligibility.small_reward_threshold - eligibility.current_direction_score)
    : 0;

  const statusBadge = () => {
    if (!eligibility) return null;

    const map: Record<string, { label: string; color: string }> = {
      locked: { label: "Приз пока недоступен", color: "text-neutral-500" },
      small_unlocked: { label: "Малый приз разблокирован", color: "text-yellow-700" },
      big_unlocked: { label: "Большой приз разблокирован", color: "text-green-700" },
      redeemed: { label: "Приз уже получен", color: "text-blue-700" },
    };

    const entry = map[eligibility.status];
    if (!entry) return null;

    return <span className={`font-medium ${entry.color}`}>{entry.label}</span>;
  };

  return (
    <RequireAuth>
      <Container>
        <div className="mt-8 space-y-6">
          <Typography as="h1" size="xl" weight="bold">
            Приз
          </Typography>
          {hasSelectedDirection && (
            <>
              <Typography className="mt-1 text-neutral-600" size="sm">
                {directionName ?? "Выбранное направление"}
              </Typography>
              <Breadcrumbs
                items={[
                  { label: "Мероприятия", href: routes.events },
                  { label: "Направления", href: routes.eventDirections(eventId) },
                  {
                    label: directionName ?? "Направление",
                    href:
                      effectiveDirectionId !== null
                        ? routes.eventDirectionGames(eventId, effectiveDirectionId)
                        : routes.eventDirections(eventId),
                  },
                  { label: "Приз" },
                ]}
              />
            </>
          )}

          {!hasSelectedDirection && (
            <Card>
              <Typography className="text-red-600" size="sm">
                Сначала выберите направление мероприятия, чтобы увидеть статус приза.
              </Typography>
              <Button className="mt-4" variant="secondary" onClick={() => router.push(routes.eventDirections(eventId))}>
                Выбрать направление
              </Button>
            </Card>
          )}

          {hasSelectedDirection && rewardStatusQuery.isLoading && (
            <Typography size="sm" className="text-neutral-600">
              Загружаем статус приза...
            </Typography>
          )}

          {hasSelectedDirection && rewardStatusQuery.error && (
            <Typography className="text-red-600" size="sm">
              {getErrorMessage(rewardStatusQuery.error, "Не удалось загрузить статус приза")}
            </Typography>
          )}

          {eligibility && (
            <Card>
              <Typography as="h2" size="lg" weight="bold">
                Ваш статус
              </Typography>

              <div className="mt-3">{statusBadge()}</div>

              <div className="mt-4">
                <div className="h-2 w-full overflow-hidden rounded bg-neutral-200">
                  <div
                    className="h-full bg-[var(--color-brand-yellow)] transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round(
                          (eligibility.current_direction_score / Math.max(eligibility.big_reward_threshold, 1)) * 100
                        )
                      )}%`,
                    }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-xs text-neutral-500">
                  <span>0</span>
                  <span>{eligibility.small_reward_threshold} (малый)</span>
                  <span>{eligibility.big_reward_threshold} (большой)</span>
                </div>
              </div>
            </Card>
          )}

          {isRedeemed && redemption && (
            <Card>
              <Typography as="h2" size="lg" weight="bold">
                Приз получен
              </Typography>
              <Typography className="mt-2 text-neutral-700" size="sm">
                Тип приза: {rewardTypeLabel(redemption.redeemed_reward_type)}
              </Typography>
              {redemption.redeemed_at && (
                <Typography className="mt-1 text-neutral-500" size="sm">
                  Время выдачи: {new Date(redemption.redeemed_at).toLocaleString("ru-RU")}
                </Typography>
              )}
              <Typography className="mt-3 text-neutral-600" size="sm">
                На этом мероприятии приз уже выдан. Повторная выдача недоступна.
              </Typography>
            </Card>
          )}

          {!isRedeemed && visibleQr && (
            <Card>
              <Typography as="h2" size="lg" weight="bold">
                Ваш QR-код
              </Typography>
              <Typography className="mt-1 text-neutral-600" size="sm">
                Покажите этот код сотруднику стойки выдачи для получения <strong>{rewardTypeLabel(visibleQr.reward_type)}</strong>.
              </Typography>
              <div className="mt-4 flex flex-col items-center gap-4">
                <QrCodeDisplay value={qrPayload} token={visibleQr.signed_token} expiresAt={visibleQr.expires_at} />
                <div className="text-center">
                  <Typography size="sm" className={isVisibleQrExpired ? "text-red-600" : "text-neutral-500"}>
                    {isVisibleQrExpired
                      ? "Срок действия QR истек. Обновите код."
                      : `Осталось: ${Math.floor(qrSecondsLeft / 60)} мин ${String(qrSecondsLeft % 60).padStart(2, "0")} сек`}
                  </Typography>
                </div>
              </div>

              <div className="mt-4 flex justify-center gap-3">
                <Button variant="secondary" onClick={() => generateQrMutation.mutate()} disabled={generateQrMutation.isPending}>
                  {generateQrMutation.isPending ? "Обновление..." : "Обновить QR"}
                </Button>
              </div>

              {generateQrMutation.error && (
                <Typography className="mt-3 text-red-600" size="sm">
                  {getErrorMessage(generateQrMutation.error, "Не удалось обновить QR")}
                </Typography>
              )}
            </Card>
          )}

          {!isRedeemed && !visibleQr && canGenerateQr && (
            <Card>
              <Typography as="h2" size="lg" weight="bold">
                Получить приз
              </Typography>
              <Typography className="mt-2 text-neutral-600" size="sm">
                Сгенерируйте QR-код и покажите его сотруднику стойки выдачи для получения{" "}
                <strong>{rewardTypeLabel(eligibility?.max_available_reward_type ?? null)}</strong>.
              </Typography>
              <Button className="mt-4" onClick={() => generateQrMutation.mutate()} disabled={generateQrMutation.isPending}>
                {generateQrMutation.isPending ? "Генерация..." : "Сгенерировать QR"}
              </Button>
              {generateQrMutation.error && (
                <Typography className="mt-3 text-red-600" size="sm">
                  {getErrorMessage(generateQrMutation.error, "Не удалось создать QR")}
                </Typography>
              )}
            </Card>
          )}

          {!isRedeemed && eligibility && eligibility.status === "locked" && (
            <Card>
              <Typography as="h2" size="lg" weight="bold">
                Продолжайте играть
              </Typography>
              <Typography className="mt-2 text-neutral-600" size="sm">
                Наберите еще <strong>{pointsUntilSmallReward}</strong> баллов для разблокировки малого приза.
              </Typography>
            </Card>
          )}

          {hasSelectedDirection && (
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => router.push(routes.eventDirectionGames(eventId, effectiveDirectionId as number))}>
                К играм
              </Button>
              <Button variant="secondary" onClick={() => router.push(routes.eventDirectionProgress(eventId, effectiveDirectionId as number))}>
                К прогрессу
              </Button>
            </div>
          )}
        </div>
      </Container>
    </RequireAuth>
  );
}
