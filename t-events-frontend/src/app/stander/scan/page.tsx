"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import { useMutation } from "@tanstack/react-query";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import ErrorMessage from "@/components/ui/ErrorMessage";
import PageHeader from "@/components/ui/PageHeader";
import RequireAuth from "@/features/auth/RequireAuth";
import { rewardApi } from "@/features/reward/api";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { extractSignedToken } from "@/lib/qrToken";
import type { QrStatus, RedemptionPreviewDTO, RewardRedemptionDTO, RewardStatus, RewardType } from "@/lib/api/types";

type Step = "scan" | "preview" | "confirmed" | "error";

function rewardTypeLabel(type: RewardType): string {
  return type === "big" ? "Большой приз" : "Малый приз";
}

function qrStatusBadge(status: QrStatus) {
  if (status === "active") return <Badge variant="success">Можно выдать</Badge>;
  if (status === "redeemed") return <Badge variant="warning">Уже использован</Badge>;
  if (status === "expired") return <Badge variant="danger">Истек</Badge>;
  return <Badge variant="danger">Отменен</Badge>;
}

function qrStatusLabel(status: QrStatus): string {
  if (status === "active") return "действует";
  if (status === "redeemed") return "уже использован";
  if (status === "expired") return "истек";
  return "отменен";
}

function eligibilityStatusLabel(status: RewardStatus): string {
  if (status === "locked") return "приз пока недоступен";
  if (status === "small_unlocked") return "доступен малый приз";
  if (status === "big_unlocked") return "доступен большой приз";
  return "приз уже получен";
}

function vibrate(pattern: VibratePattern) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

