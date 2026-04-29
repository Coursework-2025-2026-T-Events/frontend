import type { RefObject } from "react";
import { Camera, CheckCircle2, ClipboardCheck, QrCode, RotateCcw, XCircle } from "lucide-react";
import clsx from "clsx";
import Button from "@/components/ui/Button";
import ErrorMessage from "@/components/ui/ErrorMessage";
import Input from "@/components/ui/Input";
import type { QrStatus, RedemptionPreviewDTO, RewardRedemptionDTO } from "@/lib/api/types";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { getEligibilityStatusLabel, getQrStatusLabel, getStanderRewardTypeLabel } from "./standerScan";

function qrStatusClassName(status: QrStatus): string {
  if (status === "active") return "bg-[#eaf7ee] text-[#237a3b]";
  if (status === "redeemed") return "bg-[#fff7cf] text-[var(--color-brand-ink)]";
  return "bg-[#fdecec] text-[#b42318]";
}

export function StanderScanHero() {
  return (
    <section className="overflow-hidden rounded-[var(--radius-lg)] bg-white shadow-[var(--shadow-card)]">
      <div className="p-4 sm:p-8 lg:p-10">
        <span className="inline-flex rounded-full bg-[var(--color-brand-yellow)] px-3 py-1 text-[13px] font-medium leading-[18px] text-[var(--color-brand-ink)]">
          Стойка выдачи
        </span>
        <h1 className="mt-4 max-w-3xl text-balance text-[30px] font-bold leading-9 text-[var(--color-brand-ink)] sm:mt-5 sm:text-[44px] sm:leading-[48px]">
          Сканирование QR-кодов
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-6 text-[var(--color-brand-graphite)]">
          Проверьте QR участника и подтвердите выдачу мерча после сверки данных.
        </p>
      </div>
    </section>
  );
}

export function StanderScanInputPanel({
  isCameraActive,
  isPreviewPending,
  tokenInput,
  videoRef,
  onManualSubmit,
  onStartCamera,
  onStopCamera,
  onTokenInputChange,
}: {
  isCameraActive: boolean;
  isPreviewPending: boolean;
  tokenInput: string;
  videoRef: RefObject<HTMLVideoElement | null>;
  onManualSubmit: () => void;
  onStartCamera: () => void;
  onStopCamera: () => void;
  onTokenInputChange: (value: string) => void;
}) {
  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="overflow-hidden rounded-[var(--radius-lg)] bg-white shadow-[var(--shadow-card)]">
        <div className="relative bg-[var(--color-brand-ink)]">
          <video ref={videoRef} className="aspect-video w-full object-cover" muted playsInline />
          {!isCameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[rgba(16,17,20,0.72)] px-6 text-center text-white">
              <Camera className="h-9 w-9" aria-hidden />
              <p className="mt-3 text-[15px] leading-6">Включите камеру, чтобы считать QR-код участника.</p>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:p-5">
          <Button onClick={onStartCamera} disabled={isCameraActive || isPreviewPending} className="min-h-11 px-5 text-[15px]">
            {isCameraActive ? "Камера активна" : "Включить камеру"}
          </Button>
          <Button variant="secondary" onClick={onStopCamera} disabled={!isCameraActive} className="min-h-11 px-5 text-[15px]">
            Остановить
          </Button>
        </div>
      </div>

      <aside className="rounded-[var(--radius-lg)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-panel)] text-[var(--color-brand-ink)]">
          <QrCode className="h-5 w-5" aria-hidden />
        </div>
        <h2 className="mt-4 text-[22px] font-medium leading-7 text-[var(--color-brand-ink)]">Ручная проверка</h2>
        <p className="mt-2 text-[15px] leading-6 text-[var(--color-brand-graphite)]">
          Используйте ее, если камера недоступна.
        </p>
        <div className="mt-5 space-y-3">
          <Input
            label="Ручной код выдачи"
            value={tokenInput}
            onChange={(event) => onTokenInputChange(event.target.value)}
            placeholder="A7C3-42K9"
          />
          <Button onClick={onManualSubmit} disabled={!tokenInput.trim() || isPreviewPending} className="min-h-11 w-full px-5 text-[15px]">
            {isPreviewPending ? "Проверяем..." : "Проверить код"}
          </Button>
        </div>
      </aside>
    </section>
  );
}

export function StanderScanErrors({
  cameraError,
  previewError,
  tokenError,
}: {
  cameraError: string | null;
  previewError: unknown;
  tokenError: string | null;
}) {
  return (
    <>
      {cameraError && <ErrorMessage title="Камера недоступна" message={cameraError} />}
      {tokenError && <ErrorMessage title="Код не распознан" message={tokenError} />}
      {previewError && (
        <ErrorMessage
          title="Ошибка проверки QR"
          message={getErrorMessage(previewError, "Не удалось проверить QR-код")}
        />
      )}
    </>
  );
}

