import { CheckCircle2, Clock3, LockKeyhole, QrCode } from "lucide-react";
import Button from "@/components/ui/Button";
import ErrorMessage from "@/components/ui/ErrorMessage";
import QrCodeDisplay from "@/features/reward/QrCodeDisplay";
import {
  getRewardDescription,
  getRewardTitle,
  getRewardTypeLabel,
} from "@/features/reward/rewardPresentation";
import type { RewardEligibilityDTO, RewardQrDTO } from "@/lib/api/types";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { routes } from "@/lib/routes";

export function RewardHero({
  directionName,
  eligibility,
  canGenerateQr,
  hasQr,
  isGeneratingQr,
  onGenerateQr,
}: {
  directionName?: string | undefined;
  eligibility?: RewardEligibilityDTO | undefined;
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
            <Button onClick={onGenerateQr} disabled={isGeneratingQr} className="mt-6 min-h-12 px-6 text-[15px]">
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

export function SelectDirectionPrompt({ eventId }: { eventId: number }) {
  return (
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
  );
}

export function RewardMainPanel({
  effectiveDirectionId,
  eligibility,
  error,
  eventId,
  isLoading,
  isRedeemed,
  redemption,
}: {
  effectiveDirectionId: number | null;
  eligibility?: RewardEligibilityDTO | undefined;
  error: unknown;
  eventId: number;
  isLoading: boolean;
  isRedeemed: boolean;
  redemption: RewardEligibilityDTO["event_redemption"] | undefined;
}) {
  return (
    <main className="min-w-0 space-y-4">
      {isLoading && (
        <section className="rounded-[var(--radius-lg)] bg-white p-5 shadow-[var(--shadow-card)]">
          <p className="text-[15px] leading-6 text-[var(--color-brand-graphite)]">Загружаем статус приза...</p>
        </section>
      )}

      {Boolean(error) && <ErrorMessage message={getErrorMessage(error, "Не удалось загрузить статус приза")} />}

      {isRedeemed && redemption && (
        <section className="rounded-[var(--radius-lg)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[#eaf7ee] text-[#237a3b]">
            <CheckCircle2 className="h-5 w-5" aria-hidden />
          </div>
          <h2 className="mt-4 text-[22px] font-medium leading-7 text-[var(--color-brand-ink)]">Приз получен</h2>
          <p className="mt-2 text-[15px] leading-6 text-[var(--color-brand-graphite)]">
            Тип приза: {getRewardTypeLabel(redemption.redeemed_reward_type)}.
          </p>
          {redemption.redeemed_at && (
            <p className="mt-1 text-[14px] leading-5 text-[var(--color-brand-muted)]">
              Выдан: {new Date(redemption.redeemed_at).toLocaleString("ru-RU")}
            </p>
          )}
        </section>
      )}

      {!isRedeemed && eligibility && eligibility.status === "locked" && effectiveDirectionId !== null && (
        <section className="rounded-[var(--radius-lg)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
          <h2 className="text-[22px] font-medium leading-7 text-[var(--color-brand-ink)]">Продолжайте играть</h2>
          <p className="mt-2 text-[15px] leading-6 text-[var(--color-brand-graphite)]">
            Вернитесь к заданиям направления и проходите игры в удобном темпе.
          </p>
          <Button href={routes.eventDirectionGames(eventId, effectiveDirectionId)} variant="secondary" className="mt-5 min-h-11 px-5 text-[15px]">
            К играм
          </Button>
        </section>
      )}
    </main>
  );
}

export function RewardQrSkeleton() {
  return (
    <aside className="rounded-[var(--radius-lg)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
      <div className="h-11 w-11 animate-pulse rounded-[var(--radius-md)] bg-[var(--color-brand-panel)]" />
      <div className="mt-4 h-7 w-40 animate-pulse rounded bg-[var(--color-brand-panel)]" />
      <div className="mt-3 space-y-2">
        <div className="h-4 w-full animate-pulse rounded bg-[var(--color-brand-panel)]" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-[var(--color-brand-panel)]" />
      </div>
    </aside>
  );
}

export function RewardQrPanel({
  canGenerateQr,
  generateQrError,
  qrPayload,
  visibleQr,
}: {
  canGenerateQr: boolean;
  generateQrError: unknown;
  qrPayload: string;
  visibleQr: RewardQrDTO | null;
}) {
  return (
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

      {Boolean(generateQrError) && (
        <ErrorMessage className="mt-4" message={getErrorMessage(generateQrError, "Не удалось создать QR")} />
      )}
    </aside>
  );
}
