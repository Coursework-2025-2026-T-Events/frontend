"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import { useMutation } from "@tanstack/react-query";
import { Camera, CheckCircle2, ClipboardCheck, QrCode, RotateCcw, XCircle } from "lucide-react";
import clsx from "clsx";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import ErrorMessage from "@/components/ui/ErrorMessage";
import Input from "@/components/ui/Input";
import RequireAuth from "@/features/auth/RequireAuth";
import { rewardApi, type RedemptionTokenRequest } from "@/features/reward/api";
import type { QrStatus, RedemptionPreviewDTO, RewardRedemptionDTO, RewardStatus, RewardType } from "@/lib/api/types";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { extractSignedToken } from "@/lib/qrToken";

type Step = "scan" | "preview" | "confirmed" | "error";

function rewardTypeLabel(type: RewardType): string {
  return type === "big" ? "Большой приз" : "Малый приз";
}

function qrStatusLabel(status: QrStatus): string {
  if (status === "active") return "Можно выдать";
  if (status === "redeemed") return "Уже использован";
  if (status === "expired") return "Истёк";
  return "Отменён";
}

function qrStatusClassName(status: QrStatus) {
  if (status === "active") return "bg-[#eaf7ee] text-[#237a3b]";
  if (status === "redeemed") return "bg-[#fff7cf] text-[var(--color-brand-ink)]";
  return "bg-[#fdecec] text-[#b42318]";
}

function eligibilityStatusLabel(status: RewardStatus): string {
  if (status === "locked") return "Приз пока недоступен";
  if (status === "small_unlocked") return "Доступен малый приз";
  if (status === "big_unlocked") return "Доступен большой приз";
  return "Приз уже получен";
}

function vibrate(pattern: VibratePattern) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

function isValidRedeemCode(value: string) {
  const compact = value.replace(/[\s-]/g, "");
  return /^[A-Za-z0-9]{6,16}$/.test(compact);
}

function buildQrRedemptionRequest(payload: string): RedemptionTokenRequest | null {
  const value = payload.trim();
  if (!value) return null;

  const token = extractSignedToken(value);
  if (!token) return null;
  return { signed_token: token };
}

function buildManualRedemptionRequest(code: string): RedemptionTokenRequest | null {
  const value = code.trim();
  if (!value || !isValidRedeemCode(value)) return null;
  return { redeem_code: value };
}