export function RedemptionPreviewPanel({
  canConfirm,
  confirmError,
  isConfirmPending,
  preview,
  onCancel,
  onConfirm,
}: {
  canConfirm: boolean;
  confirmError: unknown;
  isConfirmPending: boolean;
  preview: RedemptionPreviewDTO;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <section className="rounded-[var(--radius-lg)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className={clsx("inline-flex rounded-full px-3 py-1 text-[13px] font-medium leading-[18px]", qrStatusClassName(preview.qr_status))}>
            {getQrStatusLabel(preview.qr_status)}
          </span>
          <h2 className="mt-4 text-[26px] font-bold leading-8 text-[var(--color-brand-ink)] sm:text-[32px] sm:leading-9">
            Проверьте выдачу
          </h2>
          <p className="mt-2 text-[15px] leading-6 text-[var(--color-brand-graphite)]">
            Подтверждайте только после сверки участника и типа приза.
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-panel)] text-[var(--color-brand-ink)]">
          <ClipboardCheck className="h-6 w-6" aria-hidden />
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <InfoItem label="Участник" value={`${preview.full_name} #${preview.user_id}`} />
        <InfoItem label="Мероприятие" value={preview.event_title} />
        <InfoItem label="Направление" value={`#${preview.direction_id}`} />
        <InfoItem label="Тип приза" value={getStanderRewardTypeLabel(preview.reward_type)} />
        <InfoItem label="Право на приз" value={getEligibilityStatusLabel(preview.eligibility_status)} />
        <InfoItem label="QR-код" value={getQrStatusLabel(preview.qr_status)} />
      </div>

      {preview.already_redeemed && (
        <div className="mt-5 rounded-[var(--radius-md)] bg-[#fff7cf] p-4 text-[15px] leading-6 text-[var(--color-brand-ink)]">
          Приз уже был выдан этому участнику на данном мероприятии.
        </div>
      )}

      {Boolean(confirmError) && (
        <ErrorMessage
          className="mt-5"
          title="Ошибка выдачи"
          message={getErrorMessage(confirmError, "Не удалось подтвердить выдачу")}
        />
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button onClick={onConfirm} disabled={!canConfirm || isConfirmPending} className="min-h-12 px-6 text-[15px]">
          {isConfirmPending ? "Выдаем..." : "Подтвердить выдачу"}
        </Button>
        <Button variant="secondary" onClick={onCancel} className="min-h-12 gap-2 px-6 text-[15px]">
          <XCircle className="h-4 w-4" aria-hidden />
          Отмена
        </Button>
      </div>
    </section>
  );
}

export function RedemptionConfirmedPanel({
  redemption,
  onNext,
}: {
  redemption: RewardRedemptionDTO;
  onNext: () => void;
}) {
  return (
    <section className="rounded-[var(--radius-lg)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-[#eaf7ee] text-[#237a3b]">
        <CheckCircle2 className="h-6 w-6" aria-hidden />
      </div>
      <h2 className="mt-4 text-[26px] font-bold leading-8 text-[var(--color-brand-ink)] sm:text-[32px] sm:leading-9">
        Выдача подтверждена
      </h2>
      <p className="mt-2 text-[15px] leading-6 text-[var(--color-brand-graphite)]">
        Запись сохранена в журнале выдачи призов.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <InfoItem label="Участник" value={redemption.full_name} />
        <InfoItem label="Тип приза" value={getStanderRewardTypeLabel(redemption.reward_type)} />
        <InfoItem label="ID выдачи" value={redemption.redemption_id} monospace />
        <InfoItem label="Время" value={new Date(redemption.created_at).toLocaleString("ru-RU")} />
      </div>

      <Button className="mt-6 min-h-12 gap-2 px-6 text-[15px]" onClick={onNext}>
        <RotateCcw className="h-4 w-4" aria-hidden />
        Следующий участник
      </Button>
    </section>
  );
}

function InfoItem({ label, value, monospace = false }: { label: string; value: string | number; monospace?: boolean }) {
  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--color-brand-panel)] px-4 py-3">
      <p className="text-[13px] leading-4 text-[var(--color-brand-muted)]">{label}</p>
      <p className={clsx("mt-1 break-words text-[15px] leading-5 text-[var(--color-brand-ink)]", monospace && "font-mono")}>
        {value}
      </p>
    </div>
  );
}
