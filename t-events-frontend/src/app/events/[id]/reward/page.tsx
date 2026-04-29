"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Clock3, LockKeyhole, QrCode } from "lucide-react";
import clsx from "clsx";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import ErrorMessage from "@/components/ui/ErrorMessage";
import RequireAuth from "@/features/auth/RequireAuth";
import { useIsAuthorized } from "@/features/auth/useIsAuthorized";
import { useParticipationStore } from "@/features/participation/store";
import { eventsApi } from "@/features/events/api";
import { rewardApi } from "@/features/reward/api";
import QrCodeDisplay from "@/features/reward/QrCodeDisplay";
import type { RewardEligibilityDTO, RewardQrDTO, RewardType } from "@/lib/api/types";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { buildRedemptionQrPayload } from "@/lib/qrToken";
import { routes } from "@/lib/routes";

function rewardTypeLabel(type: RewardType | null): string {
  if (type === "big") return "Большой приз";
  if (type === "small") return "Малый приз";
  return "Приз";
}

function getRewardTitle(eligibility?: RewardEligibilityDTO) {
  if (!eligibility) return "Проверяем доступ к призу";
  if (eligibility.status === "redeemed") return "Приз уже получен";
  if (eligibility.status === "big_unlocked") return "Большой приз доступен";
  if (eligibility.status === "small_unlocked") return "Малый приз доступен";
  return "Приз пока не открыт";
}

function getRewardDescription(eligibility?: RewardEligibilityDTO) {
  if (!eligibility) return "Проверяем статус получения мерча.";
  if (eligibility.status === "redeemed") return "Мерч уже выдан на стойке. Повторное получение недоступно.";
  if (eligibility.is_qr_available) return "Мерч доступен. Подготовьте QR-код для стойки выдачи.";
  return "Мерч пока недоступен. Статус обновится автоматически, когда приз откроется.";
}

function RewardHero({
  directionName,
  eligibility,
  canGenerateQr,
  hasQr,
  isGeneratingQr,
  onGenerateQr,
}: {
  directionName?: string;
  eligibility?: RewardEligibilityDTO;
  canGenerateQr: boolean;
  hasQr: boolean;
  isGeneratingQr: boolean;
  onGenerateQr: () => void;
}) {
  const unlocked = Boolean(eligibility?.is_qr_available);
  const redeemed = Boolean(eligibility?.status === "redeemed" || eligibility?.event_redemption.is_redeemed);

  return (
    <section className="overflow-hidden rounded-[var(--radius-lg)] bg-white shadow-[var(--shadow-card)]">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-stretch">
        <div className="p-4 sm:p-8 lg:p-10">
          <span className="inline-flex rounded-full bg-[var(--color-brand-yellow)] px-3 py-1 text-[13px] font-medium leading-[18px] text-[var(--color-brand-ink)]">
            Получение приза
          </span>
          <h1 className="mt-4 max-w-3xl text-balance text-[30px] font-bold leading-9 text-[var(--color-brand-ink)] sm:mt-5 sm:text-[44px] sm:leading-[48px]">
            {getRewardTitle(eligibility)}
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-6 text-[var(--color-brand-graphite)]">
            {getRewardDescription(eligibility)}
          </p>
          {directionName && (
            <p className="mt-4 text-[14px] leading-5 text-[var(--color-brand-muted)]">
              Направление: <span className="text-[var(--color-brand-graphite)]">{directionName}</span>
            </p>
          )}
          {canGenerateQr && (
            <Button
              onClick={onGenerateQr}
              disabled={isGeneratingQr}
              className="mt-6 min-h-12 px-6 text-[15px]"
            >
              {isGeneratingQr ? "Готовим QR..." : hasQr ? "Обновить QR" : "Сгенерировать QR"}
            </Button>
          )}
        </div>

        <div className="hidden bg-[var(--color-brand-panel)] p-8 lg:flex lg:items-center">
          <RewardHeroIllustration unlocked={unlocked} redeemed={redeemed} />
        </div>
      </div>
    </section>
  );
}