export default function StanderScanPage() {
  const [step, setStep] = useState<Step>("scan");
  const [tokenInput, setTokenInput] = useState("");
  const [preview, setPreview] = useState<RedemptionPreviewDTO | null>(null);
  const [confirmedRedemption, setConfirmedRedemption] = useState<RewardRedemptionDTO | null>(null);
  const [currentRequest, setCurrentRequest] = useState<RedemptionTokenRequest | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerControlsRef = useRef<IScannerControls | null>(null);
  const loadedUrlTokenRef = useRef(false);

  const stopCamera = useCallback(() => {
    scannerControlsRef.current?.stop();
    scannerControlsRef.current = null;
    setIsCameraActive(false);
  }, []);

  const previewMutation = useMutation({
    mutationFn: (payload: RedemptionTokenRequest) => rewardApi.previewRedemption(payload),
    onSuccess: (res) => {
      vibrate(40);
      setPreview(res.data);
      setStep("preview");
      stopCamera();
    },
    onError: () => {
      vibrate([40, 30, 40]);
      setStep("error");
      stopCamera();
    },
  });

  const confirmMutation = useMutation({
    mutationFn: (payload: RedemptionTokenRequest) => rewardApi.confirmRedemption(payload),
    onSuccess: (res) => {
      vibrate([40, 30, 80]);
      setConfirmedRedemption(res.data);
      setStep("confirmed");
      setCurrentRequest(null);
      setTokenInput("");
      stopCamera();
    },
  });

  const submitQrPayload = useCallback(
    (payload: string) => {
      const request = buildQrRedemptionRequest(payload);
      if (!request) {
        setTokenError("QR-код не содержит токен выдачи.");
        return;
      }

      setTokenError(null);
      setCurrentRequest(request);
      setPreview(null);
      setConfirmedRedemption(null);
      setStep("scan");
      confirmMutation.reset();
      previewMutation.mutate(request);
    },
    [confirmMutation, previewMutation]
  );

  const submitManualRedeemCode = useCallback(
    (code: string) => {
      const request = buildManualRedemptionRequest(code);
      if (!request) {
        setTokenError("Введите ручной код выдачи, например A7C3-42K9.");
        return;
      }

      setTokenError(null);
      setCurrentRequest(request);
      setPreview(null);
      setConfirmedRedemption(null);
      setStep("scan");
      confirmMutation.reset();
      previewMutation.mutate(request);
    },
    [confirmMutation, previewMutation]
  );

  const startCamera = async () => {
    setCameraError(null);
    setTokenError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Браузер не поддерживает доступ к камере. Введите ручной код выдачи.");
      return;
    }

    if (!videoRef.current) return;

    try {
      stopCamera();
      const reader = new BrowserQRCodeReader();
      const controls = await reader.decodeFromVideoDevice(undefined, videoRef.current, (result) => {
        const text = result?.getText();
        if (!text || previewMutation.isPending) return;
        scannerControlsRef.current?.stop();
        submitQrPayload(text);
      });
      scannerControlsRef.current = controls;
      setIsCameraActive(true);
    } catch {
      setCameraError("Не удалось запустить камеру. Проверьте разрешения браузера или введите ручной код выдачи.");
      setIsCameraActive(false);
    }
  };

  useEffect(() => {
    if (loadedUrlTokenRef.current) return;
    loadedUrlTokenRef.current = true;
    const tokenFromUrl = extractSignedToken(window.location.href);
    if (tokenFromUrl) {
      window.setTimeout(() => submitQrPayload(window.location.href), 0);
    }

    return () => stopCamera();
  }, [stopCamera, submitQrPayload]);

  const handleManualSubmit = () => submitManualRedeemCode(tokenInput);

  const handleReset = () => {
    stopCamera();
    setStep("scan");
    setTokenInput("");
    setPreview(null);
    setConfirmedRedemption(null);
    setCurrentRequest(null);
    setCameraError(null);
    setTokenError(null);
    previewMutation.reset();
    confirmMutation.reset();
  };

  const canConfirm = Boolean(currentRequest) && preview?.qr_status === "active" && !preview.already_redeemed;

  return (
    <RequireAuth allowedRoles={["stander", "admin"]}>
      <div className="min-h-[calc(100vh-4rem)] bg-[var(--color-brand-mist)] pb-16">
        <Container>
          <div className="py-4 sm:py-10 lg:py-12">
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

            <div className="mt-5 space-y-4 sm:mt-6">
              {(step === "scan" || step === "error") && (
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
                      <Button onClick={startCamera} disabled={isCameraActive || previewMutation.isPending} className="min-h-11 px-5 text-[15px]">
                        {isCameraActive ? "Камера активна" : "Включить камеру"}
                      </Button>
                      <Button variant="secondary" onClick={stopCamera} disabled={!isCameraActive} className="min-h-11 px-5 text-[15px]">
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
                      Используйте её, если камера недоступна.
                    </p>
                    <div className="mt-5 space-y-3">
                      <Input
                        label="Ручной код выдачи"
                        value={tokenInput}
                        onChange={(event) => setTokenInput(event.target.value)}
                        placeholder="A7C3-42K9"
                      />
                      <Button onClick={handleManualSubmit} disabled={!tokenInput.trim() || previewMutation.isPending} className="min-h-11 w-full px-5 text-[15px]">
                        {previewMutation.isPending ? "Проверяем..." : "Проверить код"}
                      </Button>
                    </div>
                  </aside>
                </section>
              )}

              {cameraError && <ErrorMessage title="Камера недоступна" message={cameraError} />}
              {tokenError && <ErrorMessage title="Код не распознан" message={tokenError} />}
              {step === "error" && previewMutation.error && (
                <ErrorMessage
                  title="Ошибка проверки QR"
                  message={getErrorMessage(previewMutation.error, "Не удалось проверить QR-код")}
                />
              )}

              {step === "preview" && preview && (
                <section className="rounded-[var(--radius-lg)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <span className={clsx("inline-flex rounded-full px-3 py-1 text-[13px] font-medium leading-[18px]", qrStatusClassName(preview.qr_status))}>
                        {qrStatusLabel(preview.qr_status)}
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
                    <InfoItem label="Тип приза" value={rewardTypeLabel(preview.reward_type)} />
                    <InfoItem label="Право на приз" value={eligibilityStatusLabel(preview.eligibility_status)} />
                    <InfoItem label="QR-код" value={qrStatusLabel(preview.qr_status)} />
                  </div>

                  {preview.already_redeemed && (
                    <div className="mt-5 rounded-[var(--radius-md)] bg-[#fff7cf] p-4 text-[15px] leading-6 text-[var(--color-brand-ink)]">
                      Приз уже был выдан этому участнику на данном мероприятии.
                    </div>
                  )}

                  {confirmMutation.error && (
                    <ErrorMessage
                      className="mt-5"
                      title="Ошибка выдачи"
                      message={getErrorMessage(confirmMutation.error, "Не удалось подтвердить выдачу")}
                    />
                  )}

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Button
                      onClick={() => currentRequest && confirmMutation.mutate(currentRequest)}
                      disabled={!canConfirm || confirmMutation.isPending}
                      className="min-h-12 px-6 text-[15px]"
                    >
                      {confirmMutation.isPending ? "Выдаём..." : "Подтвердить выдачу"}
                    </Button>
                    <Button variant="secondary" onClick={handleReset} className="min-h-12 gap-2 px-6 text-[15px]">
                      <XCircle className="h-4 w-4" aria-hidden />
                      Отмена
                    </Button>
                  </div>
                </section>
              )}

              {step === "confirmed" && confirmedRedemption && (
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
                    <InfoItem label="Участник" value={confirmedRedemption.full_name} />
                    <InfoItem label="Тип приза" value={rewardTypeLabel(confirmedRedemption.reward_type)} />
                    <InfoItem label="ID выдачи" value={confirmedRedemption.redemption_id} monospace />
                    <InfoItem label="Время" value={new Date(confirmedRedemption.created_at).toLocaleString("ru-RU")} />
                  </div>

                  <Button className="mt-6 min-h-12 gap-2 px-6 text-[15px]" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4" aria-hidden />
                    Следующий участник
                  </Button>
                </section>
              )}
            </div>
          </div>
        </Container>
      </div>
    </RequireAuth>
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