export default function StanderScanPage() {
  const [step, setStep] = useState<Step>("scan");
  const [tokenInput, setTokenInput] = useState("");
  const [preview, setPreview] = useState<RedemptionPreviewDTO | null>(null);
  const [confirmedRedemption, setConfirmedRedemption] = useState<RewardRedemptionDTO | null>(null);
  const [currentToken, setCurrentToken] = useState("");
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
    mutationFn: (token: string) => rewardApi.previewRedemption(token),
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
    mutationFn: (token: string) => rewardApi.confirmRedemption(token),
    onSuccess: (res) => {
      vibrate([40, 30, 80]);
      setConfirmedRedemption(res.data);
      setStep("confirmed");
      setCurrentToken("");
      setTokenInput("");
      stopCamera();
    },
  });

  const submitQrPayload = useCallback(
    (payload: string) => {
      const token = extractSignedToken(payload);
      if (!token) {
        setTokenError("Введите токен или отсканируйте QR-код.");
        return;
      }

      setTokenError(null);
      setCurrentToken(token);
      setTokenInput(token);
      setPreview(null);
      setConfirmedRedemption(null);
      setStep("scan");
      confirmMutation.reset();
      previewMutation.mutate(token);
    },
    [confirmMutation, previewMutation]
  );

  const startCamera = async () => {
    setCameraError(null);
    setTokenError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Браузер не поддерживает доступ к камере. Введите токен вручную.");
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
      setCameraError("Не удалось запустить камеру. Проверьте разрешения браузера или введите токен вручную.");
      setIsCameraActive(false);
    }
  };

  useEffect(() => {
    if (loadedUrlTokenRef.current) return;
    loadedUrlTokenRef.current = true;
    const tokenFromUrl = extractSignedToken(window.location.href);
    if (tokenFromUrl) {
      window.setTimeout(() => submitQrPayload(tokenFromUrl), 0);
    }

    return () => stopCamera();
  }, [stopCamera, submitQrPayload]);

  const handleManualSubmit = () => submitQrPayload(tokenInput);

  const handleReset = () => {
    stopCamera();
    setStep("scan");
    setTokenInput("");
    setPreview(null);
    setConfirmedRedemption(null);
    setCurrentToken("");
    setCameraError(null);
    setTokenError(null);
    previewMutation.reset();
    confirmMutation.reset();
  };

  const canConfirm = Boolean(currentToken) && preview?.qr_status === "active" && !preview.already_redeemed;

  return (
    <RequireAuth allowedRoles={["stander", "admin"]}>
      <Container>
        <div className="mx-auto mt-8 max-w-4xl space-y-6">
          <PageHeader title="Сканирование QR" />

          {(step === "scan" || step === "error") && (
            <Card>
              <Typography as="h2" size="lg" weight="bold">
                Сканер выдачи
              </Typography>
              <Typography className="mt-2 text-neutral-600" size="sm">
                Наведите камеру на QR-код участника. Если камера недоступна, вставьте содержимое QR вручную.
              </Typography>

              <div className="mt-4 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-950">
                <video ref={videoRef} className="aspect-video w-full object-cover" muted playsInline />
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <Button onClick={startCamera} disabled={isCameraActive || previewMutation.isPending}>
                  {isCameraActive ? "Камера активна" : "Включить камеру"}
                </Button>
                <Button variant="secondary" onClick={stopCamera} disabled={!isCameraActive}>
                  Остановить камеру
                </Button>
              </div>

              {cameraError && (
                <ErrorMessage className="mt-3" title="Камера недоступна" message={cameraError} />
              )}

              <div className="mt-5 space-y-3">
                <Input
                  label="Токен или ссылка из QR-кода"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="eyJhbGciOi... или https://.../stander/scan?token=..."
                />
                <Button onClick={handleManualSubmit} disabled={!tokenInput.trim() || previewMutation.isPending}>
                  {previewMutation.isPending ? "Проверка..." : "Проверить QR"}
                </Button>
              </div>

              {tokenError && (
                <ErrorMessage className="mt-3" title="QR-код не распознан" message={tokenError} />
              )}

              {step === "error" && previewMutation.error && (
                <ErrorMessage
                  className="mt-4"
                  title="Ошибка проверки QR"
                  message={getErrorMessage(previewMutation.error, "Не удалось проверить QR-код")}
                />
              )}
            </Card>
          )}

          {step === "preview" && preview && (
            <Card>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Typography as="h2" size="lg" weight="bold">
                    Информация о выдаче
                  </Typography>
                  <Typography className="mt-1 text-neutral-600" size="sm">
                    Проверьте данные перед подтверждением. QR одноразовый.
                  </Typography>
                </div>
                {qrStatusBadge(preview.qr_status)}
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <InfoItem label="Участник" value={`${preview.full_name} #${preview.user_id}`} />
                <InfoItem label="Мероприятие" value={preview.event_title} />
                <InfoItem label="Направление" value={`#${preview.direction_id}`} />
                <InfoItem label="Тип приза" value={rewardTypeLabel(preview.reward_type)} />
                <InfoItem label="Статус права на приз" value={eligibilityStatusLabel(preview.eligibility_status)} />
                <InfoItem label="Статус QR-кода" value={qrStatusLabel(preview.qr_status)} />
              </div>

              {preview.already_redeemed && (
                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <Typography className="font-medium text-amber-800" size="sm">
                    Приз уже был выдан этому участнику на данном мероприятии.
                  </Typography>
                  <Typography className="mt-1 text-amber-700" size="sm">
                    Повторная выдача невозможна.
                  </Typography>
                </div>
              )}

              {confirmMutation.error && (
                <ErrorMessage
                  className="mt-4"
                  title="Ошибка выдачи"
                  message={getErrorMessage(confirmMutation.error, "Не удалось подтвердить выдачу")}
                />
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  onClick={() => confirmMutation.mutate(currentToken)}
                  disabled={!canConfirm || confirmMutation.isPending}
                >
                  {confirmMutation.isPending ? "Выдача..." : "Выдать приз"}
                </Button>
                <Button variant="secondary" onClick={handleReset}>
                  Отмена
                </Button>
              </div>
            </Card>
          )}

          {step === "confirmed" && confirmedRedemption && (
            <Card>
              <Typography as="h2" size="lg" weight="bold" className="text-green-800">
                Приз выдан
              </Typography>
              <Typography size="sm" className="mt-1 text-green-700">
                Выдача успешно зафиксирована.
              </Typography>

              <div className="mt-5 grid gap-4 rounded-lg bg-neutral-50 p-4 md:grid-cols-2">
                <InfoItem label="Участник" value={confirmedRedemption.full_name} />
                <InfoItem label="Тип приза" value={rewardTypeLabel(confirmedRedemption.reward_type)} />
                <InfoItem label="Идентификатор выдачи" value={confirmedRedemption.redemption_id} monospace />
                <InfoItem label="Время" value={new Date(confirmedRedemption.created_at).toLocaleString("ru-RU")} />
              </div>

              <Button className="mt-5" onClick={handleReset}>
                Следующий участник
              </Button>
            </Card>
          )}
        </div>
      </Container>
    </RequireAuth>
  );
}

function InfoItem({ label, value, monospace = false }: { label: string; value: string; monospace?: boolean }) {
  return (
    <div>
      <Typography size="sm" className="text-neutral-500">
        {label}
      </Typography>
      <Typography size="sm" weight="medium" className={monospace ? "font-mono text-neutral-700" : "text-neutral-900"}>
        {value}
      </Typography>
    </div>
  );
}