function RewardHeroIllustration({ unlocked, redeemed }: { unlocked: boolean; redeemed: boolean }) {
  return (
    <div className="relative mx-auto h-[260px] w-full max-w-[300px]" aria-hidden>
      <div className="absolute bottom-9 left-12 h-36 w-32 rounded-[18px] bg-[var(--color-brand-yellow)] shadow-[0_18px_40px_rgba(245,206,0,0.28)]">
        <span className="absolute left-1/2 top-[-18px] h-10 w-16 -translate-x-1/2 rounded-t-full border-[6px] border-b-0 border-[var(--color-brand-ink)]" />
        <span className="absolute left-7 top-12 h-8 w-8 rounded-[10px] bg-[var(--color-brand-ink)] text-center text-[22px] font-bold leading-8 text-[var(--color-brand-yellow)]">
          T
        </span>
        <span className="absolute bottom-8 left-7 h-2 w-20 rounded-full bg-[rgba(16,17,20,0.18)]" />
        <span className="absolute bottom-5 left-7 h-2 w-14 rounded-full bg-[rgba(16,17,20,0.14)]" />
      </div>

      <div className="absolute right-5 top-10 h-28 w-32 rotate-3 rounded-[22px] bg-white shadow-[0_16px_36px_rgba(16,17,20,0.12)]">
        <span className="absolute left-0 top-0 h-10 w-10 rounded-br-[22px] bg-[var(--color-brand-panel)]" />
        <span className="absolute right-0 top-0 h-10 w-10 rounded-bl-[22px] bg-[var(--color-brand-panel)]" />
        <span className="absolute left-8 top-6 h-16 w-16 rounded-[18px] bg-[#4d8dff]" />
        <span className="absolute left-12 top-10 h-2 w-8 rounded-full bg-white/80" />
        <span className="absolute left-10 top-16 h-2 w-12 rounded-full bg-white/60" />
      </div>

      <div className="absolute bottom-12 right-7 h-24 w-24 -rotate-6 rounded-[var(--radius-lg)] bg-white p-3 shadow-[0_14px_32px_rgba(16,17,20,0.12)]">
        <div className="grid h-10 w-10 grid-cols-3 gap-1 rounded-[10px] bg-[var(--color-brand-panel)] p-1.5">
          {Array.from({ length: 9 }).map((_, index) => (
            <span key={index} className="rounded-[2px] bg-[var(--color-brand-ink)] opacity-80" />
          ))}
        </div>
        <span className="mt-3 block h-2 w-14 rounded-full bg-[var(--color-brand-ink)]" />
        <span className="mt-2 block h-2 w-10 rounded-full bg-[var(--color-brand-line)]" />
      </div>

      <div className="absolute right-11 top-32 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[var(--color-brand-ink)] shadow-[0_8px_20px_rgba(16,17,20,0.14)]">
        {redeemed ? (
          <CheckCircle2 className="h-5 w-5 text-[#237a3b]" />
        ) : unlocked ? (
          <QrCode className="h-5 w-5" />
        ) : (
          <LockKeyhole className="h-5 w-5 text-[var(--color-brand-muted)]" />
        )}
      </div>

      <div className="absolute bottom-4 left-12 h-4 w-48 rounded-full bg-[rgba(16,17,20,0.10)] blur-sm" />
      <span className="absolute right-12 top-5 h-3 w-3 rounded-full bg-[#4d8dff]" />
      <span className="absolute left-2 top-32 h-3 w-3 rounded-full bg-[var(--color-brand-yellow)]" />
      <span className="absolute right-4 top-36 h-2.5 w-2.5 rounded-full bg-[var(--color-brand-ink)]" />
    </div>
  );
}

export default function RewardPage() {
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
  const isRedeemed = redemption?.is_redeemed === true || eligibility?.status === "redeemed";

  const qrPayload = useMemo(() => {
    if (!visibleQr) return "";
    const origin = typeof window === "undefined" ? undefined : window.location.origin;
    return buildRedemptionQrPayload(visibleQr.signed_token, origin);
  }, [visibleQr]);

  const canGenerateQr =
    eligibility &&
    eligibility.is_qr_available &&
    (eligibility.status === "small_unlocked" || eligibility.status === "big_unlocked");
  const hasMainPanel =
    rewardStatusQuery.isLoading || Boolean(rewardStatusQuery.error) || isRedeemed || eligibility?.status === "locked";

  useEffect(() => {
    autoQrRequestedRef.current = false;
  }, [eventId, effectiveDirectionId]);

  useEffect(() => {
    if (!canGenerateQr || visibleQr || generateQrMutation.isPending || autoQrRequestedRef.current) return;

    autoQrRequestedRef.current = true;
    generateQrMutation.mutate();
  }, [canGenerateQr, generateQrMutation, visibleQr]);

  return (
    <RequireAuth>
      <div className="min-h-[calc(100vh-4rem)] bg-[var(--color-brand-mist)] pb-16">
        <Container>
          <div className="py-4 sm:py-10 lg:py-12">
            {!hasSelectedDirection ? (
              <section className="rounded-[var(--radius-lg)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-8">
                <h1 className="text-[28px] font-bold leading-8 text-[var(--color-brand-ink)] sm:text-[40px] sm:leading-[44px]">
                  Выберите направление
                </h1>
                <p className="mt-3 max-w-2xl text-[15px] leading-6 text-[var(--color-brand-graphite)]">
                  Сначала откройте направление мероприятия, чтобы перейти к получению доступного приза.
                </p>
                <Button href={routes.eventDirections(eventId)} className="mt-5 min-h-11 px-5 text-[15px]">
                  К направлениям
                </Button>
              </section>
            ) : (
              <>
                {effectiveDirectionId !== null && (
                  <Button
                    variant="ghost"
                    href={routes.eventDirectionGames(eventId, effectiveDirectionId)}
                    className="-ml-3 mb-4 min-h-10 gap-2 px-3 text-[14px] font-medium text-[var(--color-brand-muted)] hover:bg-white/70 sm:mb-6 sm:text-[15px]"
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden />
                    К играм направления
                  </Button>
                )}

                <RewardHero
                  directionName={directionName}
                  eligibility={eligibility}
                  canGenerateQr={Boolean(canGenerateQr)}
                  hasQr={Boolean(visibleQr)}
                  isGeneratingQr={generateQrMutation.isPending}
                  onGenerateQr={() => generateQrMutation.mutate()}
                />

                <div
                  className={clsx(
                    "mt-5 grid gap-4 sm:mt-6 lg:items-start",
                    hasMainPanel ? "lg:grid-cols-[minmax(0,1fr)_360px]" : "lg:grid-cols-[minmax(0,420px)] lg:justify-center"
                  )}
                >
                  {hasMainPanel && (
                    <main className="min-w-0 space-y-4">
                      {rewardStatusQuery.isLoading && (
                        <section className="rounded-[var(--radius-lg)] bg-white p-5 shadow-[var(--shadow-card)]">
                          <p className="text-[15px] leading-6 text-[var(--color-brand-graphite)]">Загружаем статус приза...</p>
                        </section>
                      )}

                      {rewardStatusQuery.error && (
                        <ErrorMessage message={getErrorMessage(rewardStatusQuery.error, "Не удалось загрузить статус приза")} />
                      )}

                      {isRedeemed && redemption && (
                        <section className="rounded-[var(--radius-lg)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
                          <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[#eaf7ee] text-[#237a3b]">
                            <CheckCircle2 className="h-5 w-5" aria-hidden />
                          </div>
                          <h2 className="mt-4 text-[22px] font-medium leading-7 text-[var(--color-brand-ink)]">Приз получен</h2>
                          <p className="mt-2 text-[15px] leading-6 text-[var(--color-brand-graphite)]">
                            Тип приза: {rewardTypeLabel(redemption.redeemed_reward_type)}.
                          </p>
                          {redemption.redeemed_at && (
                            <p className="mt-1 text-[14px] leading-5 text-[var(--color-brand-muted)]">
                              Выдан: {new Date(redemption.redeemed_at).toLocaleString("ru-RU")}
                            </p>
                          )}
                        </section>
                      )}

                      {!isRedeemed && eligibility && eligibility.status === "locked" && (
                        <section className="rounded-[var(--radius-lg)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
                          <h2 className="text-[22px] font-medium leading-7 text-[var(--color-brand-ink)]">Продолжайте играть</h2>
                          <p className="mt-2 text-[15px] leading-6 text-[var(--color-brand-graphite)]">
                            Вернитесь к заданиям направления и проходите игры в удобном темпе.
                          </p>
                          <Button
                            href={routes.eventDirectionGames(eventId, effectiveDirectionId as number)}
                            variant="secondary"
                            className="mt-5 min-h-11 px-5 text-[15px]"
                          >
                            К играм
                          </Button>
                        </section>
                      )}
                    </main>
                  )}

                  {rewardStatusQuery.isLoading && (
                    <aside className="rounded-[var(--radius-lg)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
                      <div className="h-11 w-11 animate-pulse rounded-[var(--radius-md)] bg-[var(--color-brand-panel)]" />
                      <div className="mt-4 h-7 w-40 animate-pulse rounded bg-[var(--color-brand-panel)]" />
                      <div className="mt-3 space-y-2">
                        <div className="h-4 w-full animate-pulse rounded bg-[var(--color-brand-panel)]" />
                        <div className="h-4 w-4/5 animate-pulse rounded bg-[var(--color-brand-panel)]" />
                      </div>
                    </aside>
                  )}

                  {eligibility && !rewardStatusQuery.error && !isRedeemed && (
                    <aside className="rounded-[var(--radius-lg)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
                      {visibleQr ? (
                        <div className="text-center">
                          <h2 className="text-[22px] font-medium leading-7 text-[var(--color-brand-ink)]">Код для получения</h2>
                          <div className="mt-5 flex justify-center">
                            <QrCodeDisplay value={qrPayload} token={visibleQr.signed_token} expiresAt={visibleQr.expires_at} />
                          </div>
                          <div className="mt-5 rounded-[var(--radius-md)] bg-[var(--color-brand-panel)] px-4 py-3">
                            <p className="text-[13px] leading-4 text-[var(--color-brand-muted)]">Ручной код</p>
                            <p className="mt-1 font-mono text-[22px] font-bold leading-7 tracking-[0.08em] text-[var(--color-brand-ink)]">
                              {visibleQr.redeem_code}
                            </p>
                          </div>
                        </div>
                    ) : (
                      <div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-panel)] text-[var(--color-brand-ink)]">
                          {canGenerateQr ? <QrCode className="h-5 w-5" aria-hidden /> : <Clock3 className="h-5 w-5" aria-hidden />}
                        </div>
                        <h2 className="mt-4 text-[22px] font-medium leading-7 text-[var(--color-brand-ink)]">
                          {canGenerateQr ? "Готовим QR" : "QR появится позже"}
                        </h2>
                        <p className="mt-2 text-[15px] leading-6 text-[var(--color-brand-graphite)]">
                          {canGenerateQr ? "Код появится здесь автоматически." : "Вернитесь к играм направления."}
                        </p>
                      </div>
                    )}

                      {generateQrMutation.error && (
                        <ErrorMessage className="mt-4" message={getErrorMessage(generateQrMutation.error, "Не удалось создать QR")} />
                      )}
                    </aside>
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
